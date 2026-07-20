import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import {
  getPayPalAccessToken,
  requirePayPalCredentials,
  resolvePayPalBaseUrl,
  verifyPayPalWebhookSignature,
} from '../_shared/paypal.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type, paypal-transmission-id, paypal-transmission-time, paypal-cert-url, paypal-auth-algo, paypal-transmission-sig',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const webhookData = JSON.parse(rawBody);
    const eventId = webhookData.id;
    const eventType = webhookData.event_type;

    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')?.trim();
    if (!webhookId) {
      console.error('PAYPAL_WEBHOOK_ID missing — rejecting webhook');
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 503,
      });
    }

    const { clientId, clientSecret } = requirePayPalCredentials();
    const { baseUrl } = resolvePayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);

    const verified = await verifyPayPalWebhookSignature({
      baseUrl,
      accessToken,
      webhookId,
      headers: req.headers,
      rawBody,
    });

    if (!verified) {
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Idempotency: skip if event already processed
    const { data: existingEvent } = await supabaseService
      .from('payment_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existingEvent) {
      return new Response(JSON.stringify({ status: 'duplicate_ignored' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    await supabaseService.from('payment_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      provider: 'paypal',
      payload: webhookData,
    });

    const failTypes = ['PAYMENT.CAPTURE.DENIED', 'CHECKOUT.ORDER.VOIDED'];
    if (failTypes.includes(eventType) || String(eventType).includes('CANCELLED')) {
      const orderId = webhookData.resource?.id;
      if (orderId) {
        await supabaseService
          .from('coin_transactions')
          .update({
            type: 'purchase_failed',
            metadata: { failed_event: eventType, event_id: eventId },
          })
          .eq('reference_id', orderId)
          .eq('type', 'purchase_pending');
      }
      return new Response(JSON.stringify({ status: 'failed_recorded', entitlementCreated: false }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    if (
      eventType === 'CHECKOUT.ORDER.APPROVED' ||
      eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
      eventType === 'CHECKOUT.ORDER.COMPLETED'
    ) {
      const orderId = webhookData.resource?.id || webhookData.resource?.supplementary_data?.related_ids?.order_id;
      if (!orderId) {
        throw new Error('No order id in webhook');
      }

      const { data: pendingTransaction, error: fetchError } = await supabaseService
        .from('coin_transactions')
        .select('*')
        .eq('reference_id', orderId)
        .eq('type', 'purchase_pending')
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      if (!pendingTransaction) {
        // Already completed or unknown — idempotent success
        const { data: completed } = await supabaseService
          .from('coin_transactions')
          .select('id')
          .eq('reference_id', orderId)
          .eq('type', 'purchase')
          .maybeSingle();

        return new Response(
          JSON.stringify({
            status: completed ? 'already_fulfilled' : 'no_pending',
            entitlementCreated: false,
          }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          }
        );
      }

      const { error: updateError } = await supabaseService
        .from('coin_transactions')
        .update({
          type: 'purchase',
          description: `PayPal coin purchase completed: ${pendingTransaction.amount} coins`,
          metadata: {
            ...pendingTransaction.metadata,
            webhook_event_id: eventId,
            completed_at: new Date().toISOString(),
          },
        })
        .eq('id', pendingTransaction.id)
        .eq('type', 'purchase_pending');

      if (updateError) {
        throw updateError;
      }

      // Credit wallet only after verified completion (service role)
      const { data: wallet } = await supabaseService
        .from('coin_wallets')
        .select('balance')
        .eq('user_id', pendingTransaction.user_id)
        .maybeSingle();

      const nextBalance = (wallet?.balance || 0) + pendingTransaction.amount;
      await supabaseService.from('coin_wallets').upsert({
        user_id: pendingTransaction.user_id,
        balance: nextBalance,
        updated_at: new Date().toISOString(),
      });

      return new Response(
        JSON.stringify({ status: 'fulfilled', entitlementCreated: true, eventId }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    return new Response(JSON.stringify({ status: 'ignored', eventType }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    console.error('Error in paypal-coin-webhook:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});

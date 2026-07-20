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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const rawBody = await req.text();
    const webhookEvent = JSON.parse(rawBody);
    const eventId = webhookEvent.id;
    const eventType = webhookEvent.event_type;

    const webhookId = Deno.env.get('PAYPAL_WEBHOOK_ID')?.trim();
    if (!webhookId) {
      return new Response(JSON.stringify({ error: 'Webhook not configured' }), {
        status: 503,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    const { data: existing } = await supabase
      .from('payment_webhook_events')
      .select('id')
      .eq('event_id', eventId)
      .maybeSingle();

    if (existing) {
      return new Response(JSON.stringify({ status: 'duplicate_ignored' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    await supabase.from('payment_webhook_events').insert({
      event_id: eventId,
      event_type: eventType,
      provider: 'paypal',
      payload: webhookEvent,
    });

    const customId = webhookEvent.resource?.custom_id || '';
    const userId = String(customId).split('|')[0];
    const subscriptionId = webhookEvent.resource?.id;

    switch (eventType) {
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
      case 'PAYMENT.SALE.COMPLETED': {
        if (userId) {
          await supabase.from('user_subscriptions').upsert({
            user_id: userId,
            plan: 'premium',
            status: 'active',
            paypal_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          });
        }
        break;
      }
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        if (userId) {
          await supabase
            .from('user_subscriptions')
            .update({ status: 'cancelled', updated_at: new Date().toISOString() })
            .eq('user_id', userId)
            .eq('paypal_subscription_id', subscriptionId);
        }
        break;
      }
      default:
        break;
    }

    return new Response(JSON.stringify({ status: 'ok', eventType }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('paypal-webhook:', error);
    return new Response(JSON.stringify({ error: 'Webhook processing failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

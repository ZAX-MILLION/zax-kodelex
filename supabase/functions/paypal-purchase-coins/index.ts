import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getCoinPackage } from '../_shared/catalog.ts';
import {
  getPayPalAccessToken,
  requirePayPalCredentials,
  resolvePayPalBaseUrl,
} from '../_shared/paypal.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (Deno.env.get('DISABLE_PAYMENTS') === 'true' || Deno.env.get('APP_ENV') === 'demo') {
      return new Response(JSON.stringify({ error: 'Payments disabled', code: 'DEMO_BLOCKED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = await req.json();
    const packageId = String(body.package_id || body.productId || '');
    const catalog = getCoinPackage(packageId);

    if (!catalog) {
      return new Response(JSON.stringify({ error: 'Invalid product', code: 'INVALID_PRODUCT' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Reject client-tampered amounts/coins
    if (body.amount !== undefined && Math.abs(Number(body.amount) - catalog.amountUsd) > 0.001) {
      return new Response(JSON.stringify({ error: 'Amount mismatch', code: 'AMOUNT_MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (body.coins !== undefined && Number(body.coins) !== catalog.coins) {
      return new Response(JSON.stringify({ error: 'Coin amount mismatch', code: 'AMOUNT_MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    if (body.currency && String(body.currency).toUpperCase() !== catalog.currency) {
      return new Response(JSON.stringify({ error: 'Currency mismatch', code: 'CURRENCY_MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { clientId, clientSecret } = requirePayPalCredentials();
    const { baseUrl, mode } = resolvePayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);

    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'https://zaxmillion.com';

    const orderData = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: catalog.currency,
            value: catalog.amountUsd.toFixed(2),
          },
          description: catalog.label,
          custom_id: `${user.id}|${catalog.id}|${Date.now()}`,
        },
      ],
      application_context: {
        return_url: `${origin}/coins/success`,
        cancel_url: `${origin}/coins/cancel`,
        brand_name: 'Zax Million',
        user_action: 'PAY_NOW',
      },
    };

    const orderResponse = await fetch(`${baseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error('PayPal order creation failed:', errorText);
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    await supabaseService.from('coin_transactions').insert({
      user_id: user.id,
      amount: catalog.coins,
      type: 'purchase_pending',
      context: 'paypal_order',
      description: `PayPal coin purchase pending: ${catalog.label}`,
      reference_id: order.id,
      metadata: {
        package_id: catalog.id,
        paypal_order_id: order.id,
        amount_usd: catalog.amountUsd,
        currency: catalog.currency,
        mode,
        status: 'pending',
      },
    });

    return new Response(
      JSON.stringify({
        order_id: order.id,
        status: order.status,
        links: order.links,
        amount_usd: catalog.amountUsd,
        currency: catalog.currency,
        mode,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in paypal-purchase-coins:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const code = message.includes('credentials') ? 'CONFIG_INCOMPLETE' : 'INTERNAL';
    return new Response(JSON.stringify({ error: message, code }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: code === 'CONFIG_INCOMPLETE' ? 503 : 500,
    });
  }
});

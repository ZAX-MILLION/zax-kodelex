import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getLicenseProduct } from '../_shared/catalog.ts';
import {
  getPayPalAccessToken,
  requirePayPalCredentials,
  resolvePayPalBaseUrl,
} from '../_shared/paypal.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

/**
 * Trusted PayPal order creation for theme/source licenses.
 * Amounts come only from server catalogue — never from the client.
 * License rows are created only after verified webhook completion (see paypal-coin-webhook pattern /
 * dedicated license webhook handler using purchases.status = completed).
 */
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

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseClient.auth.getUser(token);

    if (!user?.email) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = await req.json();
    const productId = String(body.productId || body.product_id || '');
    const product = getLicenseProduct(productId);

    if (!product) {
      return new Response(JSON.stringify({ error: 'Invalid product', code: 'INVALID_PRODUCT' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    if (body.amount !== undefined && Math.abs(Number(body.amount) - product.amountUsd) > 0.001) {
      return new Response(JSON.stringify({ error: 'Amount mismatch', code: 'AMOUNT_MISMATCH' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const { clientId, clientSecret } = requirePayPalCredentials();
    const { baseUrl, mode } = resolvePayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'https://zaxmillion.com';

    const orderPayload = {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: product.currency,
            value: product.amountUsd.toFixed(2),
          },
          description: product.label,
          custom_id: `${user.id}|${product.id}|${Date.now()}`,
          soft_descriptor: product.sku.slice(0, 22),
        },
      ],
      application_context: {
        return_url: `${origin}/buy/success`,
        cancel_url: `${origin}/buy/cancel`,
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
      body: JSON.stringify(orderPayload),
    });

    if (!orderResponse.ok) {
      console.error(await orderResponse.text());
      throw new Error('Failed to create PayPal order');
    }

    const order = await orderResponse.json();

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Ensure customer row exists (purchases.customer_id FK)
    let customerId: string | null = null;
    const { data: existingCustomer } = await supabaseService
      .from('customers')
      .select('id')
      .eq('email', user.email)
      .maybeSingle();

    if (existingCustomer?.id) {
      customerId = existingCustomer.id;
    } else {
      const { data: created, error: custErr } = await supabaseService
        .from('customers')
        .insert({ email: user.email })
        .select('id')
        .single();
      if (custErr) throw custErr;
      customerId = created.id;
    }

    const { data: purchase, error } = await supabaseService
      .from('purchases')
      .insert({
        customer_id: customerId,
        amount: product.amountUsd,
        currency: product.currency,
        status: 'pending',
        payment_method: 'paypal',
        payment_intent_id: order.id,
        metadata: {
          product_id: product.id,
          product_sku: product.sku,
          paypal_order_id: order.id,
          auth_user_id: user.id,
          mode,
        },
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to store pending purchase', error);
      throw new Error('Failed to store pending purchase');
    }

    return new Response(
      JSON.stringify({
        order_id: order.id,
        purchase_id: purchase?.id,
        amount_usd: product.amountUsd,
        currency: product.currency,
        mode,
        links: order.links,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('paypal-create-license-order:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    const code =
      message.includes('credentials') || message.includes('Live PayPal')
        ? 'CONFIG_INCOMPLETE'
        : 'INTERNAL';
    return new Response(JSON.stringify({ error: message, code }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: code === 'CONFIG_INCOMPLETE' ? 503 : 500,
    });
  }
});

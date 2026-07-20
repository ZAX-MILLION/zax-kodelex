import { serve } from 'https://deno.land/std@0.190.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import { getSubscriptionPlan } from '../_shared/catalog.ts';
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

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
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

    const supabaseUser = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );
    const token = authHeader.replace('Bearer ', '');
    const {
      data: { user },
    } = await supabaseUser.auth.getUser(token);
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized', code: 'UNAUTHORIZED' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    const body = await req.json();
    const catalogPlanId = String(body.planId || body.productId || '');
    const plan = getSubscriptionPlan(catalogPlanId);
    if (!plan) {
      return new Response(JSON.stringify({ error: 'Invalid plan', code: 'INVALID_PRODUCT' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // Map catalogue id → PayPal Billing Plan ID (configured in dashboard)
    const paypalPlanId =
      Deno.env.get(`PAYPAL_PLAN_${catalogPlanId.toUpperCase()}`) ||
      Deno.env.get('PAYPAL_PLAN_ID_MONTHLY') ||
      Deno.env.get('PAYPAL_PLAN_ID');

    if (!paypalPlanId) {
      return new Response(
        JSON.stringify({
          error: 'PayPal billing plan not configured for this product',
          code: 'CONFIG_INCOMPLETE',
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 503,
        }
      );
    }

    const { clientId, clientSecret } = requirePayPalCredentials();
    const { baseUrl, mode } = resolvePayPalBaseUrl();
    const accessToken = await getPayPalAccessToken(baseUrl, clientId, clientSecret);
    const origin = req.headers.get('origin') || Deno.env.get('SITE_URL') || 'https://zaxmillion.com';

    const subscriptionData = {
      plan_id: paypalPlanId,
      custom_id: `${user.id}|${plan.id}`,
      application_context: {
        brand_name: 'Zax Million',
        locale: 'en-US',
        shipping_preference: 'NO_SHIPPING',
        user_action: 'SUBSCRIBE_NOW',
        return_url: body.returnUrl || `${origin}/subscribe/success`,
        cancel_url: body.cancelUrl || `${origin}/subscribe/cancel`,
      },
    };

    const response = await fetch(`${baseUrl}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(subscriptionData),
    });

    if (!response.ok) {
      console.error(await response.text());
      throw new Error('PayPal subscription creation failed');
    }

    const subscription = await response.json();

    const supabaseService = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    await supabaseService.from('user_subscriptions').upsert({
      user_id: user.id,
      plan: 'premium',
      status: 'pending',
      paypal_subscription_id: subscription.id,
      metadata: {
        catalog_plan_id: plan.id,
        amount_usd: plan.amountUsd,
        currency: plan.currency,
        mode,
      },
      updated_at: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({
        ...subscription,
        catalog_plan_id: plan.id,
        amount_usd: plan.amountUsd,
        mode,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('paypal-subscribe:', error);
    const message = error instanceof Error ? error.message : 'Failed';
    const code = message.includes('credentials') || message.includes('Live PayPal')
      ? 'CONFIG_INCOMPLETE'
      : 'INTERNAL';
    return new Response(JSON.stringify({ error: message, code }), {
      status: code === 'CONFIG_INCOMPLETE' ? 503 : 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

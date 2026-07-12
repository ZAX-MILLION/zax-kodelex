import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// PayPal API Configuration
const PAYPAL_CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID');
const PAYPAL_CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET');
const PAYPAL_API_BASE = Deno.env.get('PAYPAL_ENVIRONMENT') === 'live' 
  ? 'https://api-m.paypal.com' 
  : 'https://api-m.sandbox.paypal.com';

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface SubscribeRequest {
  userId: string;
  planId: string;
  returnUrl: string;
  cancelUrl: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405, 
      headers: corsHeaders 
    });
  }

  try {
    const { userId, planId, returnUrl, cancelUrl }: SubscribeRequest = await req.json();

    if (!userId || !planId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { status: 400, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
      );
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken();
    if (!accessToken) {
      throw new Error('Failed to get PayPal access token');
    }

    // Create subscription
    const subscription = await createPayPalSubscription({
      planId,
      userId,
      returnUrl,
      cancelUrl,
      accessToken
    });

    return new Response(JSON.stringify(subscription), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error creating PayPal subscription:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to create subscription' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function getPayPalAccessToken(): Promise<string | null> {
  try {
    const auth = btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`);
    
    const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });

    if (!response.ok) {
      throw new Error(`PayPal auth failed: ${response.status}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('Error getting PayPal access token:', error);
    return null;
  }
}

async function createPayPalSubscription({
  planId,
  userId,
  returnUrl,
  cancelUrl,
  accessToken
}: {
  planId: string;
  userId: string;
  returnUrl: string;
  cancelUrl: string;
  accessToken: string;
}) {
  const subscriptionData = {
    plan_id: planId,
    custom_id: userId, // Store user ID for webhook processing
    application_context: {
      brand_name: 'Manga Reader Premium',
      locale: 'en-US',
      shipping_preference: 'NO_SHIPPING',
      user_action: 'SUBSCRIBE_NOW',
      payment_method: {
        payer_selected: 'PAYPAL',
        payee_preferred: 'IMMEDIATE_PAYMENT_REQUIRED',
      },
      return_url: returnUrl,
      cancel_url: cancelUrl,
    },
    subscriber: {
      name: {
        given_name: 'Premium',
        surname: 'User',
      },
    },
  };

  const response = await fetch(`${PAYPAL_API_BASE}/v1/billing/subscriptions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Prefer': 'return=representation',
    },
    body: JSON.stringify(subscriptionData),
  });

  if (!response.ok) {
    const errorData = await response.text();
    console.error('PayPal subscription creation failed:', errorData);
    throw new Error(`PayPal subscription creation failed: ${response.status}`);
  }

  return await response.json();
}

serve(handler);
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-paypal-transmission-id, x-paypal-cert-id, x-paypal-auth-algo, x-paypal-transmission-sig, x-paypal-transmission-time',
};

// Initialize Supabase client
const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type: string;
  summary: string;
  resource: {
    id: string;
    status?: string;
    billing_info?: {
      next_billing_time?: string;
      last_payment?: {
        amount: {
          currency_code: string;
          value: string;
        };
        time: string;
      };
    };
    plan_id?: string;
    subscriber?: {
      email_address: string;
      payer_id: string;
    };
    custom_id?: string; // This will contain our user_id
  };
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
    const webhookEvent: PayPalWebhookEvent = await req.json();
    console.log('PayPal webhook received:', JSON.stringify(webhookEvent, null, 2));

    // Log the transaction
    await supabase.from('payment_transactions').insert({
      paypal_transaction_id: webhookEvent.id,
      transaction_type: webhookEvent.event_type,
      status: webhookEvent.resource.status || 'received',
      paypal_data: webhookEvent,
    });

    // Handle different webhook events
    switch (webhookEvent.event_type) {
      case 'BILLING.SUBSCRIPTION.CREATED':
        await handleSubscriptionCreated(webhookEvent);
        break;
      
      case 'BILLING.SUBSCRIPTION.ACTIVATED':
        await handleSubscriptionActivated(webhookEvent);
        break;
      
      case 'PAYMENT.SALE.COMPLETED':
        await handlePaymentCompleted(webhookEvent);
        break;
      
      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.SUSPENDED':
        await handleSubscriptionCancelled(webhookEvent);
        break;
      
      case 'BILLING.SUBSCRIPTION.EXPIRED':
        await handleSubscriptionExpired(webhookEvent);
        break;
      
      default:
        console.log(`Unhandled webhook event: ${webhookEvent.event_type}`);
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });

  } catch (error) {
    console.error('Error processing PayPal webhook:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json', ...corsHeaders } }
    );
  }
};

async function handleSubscriptionCreated(event: PayPalWebhookEvent) {
  const { resource } = event;
  const userId = resource.custom_id;

  if (!userId) {
    console.error('No user ID found in subscription created event');
    return;
  }

  // Create subscription record
  const { error } = await supabase
    .from('user_subscriptions')
    .insert({
      user_id: userId,
      plan: 'premium',
      status: 'pending',
      paypal_subscription_id: resource.id,
      paypal_plan_id: resource.plan_id,
      amount: 5.00,
      currency: 'USD',
      metadata: { paypal_event: event }
    });

  if (error) {
    console.error('Error creating subscription:', error);
  } else {
    console.log(`Subscription created for user ${userId}`);
  }
}

async function handleSubscriptionActivated(event: PayPalWebhookEvent) {
  const { resource } = event;

  // Update subscription status to active
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: null // Recurring subscription, no end date
    })
    .eq('paypal_subscription_id', resource.id);

  if (error) {
    console.error('Error activating subscription:', error);
  } else {
    console.log(`Subscription activated: ${resource.id}`);
  }
}

async function handlePaymentCompleted(event: PayPalWebhookEvent) {
  const { resource } = event;

  // Log the successful payment
  const { error } = await supabase
    .from('payment_transactions')
    .insert({
      paypal_transaction_id: resource.id,
      transaction_type: 'payment_completed',
      amount: parseFloat(resource.billing_info?.last_payment?.amount?.value || '0'),
      currency: resource.billing_info?.last_payment?.amount?.currency_code || 'USD',
      status: 'completed',
      paypal_data: event,
    });

  if (error) {
    console.error('Error logging payment:', error);
  } else {
    console.log(`Payment completed: ${resource.id}`);
  }
}

async function handleSubscriptionCancelled(event: PayPalWebhookEvent) {
  const { resource } = event;

  // Update subscription status to cancelled
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'canceled',
      auto_renew: false,
      end_date: new Date().toISOString()
    })
    .eq('paypal_subscription_id', resource.id);

  if (error) {
    console.error('Error cancelling subscription:', error);
  } else {
    console.log(`Subscription cancelled: ${resource.id}`);
  }
}

async function handleSubscriptionExpired(event: PayPalWebhookEvent) {
  const { resource } = event;

  // Update subscription status to expired
  const { error } = await supabase
    .from('user_subscriptions')
    .update({ 
      status: 'expired',
      end_date: new Date().toISOString()
    })
    .eq('paypal_subscription_id', resource.id);

  if (error) {
    console.error('Error marking subscription as expired:', error);
  } else {
    console.log(`Subscription expired: ${resource.id}`);
  }
}

serve(handler);
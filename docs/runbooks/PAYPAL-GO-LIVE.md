# PayPal go-live runbook (external credentials)

## Sandbox (staging)

1. Create PayPal REST app (Sandbox)  
2. Set Edge Function secrets: `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_WEBHOOK_ID`  
3. Leave `PAYPAL_ALLOW_LIVE` unset/false  
4. Map subscription plans: `PAYPAL_PLAN_PREMIUM_MONTHLY`, `PAYPAL_PLAN_PREMIUM_YEARLY`  
5. Point webhooks to staging function URLs  
6. Run Test Buyer purchase; confirm `payment_webhook_events` + wallet/license rows

## Live (production)

1. Owner legal review of Terms / refund posture  
2. Verify Egypt business can receive USD digital goods  
3. Set live credentials in production Supabase only  
4. Set `PAYPAL_ALLOW_LIVE=true` explicitly  
5. Re-point webhooks to production  
6. One real $0.99–$1.00 test with immediate reconciliation

Blocked without owner credentials: end-to-end sandbox/live capture.

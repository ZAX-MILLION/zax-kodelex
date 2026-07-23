# PayPal Edge Functions — Hardening Guide

**Project:** Zax Million Seamless V2  
**Date:** 2026-07-20  
**Status:** Documentation only — verify before live payments

---

## Functions inventory

| Function | Purpose | Default sandbox |
|----------|---------|-----------------|
| `paypal-purchase-coins` | Create coin purchase order | Yes (`PAYPAL_BASE_URL` defaults to sandbox) |
| `paypal-coin-webhook` | Fulfill coin purchases | Verify signature before crediting |
| `paypal-subscribe` | Premium subscription checkout | Sandbox until live |
| `paypal-webhook` | Subscription lifecycle | Verify signature |
| `check-subscription` | Poll subscription status | N/A |

---

## Required server secrets (Supabase dashboard only)

```
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com   # live: https://api-m.paypal.com
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=   # webhooks only — never in VITE_*
```

---

## Pre-live checklist

1. **Webhook signature verification** — reject unverified payloads before wallet updates.
2. **Idempotency** — store PayPal order/event IDs; ignore duplicates.
3. **RLS** — `coin_wallets` / `coin_transactions` writable only by service role or verified triggers.
4. **Sandbox E2E** — staging project + TestBuyer user + sandbox app credentials.
5. **Live switch** — owner sign-off; update `PAYPAL_BASE_URL`; re-point webhooks to production functions.
6. **Egypt / USD** — confirm PayPal business account can receive USD for digital goods.
7. **Terms** — publish no-refund-on-consumed-coins policy (`docs/legal/terms-of-service.md`).

---

## Client-side rules

- Never put `PAYPAL_CLIENT_SECRET` in `VITE_*` variables.
- Demo builds set `VITE_DISABLE_PAYMENTS=true` — no PayPal SDK load on Support/Coins.
- `/buy` simulated checkout requires `VITE_ALLOW_SIMULATED_BUY=true` and is blocked on production.

---

## Staging test flow (TestBuyer)

1. Deploy SPA to Vercel/Netlify with `VITE_APP_ENV=staging` + Supabase anon keys.
2. Configure sandbox PayPal app; webhook URL → staging `paypal-coin-webhook`.
3. Sign in as seeded test user → `/coins` → complete sandbox purchase.
4. Confirm `coin_transactions` row and wallet balance update server-side only.

---

*See also: `docs/audits/pre-upgrade/DEMO-AND-PAYMENT-ARCHITECTURE.md`*

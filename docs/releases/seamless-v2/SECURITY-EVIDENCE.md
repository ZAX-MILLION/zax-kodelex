# Security evidence table — Seamless V2

Inspected: migration SQL under `supabase/migrations/` and Edge Functions under `supabase/functions/`.

| Area | What was checked | Evidence | Status / fix |
|------|------------------|----------|--------------|
| Profiles RLS | `idx_profiles_role`, role indexes | `20250725040201-*.sql` | RLS present historically; role escalation blocked via `user_roles` admin-only manage policy |
| Role modification | `user_roles` policies | `20250727193418-*.sql` — Users SELECT own; Admins manage | OK for client; demo cannot touch DB |
| Coins wallets | Policies `System can update wallets USING (true)` | Same migration | **Fixed** in `20260720121000_harden_coin_wallet_rls.sql` — dropped open INSERT/UPDATE |
| Transactions | Open INSERT `WITH CHECK (true)` | Same | **Fixed** — service role only |
| Purchases | Customer SELECT own; Admin manage | `20250726144733-*.sql` | OK; pending rows via service role in license order function |
| Licenses | Customer SELECT; Admin manage; trigger on completed purchase | Same | License creation only after completed status (existing trigger) |
| Subscriptions | `paypal-subscribe` + webhook | Hardened functions require auth, catalogue plan, webhook signature | Code complete; needs secrets |
| Series/Chapters | Public read patterns in migrations | Multiple series_* policies | Public read expected; writes admin/author |
| Uploads / Storage | `storage.objects` policies | `20250726192351`, `20250805052602` | Path-scoped; demo uploader writes nowhere |
| Blog | Demo skips DB + toast | `useBlogPosts` + `appConfig` | Demo safe |
| Admin actions | Demo uses `DemoAdminSim` without importing Admin | `src/pages/demo/DemoAdminSim.tsx` | Admin chunk not requested on homepage (network check) |
| Edge Function auth | Coin/license/subscribe require Bearer user | Function sources | OK |
| PayPal webhook signature | `verifyPayPalWebhookSignature` + `PAYPAL_WEBHOOK_ID` required | `_shared/paypal.ts`, coin + subscription webhooks | Fail closed without webhook id |
| Rate limiting | `security-middleware` function exists | Inventory | Present; dashboard/WAF external |
| File restrictions | Storage MIME/size largely dashboard | Migrations + docs | External review for bucket MIME limits |
| Leaked password / OTP / redirects / Site URL | Dashboard only | `docs/runbooks/SUPABASE-DASHBOARD-SECURITY.md` | **External** |

## Residual risk

Until migration `20260720121000_*` is applied to the live Supabase project, production wallets may still have the old open UPDATE policy. Apply migration before enabling live payments.

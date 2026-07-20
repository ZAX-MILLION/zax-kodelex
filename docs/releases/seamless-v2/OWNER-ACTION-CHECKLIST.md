# Owner action checklist — Seamless V2

You do **not** need to code. These are account / approval steps.

## Before reviewing the branch

- [ ] Open the screenshots in `docs/releases/seamless-v2/screenshots/` (before vs after)
- [ ] Skim `IMPLEMENTATION-REPORT.md`

## Before staging payments

- [ ] Create PayPal **Sandbox** app
- [ ] Add secrets in Supabase Edge Functions (see `docs/runbooks/PAYPAL-GO-LIVE.md`)
- [ ] Apply new migrations on the staging Supabase project
- [ ] Confirm wallet RLS hardening migration applied
- [ ] Run one sandbox coin purchase as Test Buyer

## Before live payments

- [ ] Confirm PayPal Business can receive **USD** digital goods from Egypt
- [ ] Review Terms + `docs/legal/drafts/REFUND-AND-CHARGEBACK.md` with legal advice
- [ ] Set production `VITE_SITE_URL`
- [ ] Set `PAYPAL_ALLOW_LIVE=true` only when ready
- [ ] Complete Supabase dashboard items in `docs/runbooks/SUPABASE-DASHBOARD-SECURITY.md`

## Hosting

- [ ] Choose Vercel/Netlify (or keep Pages as demo-only)
- [ ] Keep GitHub Pages on demo flags (`VITE_APP_ENV=demo`, payments/admin disabled)

## After you are happy with the branch

- [ ] Tell the agent to **push** and/or open a PR (not done yet on purpose)
- [ ] Do **not** merge to `main` until you say so

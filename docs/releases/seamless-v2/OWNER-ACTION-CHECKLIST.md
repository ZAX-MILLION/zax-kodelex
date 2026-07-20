# Owner checklist — Seamless V2

## Before approving the upgrade

- [ ] Review before/after screenshots in `docs/releases/seamless-v2/screenshots/`
- [ ] Read `IMPLEMENTATION-REPORT.md`
- [ ] Confirm the live GitHub Pages demo should stay on `main` until you choose to merge

## Before staging payments

- [ ] Create a PayPal Sandbox application
- [ ] Add Edge Function secrets (see `docs/runbooks/PAYPAL-GO-LIVE.md`)
- [ ] Apply new Supabase migrations on the staging project
- [ ] Confirm wallet RLS hardening migration is applied
- [ ] Complete one sandbox coin purchase

## Before live payments

- [ ] Confirm PayPal Business can receive USD for digital goods
- [ ] Review Terms and `docs/legal/drafts/REFUND-AND-CHARGEBACK.md`
- [ ] Set production `VITE_SITE_URL`
- [ ] Set `PAYPAL_ALLOW_LIVE=true` only when ready
- [ ] Complete `docs/runbooks/SUPABASE-DASHBOARD-SECURITY.md`

## Public site URL (root GitHub Pages)

- [ ] Decide whether to keep this repo as source and publish from `ZAX-MILLION.github.io`, or rename later
- [ ] Follow `docs/runbooks/GITHUB-PAGES-ROOT-MIGRATION.md` (requires your explicit approval)

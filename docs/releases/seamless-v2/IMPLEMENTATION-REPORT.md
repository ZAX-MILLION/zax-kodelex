# ZAX Seamless V2 — Release notes

**Branch:** `upgrade/zax-seamless-v2`  
**Rollback baseline:** tag `pre-seamless-v2-b8c42a0` (`main` @ `b8c42a0`)  
**Status:** Ready for review (live PayPal activation remains an operator step)

## Highlights

### Public experience
- New homepage structure: editorial hero, discovery, membership, Role Lab, trust/legal, feed, blog
- Demo Role Lab at `/demo` with lightweight Admin / Uploader / Checkout simulations
- Responsive layout across common phone, tablet, and desktop sizes

### Performance
- Demo builds skip PWA precache and do not load Admin or PayPal on the homepage
- Measured demo bundle metrics are recorded under `docs/releases/seamless-v2/bundle-metrics-demo.json`
- Homepage demo network check: no Supabase and no PayPal requests

### SEO
- Environment-aware `robots.txt` / `sitemap.xml` generation at build time
- Demo builds disallow indexing; production uses `VITE_SITE_URL`
- Private routes are marked noindex in the app

### Accessibility
- Skip link, focus visibility, and reduced-motion support
- Automated axe results and remaining issues are listed in the pull request and `axe-*.json`

### Payments & security
- Server-authoritative product catalogue
- Hardened PayPal Edge Functions (signature verification, idempotency, live mode gate)
- Coin wallet client write policies closed via migration
- Operator runbooks for PayPal and Supabase dashboard settings

## Verification

See `VERIFICATION.json`, `SECURITY-EVIDENCE.md`, and `OWNER-ACTION-CHECKLIST.md` in this folder.

## Screenshots

Before/after captures: `docs/releases/seamless-v2/screenshots/`

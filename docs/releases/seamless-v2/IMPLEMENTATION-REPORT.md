# ZAX Seamless V2 — Release notes

**Branch:** `upgrade/zax-seamless-v2`  
**Rollback baseline:** tag `pre-seamless-v2-b8c42a0` (`main` @ `b8c42a0`)  
**Status:** Ready for visual review (do not merge until ADMIN approves)

## Highlights

### Public experience
- New homepage structure: editorial hero, discovery, membership, Role Lab, trust/legal, feed, blog
- Demo Role Lab at `/demo` with lightweight Admin / Uploader / Checkout simulations
- Responsive layout across common phone, tablet, and desktop sizes

### Immersive reader (Qi-style chrome)
- Single compact top bar (no bottom toolbar)
- Floating right-side control rail (scroll, chapters, settings, auto-scroll, comments, report)
- Comments drawer + end-of-chapter comments
- Chapter list panel with prev/next
- Functional auto-scroll with reduced-motion support
- Reader Settings persist locally (`zax-reader-settings-v2`)
- Screenshots: `docs/releases/seamless-v2/screenshots/reader-qi-layout/`

### Demo backend isolation
- Offline Supabase stub — never constructs `placeholder.supabase.co` clients
- Color / theme / analytics / install hooks gated in demo
- See `DEMO-NETWORK-ISOLATION.md`

### Performance
- Demo builds skip PWA precache and do not load Admin or PayPal on the homepage
- Measured demo bundle metrics are recorded under `docs/releases/seamless-v2/bundle-metrics-demo.json`

### SEO
- Environment-aware `robots.txt` / `sitemap.xml` generation at build time
- Demo builds disallow indexing; production uses `VITE_SITE_URL`

### Accessibility
- Skip link, focus visibility, and reduced-motion support
- Reader rail / overlays use accessible names and Escape layering

### Payments & security
- Server-authoritative product catalogue
- Hardened PayPal Edge Functions
- Operator runbooks for PayPal and Supabase dashboard settings

## Verification

See `VERIFICATION.json`, `DEMO-NETWORK-ISOLATION.md`, `RESPONSIVE-VERIFICATION.md`, and `SECURITY-EVIDENCE.md` in this folder.

## Screenshots

Before/after captures: `docs/releases/seamless-v2/screenshots/`  
Reader rebuild: `docs/releases/seamless-v2/screenshots/reader-qi-layout/`

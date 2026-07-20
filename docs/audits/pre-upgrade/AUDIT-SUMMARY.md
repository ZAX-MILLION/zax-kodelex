# AUDIT-SUMMARY — Paste into Prompt 02

**Project:** Zax Million (`zax-kodelex`)  
**Audit date:** 2026-07-20  
**Phase:** 1 complete — investigation only, zero app code changes  
**Git HEAD:** `b8c42a0` on `main`  

---

## One-line result

**Ready for Prompt 02 upgrade planning.** Live demo works at project-site URL; user-site root 404 is expected. Codebase builds cleanly but has large admin bundle, simulated `/buy` payments, mobile UX debt, and no Supabase on public demo.

---

## Identity & URLs

| Item | Value |
|------|-------|
| GitHub | https://github.com/ZAX-MILLION/zax-kodelex |
| User-site root | https://zax-million.github.io/ → **404** |
| Project-site demo | https://zax-million.github.io/zax-kodelex/ → **LIVE** |
| Pages deploy | `.github/workflows/deploy-pages.yml` on push to `main` |
| Demo env | `VITE_DEMO_MODE=true`, `VITE_SKIP_SETUP=true`, `VITE_BASE=/zax-kodelex/` |

---

## Stack

React 18 + TS + Vite 5 + Tailwind + shadcn/Radix + TanStack Query + React Router 6 + Supabase (Auth/DB/Storage/8 edge functions) + PayPal + PWA (disabled on demo build).

---

## Inventory snapshot

- 634 source files (~31 MB excl. node_modules)
- 39 pages, 113 admin components, 82 SQL migrations
- Build: pass | Lint: 0 errors / 478 warnings | Typecheck: pass
- Demo dist: 4.23 MB; largest chunks: Admin 920 KB, main 672 KB (gzip ~229 / ~191 KB)

---

## Top findings (≤20)

1. User-site `zax-million.github.io/` returns 404; demo only at `/zax-kodelex/`.
2. Public demo has no Supabase — auth, blog, payments non-functional (by design).
3. `/buy` **simulates** payment with timeout — must not go live without real processor.
4. PayPal edge functions default to **sandbox** URL.
5. Admin JS bundle ~920 KB — major load cost if admin route visited.
6. Mobile homepage cramped — documented in `docs/RESPONSIVE_FIX_PLAN.md`.
7. `robots.txt` sitemap URL points to `zaxmillion.com`, not GitHub Pages.
8. Live demo shows blog error toast (expected without DB).
9. Demo library: 20 series, no chapter page images.
10. Test account helpers DEV-only (`useTestAccounts`) — OK for prod builds.
11. 478 ESLint warnings (`any`, hook deps) — tech debt, not blocking build.
12. RLS + leaked-password protection flagged in security checklist — manual work needed.
13. No automated refund flow in code.
14. Egypt: PayPal viable for USD digital goods; Stripe not integrated; evaluate local gateways later.
15. Feature flag context exists but cache stub — verify before relying on flags.
16. Duplicate basenames (`Home.tsx`, `use-toast.ts`, etc.) — different paths, not git duplicates.
17. PWA precache ~4.3 MB on full build — skipped on demo (good).
18. Ko-fi + email support already in README.
19. MIT license — owner liable for hosted content legality.
20. Pre-existing untracked file: `docs/RESPONSIVE_FIX_PLAN.md` (not from this audit).

---

## Recommended architecture

- **Demo:** GitHub Pages, static, demo mode, no secrets, block payments/admin UI.
- **Staging:** Vercel/Netlify + separate Supabase project + PayPal sandbox.
- **Production:** Same host pattern + live PayPal after verification + custom domain.
- **Do not** use GitHub Pages for production DB/payments.

Full detail: `docs/audits/pre-upgrade/DEMO-AND-PAYMENT-ARCHITECTURE.md`

---

## Critical warnings

- Never connect simulated `/buy` flow to production DB with real customers.
- Complete Supabase RLS audit before public launch.
- Enable leaked-password protection + shorten OTP expiry in Supabase Auth.
- Verify PayPal webhooks before crediting coins.
- Publish refund/terms policy before accepting live payments in Egypt/USD.

---

## Owner decisions

See `docs/audits/pre-upgrade/OWNER-DECISIONS.md` — safe defaults allow Prompt 02 to proceed without owner reply ("use all defaults").

---

## Files created (audit only)

```
docs/audits/pre-upgrade/
  ZAX-SITE-PRE-UPGRADE-AUDIT.md
  project-inventory.json
  COMMAND-LOG.md
  AUDIT-SUMMARY.md          ← this file
  DEMO-AND-PAYMENT-ARCHITECTURE.md
  OWNER-DECISIONS.md
  screenshots/
    desktop-homepage-existing.png
    desktop-hero-promo-existing.png
    SCREENSHOT-NOTES.md
```

**Application files modified: 0**

---

## Prompt 02 suggested scope

1. Responsive homepage Phase 1 (RESPONSIVE_FIX_PLAN)
2. `VITE_DISABLE_PAYMENTS` / `VITE_DISABLE_ADMIN` for Pages CI
3. Staging deploy + Supabase provisioning
4. PayPal sandbox E2E for coins
5. SEO: sitemap base URL, demo vs prod robots
6. Security checklist items (RLS, auth settings)

---

*End AUDIT-SUMMARY — copy everything above into Prompt 02.*

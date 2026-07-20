# Project structure — Zax Million (Seamless V2)

## Active layout (kept in place)

```
src/
  components/     UI + page sections (homepage/, admin/, manga/, ui/)
  pages/          Route screens
  pages/demo/     Lightweight Role Lab simulations (admin/uploader/checkout)
  payments/       Client-shared product catalogue + validation (NEW)
  config/         Typed env (demo|staging|production)
  contexts/       Auth, DemoRole, I18n, Theme
  hooks/          Data hooks with demo short-circuits
  integrations/   Supabase client (disabled in demo)
  utils/seo/      robots/sitemap helpers
supabase/
  functions/      PayPal Edge Functions + _shared/
  migrations/     RLS + payment_webhook_events
docs/
  audits/pre-upgrade/   Phase 1 evidence
  releases/seamless-v2/ Phase 2 evidence + reports
  architecture/         This file
  runbooks/             Operator steps
```

## Why mass movement was avoided

The inventory listed 600+ source files. Moving them en masse would break hundreds of `@/` imports, theme overrides, and lazy routes with high regression risk and zero user-facing benefit. Seamless V2 adds **targeted new folders** (`src/payments/`, `src/pages/demo/`, `supabase/functions/_shared/`) and documents the rest.

## Imports that changed

| From | To | Why |
|------|----|-----|
| `Home` → `ResetScansHomepage` | `SeamlessHomepage` | Editorial public homepage |
| PayPal coin/subscribe functions | `_shared/catalog.ts` + `_shared/paypal.ts` | Server-authoritative amounts |
| — | `src/pages/demo/*` | Isolated sims without Admin bundle |

## Deliberately left in place

- `ResetScansHomepage.tsx` — retained for theme `HomepageOverride` fallbacks / comparison
- Large `src/components/admin/**` — still lazy-loaded for staging/production; never imported by demo sims
- Existing theme packs under `src/themes` / content — brand preservation

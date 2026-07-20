# Project structure

## Layout

```
src/
  components/     UI and page sections
  pages/          Route screens
  pages/demo/     Public demo simulations (no production admin bundle)
  payments/       Shared product catalogue and validation helpers
  config/         Environment flags (demo | staging | production)
  contexts/       Auth, demo role, i18n, theme
  hooks/          Data hooks with demo short-circuits
  integrations/   Supabase client (disabled in demo)
  utils/seo/      robots/sitemap helpers
supabase/
  functions/      PayPal Edge Functions and shared helpers
  migrations/     Schema, RLS, payment idempotency
docs/
  architecture/   Structure notes
  legal/          Policies
  releases/       Release evidence and rollback
  runbooks/       Operator procedures
```

## Organization approach

Large-scale folder moves were avoided to reduce import and theme-override risk. New modules were added where responsibilities were missing (`src/payments/`, `src/pages/demo/`, `supabase/functions/_shared/`).

## Intentionally retained

- Legacy homepage variants used by theme overrides
- Production Admin package (lazy-loaded; not used by public demo simulations)

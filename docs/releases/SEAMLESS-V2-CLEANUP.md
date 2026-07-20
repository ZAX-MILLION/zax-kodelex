# Seamless V2 cleanup log

## Removed files

None in this pass. No deletions without unused-file proof.

## Candidates reviewed but kept

| Path | Evidence kept |
|------|----------------|
| `src/components/homepage/ResetScansHomepage.tsx` | Still referenced by themes / rollback comparison |
| `src/components/homepage/EnhancedHomepage.tsx` | Theme override surfaces |
| Admin page chunk | Required for staging/production; lazy only |

## Added (not clutter)

- `src/payments/*`
- `src/components/homepage/seamless/SeamlessHomepage.tsx`
- `src/pages/demo/*`
- `supabase/functions/_shared/*`
- `supabase/functions/paypal-create-license-order/*`
- `supabase/migrations/20260720120000_*` and `20260720121000_*`
- `tests/unit/*`
- `scripts/measure-bundles.mjs`, `scripts/capture-screenshots.mjs`
- `vite.seo-plugin.ts`

## Why no mass deletion

Phase 1 inventory flagged possible dead files, but several are still dynamically imported or theme-gated. Deleting without runtime coverage would risk production Admin/Uploader flows. Cleanup deferred until staging smoke tests confirm each candidate unused.

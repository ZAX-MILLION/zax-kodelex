# Seamless V2 — Phase 3 Read-Only Audit

Generated: 2026-07-22 · Branch: `upgrade/zax-seamless-v2` · Base: `0e649e5`

This document inventories **where settings live**, **which env vars gate behavior**, **admin SQL** for series overrides, and **dead-code candidates** (recommendations only — nothing deleted in this phase).

---

## 1. Persistence table

| Domain | Storage | Key / column | Scope | Synced to DB? | Resolution order |
|--------|---------|--------------|-------|---------------|------------------|
| Series details layout (global) | `localStorage` | `zax-series-details-layout-global` | Site-wide default layout A/B/C/D | No (local only today) | Global → built-in default (`A`) |
| Series details layout (per series) | `localStorage` | `zax-series-details-layout-overrides` (JSON map) | One layout per series id | Optional via `syncSeriesDetailsOverrideToDb` → `manga_meta.details_layout_override` | Per-series override → global → default |
| Appearance mode (global) | `localStorage` | `zax-appearance-global` | Light / Dark / System | No | Global → default (`dark`) |
| Appearance mode (per series) | `localStorage` | `zax-appearance-series-overrides` (JSON map) | One mode per series id | Optional → `manga_meta.appearance_override` | Per-series → global → default |
| Details background URL (global) | `localStorage` | `zax-series-details-bg-global` | Background image URL | No | Global → cover → fallback |
| Details background theme (global) | `localStorage` | `zax-series-details-bg-theme-global` | Position, overlay, blur, accent, attachment | No | Merged with defaults |
| Details background (per series) | `localStorage` | `zax-series-details-bg-overrides`, `zax-series-details-bg-theme-overrides` | URL + theme per series | Optional → `manga_meta.details_background_url`, `details_bg_*` columns | Per-series → global → cover |
| Chapter grid density | `localStorage` | `zax-series-chapter-grid-view` | 1=list / 2=compact / 3=dense | No | User preference only |
| Demo library | `localStorage` | `zax-demo-library` | Series ids in “library” | No (demo) | — |
| Read chapters | `sessionStorage` | `zax-demo-read:{seriesId}` | Chapter numbers marked read | No (demo) | — |
| Continue reading | `sessionStorage` | `zax-demo-continue:{seriesId}` | Last chapter number | No (demo) | — |
| Demo series comments | `sessionStorage` | `zax-demo-series-comments-session`, `zax-demo-series-comment-reactions` | Session-only comments | No | — |
| Demo series reviews | `sessionStorage` | `zax-demo-series-reviews-session` | Session-only reviews | No | — |
| Demo chapter comments (reader) | `sessionStorage` | `zax-demo-chapter-comments`, `zax-demo-chapter-comment-likes` | Reader comment sim | No | — |
| Supabase credentials (runtime) | `localStorage` | `supabase_url`, `supabase_anon` | Client override of env | N/A | Used when env vars absent |
| Production series overrides | PostgreSQL | `public.manga_meta` columns (see §3) | Staging/production | Yes (admin RLS) | DB column when set, else localStorage chain |

**Demo isolation rule:** When `appConfig.isDemo === true`, `hasSupabase` is forced false and `syncSeriesDetailsOverrideToDb` is a no-op — critical flows must not hit production Supabase.

---

## 2. Environment variables (exact names)

All client-side vars are `VITE_*` (embedded at build time). Source of truth: `src/config/env.ts`, `.env.example`.

| Variable | Values / type | Effect |
|----------|---------------|--------|
| `VITE_APP_ENV` | `demo` \| `staging` \| `production` | Primary environment selector |
| `VITE_DEMO_MODE` | `true` / `1` | Legacy demo flag; sets env to demo if `VITE_APP_ENV` unset |
| `VITE_DISABLE_PAYMENTS` | `true` / `1` | Disables PayPal / coin store UI (defaults on in demo) |
| `VITE_DISABLE_ADMIN` | `true` / `1` | Disables admin panel feature flag (defaults on in demo) |
| `VITE_ALLOW_SIMULATED_BUY` | `true` / `1` | Allows simulated checkout (never production) |
| `VITE_SKIP_SETUP` | `true` / `1` | Skips first-run setup wizard |
| `VITE_SUPABASE_URL` | URL | Supabase project URL (omit on demo build) |
| `VITE_SUPABASE_ANON_KEY` | string | Supabase anon key (omit on demo build) |
| `VITE_PAYPAL_CLIENT_ID` | string | PayPal client id for donate/support |
| `VITE_SITE_URL` | URL | Canonical site URL for SEO / sitemap |
| `VITE_BASE` | path | Vite base path (e.g. `/zax-kodelex/`) |
| `VITE_SENTRY_DSN` | string | Optional error monitoring |
| `VITE_BYPASS_PREMIUM` | `true` | Dev-only premium bypass (`useDeveloperMode`) |
| `VITE_BYPASS_LICENSE` | `true` | Dev-only license bypass |
| `VITE_BYPASS_THEME_LICENSE` | `true` | Dev-only theme license bypass |
| `VITE_DATABASE_PROVIDER` | string | Legacy DB provider hint |
| `BASE_URL` | path | Vite built-in base (from `vite.config.ts`) |

**Build scripts (from `package.json`):**

- Demo: `VITE_APP_ENV=demo VITE_DEMO_MODE=true VITE_DISABLE_PAYMENTS=true VITE_DISABLE_ADMIN=true`
- Staging/production: set Supabase + optional PayPal; do not set demo flags.

**Server-only (Supabase Edge Functions — not in client bundle):**

`PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_BASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

---

## 3. Admin SQL (verbatim)

### 3.1 Migration — series override columns

File: `supabase/migrations/20260722020000_series_details_appearance_overrides.sql`

```sql
ALTER TABLE public.manga_meta
  ADD COLUMN IF NOT EXISTS details_layout_override text,
  ADD COLUMN IF NOT EXISTS appearance_override text,
  ADD COLUMN IF NOT EXISTS details_background_url text,
  ADD COLUMN IF NOT EXISTS details_bg_position text,
  ADD COLUMN IF NOT EXISTS details_bg_overlay_darkness integer,
  ADD COLUMN IF NOT EXISTS details_bg_blur integer,
  ADD COLUMN IF NOT EXISTS details_bg_accent_color text,
  ADD COLUMN IF NOT EXISTS details_bg_attachment text;

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_layout_override_check,
  ADD CONSTRAINT manga_meta_details_layout_override_check
    CHECK (details_layout_override IS NULL OR details_layout_override IN ('A', 'B', 'C', 'D'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_appearance_override_check,
  ADD CONSTRAINT manga_meta_appearance_override_check
    CHECK (appearance_override IS NULL OR appearance_override IN ('light', 'dark', 'system'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_position_check,
  ADD CONSTRAINT manga_meta_details_bg_position_check
    CHECK (details_bg_position IS NULL OR details_bg_position IN ('center', 'top', 'bottom'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_attachment_check,
  ADD CONSTRAINT manga_meta_details_bg_attachment_check
    CHECK (details_bg_attachment IS NULL OR details_bg_attachment IN ('fixed', 'scroll'));

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_overlay_darkness_check,
  ADD CONSTRAINT manga_meta_details_bg_overlay_darkness_check
    CHECK (details_bg_overlay_darkness IS NULL OR details_bg_overlay_darkness BETWEEN 40 AND 95);

ALTER TABLE public.manga_meta
  DROP CONSTRAINT IF EXISTS manga_meta_details_bg_blur_check,
  ADD CONSTRAINT manga_meta_details_bg_blur_check
    CHECK (details_bg_blur IS NULL OR details_bg_blur BETWEEN 0 AND 12);
```

### 3.2 RLS — manga_meta (initial schema)

File: `supabase/migrations/20250724210705-8da87dfd-2589-4b26-b8ac-94bc01fed90d.sql`

```sql
CREATE POLICY "Anyone can view manga meta" ON public.manga_meta
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage manga meta" ON public.manga_meta
  FOR ALL USING (public.is_admin());
```

### 3.3 Application write (TypeScript → PostgREST)

From `src/features/series/seriesDetailsAdminSync.ts`:

```typescript
await supabase.from('manga_meta').update(patch).eq('id', seriesId);
```

Where `patch` may include: `details_layout_override`, `appearance_override`, `details_background_url`, `details_bg_position`, `details_bg_overlay_darkness`, `details_bg_blur`, `details_bg_accent_color`, `details_bg_attachment`.

---

## 4. Dead-code candidates (recommend only)

| File / symbol | Evidence | Recommendation |
|---------------|----------|----------------|
| `src/components/series/ChapterList.tsx` | No imports anywhere in `src/` | Safe to remove after confirming no dynamic import |
| `src/components/series/FuturisticChapterList.tsx` | No imports | Remove; superseded by layout-specific chapter components |
| `src/components/admin/SeriesDesignOverridePanel.tsx` | Still imported by `SeriesManager.tsx` only; Series Design admin now uses dedicated pages | Consolidate Series Manager overrides into `/admin/series-design` or inline slim control; then remove panel |
| `docs/releases/seamless-v2/homepage-concepts/*.png` + README | Concept art only; not wired to routes | Keep local or in design archive; do not ship in production bundle |
| `wip-parallel-snapshot` branch | Parallel experiment branch | Do not merge; reference only |
| Duplicate hero components (removed Phase 1) | `EnhancedSeriesDetail`, `SeriesHero`, `ModernSeriesHero`, `FuturisticSeriesHero` | Already deleted in commit `4128608` |

---

## 5. Phase 3 notes for ADMIN

- **Global vs per-series:** Admin UI now splits layout (`/admin/series-design`), appearance (`/admin/appearance`), and backgrounds (`/admin/backgrounds`). Each override screen edits **one series at a time**.
- **DB migration:** Run `20260722020000_series_details_appearance_overrides.sql` on staging/production before expecting overrides to survive cross-device.
- **Demo builds:** `VITE_DISABLE_ADMIN=true` means real `/admin/login` is not available in demo preview — use `/demo/admin/*` for IA review.

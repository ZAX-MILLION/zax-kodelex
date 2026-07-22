# Series Details — Layout D + Four Selectable Themes + Real Light/Dark/System

Branch: `upgrade/zax-seamless-v2`. Extends the existing series-details style audit work
(Layouts A/B/C, shared chapter controls, background selector, per-series layout selector) —
none of that was rebuilt; this adds Layout D and a functional appearance system on top.

## 1. Layout D — Compact List

- New file: `src/components/series/layouts/SeriesDetailsLayoutCompactList.tsx`.
- Registered via the existing lazy architecture: `seriesDetailsLayout.ts` (`'A'|'B'|'C'|'D'`,
  `SERIES_DETAILS_LAYOUT_META.D`) and `layouts/index.tsx` (`D: CompactList`).
- Order: cover + full info side-by-side → compact reading actions → **chapters** →
  **comments** (directly below chapters) → Reviews + Related as a de-emphasized secondary
  block below comments. No tabs, no hero, no oversized empty space.
- Composes the same shared pieces every other layout uses — `SeriesDetailCover`,
  `SeriesDetailTitleBlock`, `SeriesDetailReadingActions`, and `SeriesDetailSections` — it does
  **not** duplicate chapter/comment/access/SEO/demo logic.
- `SeriesDetailSections` gained two new opt-in props to support this without duplicating the
  section markup: `commentsBeforeSecondary` (reorders comments directly after chapters) and
  `deemphasizeSecondary` (shrinks the Reviews/Related headings and switches Related Titles to
  its existing `compact` card style). Layouts A/B/C are unaffected (both default to `false`,
  same DOM order as before).
- Shared chapter controls (search, sort, access filter, read filter, 1/2/3 column toggle, read
  state, comment counts, free/coin/premium badges) are untouched — Layout D uses
  `ModernChapterGrid` exactly like A/B/C. Responsive columns are already global
  (`getChapterGridColumnClasses`): mobile 1, tablet 1–2, desktop 1–3.
- `SeriesDetailReadingActions` gained an optional `dense` prop (smaller buttons, side-by-side
  Library/Share) for Layout D's compact action row — purely a size/layout variant, same
  handlers/behavior as every other layout.

## 2. Admin selector — four options

`SeriesDetailsLayoutControls.tsx`: `LAYOUT_IDS` now includes `'D'`, added a Layout D thumbnail,
grid is `2/4` responsive (was `1/3`), and an explicit note clarifies the chapter grid's 1/2/3
toggle is a reader density preference, not a page style. Labels: **A Editorial**, **B
Cinematic**, **C Compact**, **D Compact List**. Global default, per-series override, and reset
all continue to work exactly as before (priority: per-series → global → A).

## 3. Real Light / Dark / System

- New module `src/features/appearance/appearanceMode.ts` — resolution priority is
  **database-persisted per-series override → local per-series override (demo/admin preview) →
  global preference → built-in default (`dark`)**. Built-in default is `dark`, not `system`,
  so nothing changes visually for anyone who has never chosen a preference — this preserves
  ZAX Million's existing look-and-feel.
- New hooks `src/hooks/useAppearance.ts`:
  - `useAppearance()` — mounted once at the app root (`src/App.tsx`, alongside the existing
    `useColorScheme()` call) — applies the global preference to every public page and all four
    layouts, listens for `prefers-color-scheme` changes (System), and syncs across tabs via the
    `storage` event.
  - `useSeriesAppearanceOverride(seriesId, dbOverride)` — used only in `ModernSeriesDetail`;
    applies a per-series override while that page is mounted and restores the global appearance
    on unmount.
- **Anti-FOUC**: an inline synchronous script in `index.html` (runs before first paint) reads
  the same storage keys used by `appearanceMode.ts`, resolves System via `matchMedia`, and adds
  the `light`/`dark` class before React ever mounts. Comments in both files point at each other
  to keep the keys in sync if either changes.
- **Tokens, not four stylesheets**: `src/index.css` keeps `:root` as the existing dark palette
  (safety net / no-JS fallback, zero regression), adds an explicit `.dark` class with the same
  values (so it's deterministic once applied, matching the `ThemeCustomizer` `classList`
  pattern already used for admin theme presets), and adds a new `.light` class with a genuine
  light palette — same brand hue family (warm orange primary, manga red/gold/blue) remapped
  onto light surfaces with real contrast (pure-white cards over a warm off-white page
  background, dark readable text, visible borders/inputs). Every component already consumes
  the same semantic tokens (`bg-background`, `bg-card`, `text-foreground`, `border-border`,
  `bg-muted`, `bg-primary`, …), so Layouts A/B/C/D, chapter cards, badges, comments, buttons,
  and background overlays all adapt automatically — no per-layout or per-mode stylesheet.
- `Settings.tsx` → Appearance tab now calls `useAppearance().setGlobalMode(...)` instead of
  only writing to a dead `dark_mode` preference field; the buttons apply instantly.
- **Real bug found and fixed while wiring this up**: `useChildTheme.ts`'s built-in-default
  fallback theme was pushing `--background`/`--foreground`/`--primary`/etc. as **inline styles**
  on `<html>` on every page load (including demo, which never has a DB child theme). Inline
  styles beat any class-based CSS rule, so this was silently overriding the new `.light`/`.dark`
  tokens for those specific properties. Fixed by no longer calling `applyTheme()` for the
  built-in-default case — `:root`/`.dark`/`.light` already provide a complete, correct default,
  so a real admin-selected child theme (from the `child_themes` table) is the only thing that
  should still push inline color overrides. Verified via Playwright: `--background` now
  resolves to the light value with no inline override present.

## 4. Global / per-series appearance (admin)

New component `src/components/series/SeriesAppearanceControls.tsx` (same shape/pattern as the
existing layout and background controls): Light/Dark/System buttons, a "Use global appearance"
checkbox for per-series editing, Save, and Reset. Wired into:
- `SiteSettings.tsx` (global, alongside the existing layout/background controls)
- `DemoAdminSim.tsx` (global + per-series, for the featured demo catalogue)

Resolution: **series override → global appearance → system/default**, implemented in
`resolveAppearanceMode()` and covered by `tests/unit/appearanceMode.test.ts`.

## 5. Database-backed overrides (staging/production)

New migration: `supabase/migrations/20260722020000_series_details_appearance_overrides.sql`.

Adds nullable columns to `manga_meta` (NULL = inherit the global default, so **every existing
series row is compatible with zero data migration**):

| Column | Purpose |
|---|---|
| `details_layout_override` | `'A'\|'B'\|'C'\|'D'` |
| `appearance_override` | `'light'\|'dark'\|'system'` |
| `details_background_url` | per-series background image override |
| `details_bg_position` | `'center'\|'top'\|'bottom'` |
| `details_bg_overlay_darkness` | 40–95 |
| `details_bg_blur` | 0–12 |
| `details_bg_accent_color` | hex |
| `details_bg_attachment` | `'fixed'\|'scroll'` |

All columns have CHECK constraints. **RLS**: `manga_meta` already has `"Anyone can view manga
meta"` (public `SELECT`) and `"Admins can manage manga meta"` (`is_admin()`-gated `ALL`) from
the very first schema migration — these new columns inherit that same public-read /
admin-write policy with **no additional policy needed**.

Resolution order implemented in `resolveSeriesDetailsLayout`, `resolveAppearanceMode`, and
`resolveSeriesDetailsBgTheme` (all took a new optional `dbOverride` parameter): **DB override →
local per-series override (demo/admin preview) → global default → built-in default.**

`src/features/series/seriesDetailsAdminSync.ts` is the write path: `canSyncSeriesDetailsOverrideToDb()`
gates on `!appConfig.isDemo && appConfig.hasSupabase`, and `syncSeriesDetailsOverrideToDb()`
does a best-effort `manga_meta` update (never throws — admin preview UIs keep working off
localStorage even if the write fails, e.g. before the migration has been applied). Wired into
the Save/Reset handlers of `SeriesDetailsLayoutControls`, `SeriesAppearanceControls`, and
`SeriesDetailsBackgroundControls` for per-series edits outside demo mode.

`ModernSeriesDetail.tsx` reads the new columns off the fetched series row and passes them as
`dbOverride` into every resolver, and into `SeriesDetailsBackground`'s new `dbThemeOverride`
prop.

**Owner action required**: apply the migration on staging/production (see
`OWNER-ACTION-CHECKLIST.md`) before per-series database persistence takes effect there. Until
then, admin edits to real (non-demo) series save to localStorage only and the UI reports the
database sync failure inline (non-fatal).

## 6. Demo fallback / offline isolation

Demo mode (`appConfig.isDemo`) never touches the database for any of this — verified:
- `canSyncSeriesDetailsOverrideToDb()` returns `false` whenever `appConfig.isDemo`, so demo/admin-sim
  edits stay in `localStorage` exactly as before (`zax-series-details-layout-overrides`,
  `zax-appearance-global`, `zax-appearance-series-overrides`, `zax-series-details-bg-*`).
  `docs/releases/seamless-v2/network-homepage-demo.json` / `DEMO-NETWORK-ISOLATION.md` document
  the pre-existing zero-backend-request guarantee for demo; this work adds no new network calls
  to any demo code path.
- `useAppearance()`/`useSeriesAppearanceOverride()` are pure client-side (localStorage +
  `matchMedia`), no network calls in any environment.

## 7. Dead components removed

Verified via `grep`/`Grep` for every import/usage before deleting:

| File | Why safe to delete |
|---|---|
| `src/components/series/SeriesDetailTabs.tsx` | Zero imports anywhere outside its own file. Superseded by the "comments always visible, never a hidden tab" pattern already in place before this PR. |
| `src/components/series/SeriesDetailMetadata.tsx` | Zero imports anywhere outside its own file — an exact functional duplicate of `SeriesDetailMetaPanel` in `SeriesDetailSections.tsx`, which is what's actually used. |
| `SeriesDetailReadingActions`'s `'sidebar'` variant | `variant="sidebar"` was never referenced by any layout (A/B/C/D all use `'inline'`/`'mobile-bar'`); Layout D doesn't need a sticky-sidebar action rail, so the dead branch was deleted rather than wired in. |

**Kept, body removed**: `SeriesDetailHero.tsx`'s component function was also dead (zero
call sites) but the file's `SeriesDetailViewModel` type is imported across the series-details
feature (`SeriesDetailSections`, `SeriesDetailTitleBlock`, `layouts/types.ts`,
`ModernSeriesDetail`, …), so the file now only exports that type with a comment explaining why.

Not touched (out of the requested list, not confirmed unused without a wider audit):
`EnhancedSeriesDetail.tsx`, `SeriesHero.tsx`, `ModernSeriesHero.tsx`, `FuturisticSeriesHero.tsx`,
`FuturisticChapterList.tsx`, `ChapterList.tsx` and similar legacy series components — these
weren't in the requested removal list and may still be referenced by other routes/experiments.

## 8. Tests

- `tests/unit/seriesDetailsLayout.test.ts` — Layout D validity, DB-override precedence, Layout D
  background preset.
- `tests/unit/seriesDetailsBackground.test.ts` — DB theme override precedence (DB override wins
  over global/layout; local per-series preview override still wins over DB, matching "local
  preview session/local only").
- `tests/unit/seriesDetailsPage.test.ts` — Layout D registration, shared-section composition
  (no duplicated chapter/comment logic), comments-after-chapters ordering, four-option admin
  selector, and the three dead-code removals.
- `tests/unit/appearanceMode.test.ts` (new) — default-to-dark, global/series/DB override
  precedence, System resolution via `matchMedia`.
- Full run: **116/116 unit tests pass** (`npm test`), **0 TypeScript errors** (`npm run
  typecheck`), **0 new ESLint errors** (`npm run lint` — 487 warnings, all pre-existing;
  confirmed via `git stash` comparison that none are introduced by this work).
- Builds: `npm run build:demo` and `npm run build` (production placeholder) both succeed.
- Responsive/overflow: `node scripts/responsive-verify.mjs` against the demo preview — **0
  horizontal-overflow failures, 0 runtime errors** across 360/390/768/1024/1440 on 10 routes.
- Accessibility (axe, WCAG2A/AA): `node scripts/axe-series-details-light.mjs` — **0 violations
  on all 4 layouts in Light mode** after fixing two real issues discovered by this run (both
  also existed in Dark mode before this PR, i.e. not introduced by the new light palette, but
  fixed for both modes since the fix was trivial and cross-cutting):
  - Light-mode `--primary` needed to be darkened (tuned from 46% → 34% lightness) so white
    button/badge text and `text-primary`-on-tint genre pills clear 4.5:1 contrast.
  - `ModernChapterGrid`'s green/blue solid chapter-status badges used `green-600`/`blue-500`
    with white text (pre-existing, marginal-to-failing contrast in **both** themes); bumped to
    `green-700`/`blue-600`.
  - Two Select triggers (chapter access/read filters) had no accessible name (`button-name`,
    critical, pre-existing in both themes) — added `aria-label`.
  - Layout B/C's meta-stats `<dl>` had `<dt>`/`<dd>` nested two levels deep instead of directly
    inside each row `<div>` (`definition-list`/`dlitem`, pre-existing) — restructured so the
    icon lives inside `<dt>`.
  - **Known remaining gap (honest, not fixed)**: Dark mode's genre-tag pills
    (`text-primary` on `bg-primary/10`) sit at 4.39:1, just under 4.5:1 — this is the
    **existing** dark-mode `--primary` (95% lightness, unchanged by this PR) and fixing it would
    mean darkening the site's established dark-mode brand orange, which is out of this PR's
    scope (brand preservation). Filed here rather than silently left out of the report.

## 9. Screenshots

`docs/releases/seamless-v2/screenshots/series-details-four-themes/` — 24 screenshots (4 layouts
× Light/Dark × 390/768/1440), captured via
`node scripts/screenshot-series-details-four-themes.mjs` against the demo preview build, plus
`manifest.json` listing every shot. Filenames: `layout-{A|B|C|D}-{light|dark}-{390|768|1440}.png`.

## 10–12. Commit / preview / gaps

See the chat response for the commit hash, preview URL, and full honest-gaps list (this file
covers the technical "what and why"; the response covers verification evidence and delivery
status).

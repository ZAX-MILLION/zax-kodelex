# Screenshot Notes — Pre-Upgrade Audit

**Date:** 2026-07-20

## Capture status

| Viewport | Target | Status |
|----------|--------|--------|
| Desktop ~1280px | Live demo homepage | **Not captured live** — browser MCP unavailable in audit session |
| Tablet ~768px | Live demo | Not captured |
| Mobile ~375px | Live demo | Not captured |

## Fallback assets included

Copied from existing repo documentation screenshots (README):

- `desktop-homepage-existing.png` ← `docs/screenshots/app-homepage.png`
- `desktop-hero-promo-existing.png` ← `docs/screenshots/hero-promo.png`

These represent the intended dark-mode homepage layout (desktop) but may predate latest commit `b8c42a0`.

## Live site verification (non-visual)

HTTP fetch of https://zax-million.github.io/zax-kodelex/ confirmed:
- Title: "Zax Million — Premium Manga Reading"
- Demo banner visible
- Hero carousel with 12+ series titles
- Latest Comics grid (12 cards on first page)
- Latest Updates feed with locked chapter badges
- Trending sidebar
- Blog section empty + error toast for blog API

## Recommended manual capture (owner or Prompt 02)

In Chrome DevTools device mode, save to this folder:

1. `mobile-375-homepage.png`
2. `tablet-768-homepage.png`
3. `desktop-1280-homepage.png`
4. `desktop-series-detail.png`
5. `desktop-admin-blocked.png` (visit `/admin` on demo)

Command to open demo: navigate to https://zax-million.github.io/zax-kodelex/

## Responsive issues (from code + RESPONSIVE_FIX_PLAN)

Mobile screenshots would likely show:
- Hero: 2 squeezed cards (`basis-1/2`)
- Latest Comics: dense 2-column cards
- Large gap between hero and content
- Nav logo text hidden below 320px

See `docs/RESPONSIVE_FIX_PLAN.md` for fix targets.

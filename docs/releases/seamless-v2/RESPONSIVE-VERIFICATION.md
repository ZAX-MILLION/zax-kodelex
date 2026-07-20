# Seamless V2 — Responsive verification

Date: 2026-07-20  
Branch: `upgrade/zax-seamless-v2`  
Demo serve: static SPA (`serve -s dist`) with `VITE_APP_ENV=demo`

## Summary

| Check | Result |
|-------|--------|
| Horizontal overflow (50 route×viewport shots) | **0 fails** |
| Runtime / page errors (filtered demo noise) | **0** |
| Axe serious/critical (`/`, `/series`, `/demo`, `/blog`, reader) | **0** |
| Unit tests | **31 passed** |
| Demo builds `/` and `/zax-kodelex/` | **pass** |

## Accessibility before → after

| Surface | Before (recorded) | After |
|---------|-------------------|--------|
| Homepage | 4 violation types (contrast, heading-order, landmark-complementary, link-name) | **0** serious/critical; full WCAG2 A/AA scan clean on re-run |
| Role Lab | 3 violation types (button-name, heading-order, link-name) | **0** |
| Series / Blog / Reader | not previously recorded | **0** serious/critical |

Artifacts: `docs/releases/seamless-v2/responsive-run.json`, prior `axe-homepage.json` / `axe-demo.json`.

## Issues found and fixes applied

| Area | Problem | Fix |
|------|---------|-----|
| `/series` | Demo build hit Supabase and failed empty | Local demo catalogue path in `Series.tsx` |
| Nav | Tiny touch targets; brand clipped at 320px; menu unbounded | `min-h-11` controls, safer brand truncate, max-height scroll menu, Escape close, tablet `md` nav |
| Nav landmarks | Logo used `<h1>` | Brand text is a `<span>` |
| Homepage | Nested `<aside>` / complementary landmarks | Switched to plain `<div>` |
| Footer | Social icons lacked names | `aria-label` + 44px hit area |
| Hero | Carousel arrows outside viewport | Inset arrows + 44px controls |
| Reader | Toolbars ignored safe-area; scale could overflow | `env(safe-area-inset-*)`, clamp image scale ≤100% |
| Browse | `?sort=latest` ignored | URL sort sync in `Browse.tsx` |
| Role Lab | Cards click-only; Reset label unclear | Button-driven activation; **Reset Demo** |
| Role deep links | `/demo/member` etc. missing | `DemoRoleAlias` routes |
| Contrast | Status / locked badges failed WCAG AA | Darker emerald/sky/rose solid badges |
| Demo Supabase | Placeholder client opened websocket | Disconnect realtime on offline client |
| PWA | Chapter assets could be precached outside demo | `globIgnores` for `demo/chapters` |

## Routes tested

`/`, `/series`, `/series/:id` (featured demo), `/reader/:seriesId/:n`, `/blog`, `/blog/:slug`, `/demo`, `/demo/checkout`, `/demo/uploader`, `/demo/admin`, Role Lab aliases (`/demo/member`, `/demo/paid-member`, `/demo/buyer`).

## Viewports tested

Capture matrix: **360×800**, **390×844**, **768×1024**, **1024×768**, **1440×900**.

Manual layout review also covered: 320, 375, 430, 820, 1280, 1920 (portrait/landscape where relevant).

## Screenshot index

Directory: `docs/releases/seamless-v2/screenshots/responsive-final/`

Pattern: `{route-id}-{viewport}.png`

Examples:

- `home-360x800.png`, `home-1440x900.png`
- `series-390x844.png`, `series-detail-768x1024.png`
- `reader-360x800.png`, `reader-1440x900.png`
- `blog-390x844.png`, `article-1024x768.png`
- `role-lab-360x800.png`, `checkout-390x844.png`
- `uploader-768x1024.png`, `admin-1440x900.png`

## How to re-run

```bash
npm run build:demo
npx serve dist -s -l 4174
node scripts/responsive-verify.mjs http://127.0.0.1:4174
```

## Preview deployment

**Live demo preview (for visual review only):** https://zax-kodelex.vercel.app  

Deployment-specific URL: https://zax-kodelex-cklbcunnd-copasik299-8255s-projects.vercel.app  

Built with `npm run build:demo` (payments/admin disabled). Do **not** attach production Supabase or live PayPal. Live GitHub Pages remains unchanged until ADMIN approves merge.

## Status

Ready for visual review on PR #2. **Do not merge** until ADMIN reviews the preview.

# Seamless V2 — Phase 5 Verification Sweep

Generated: 2026-07-22 · Branch: `upgrade/zax-seamless-v2` · HEAD after Phase 4: `1d03072`

**Decision: CONDITIONAL GO** for demo/staging preview on `upgrade/zax-seamless-v2`. **DO NOT MERGE** to `main` until ADMIN sign-off and production Supabase migration applied.

---

## 1. Lighthouse / performance baseline

| Metric | Result | Notes |
|--------|--------|-------|
| Lighthouse CLI (local) | **Not run** | Chrome not installed in CI shell; `npx lighthouse` failed |
| Demo main bundle (build) | **616 KB** raw / **178 KB** gzip (`index-BETnWhNK.js`) | From `npm run build:demo` 2026-07-22 |
| Demo CSS | **167 KB** raw / **25.5 KB** gzip | |
| Admin chunk (lazy) | **537 KB** raw / **124 KB** gzip | Not loaded on public demo homepage |
| Prior baseline (`bundle-metrics-demo.json`) | main 552 KB / 159 KB gzip | Slightly larger after homepage designs (+~19 KB gzip main) |

**Recommendation:** Run Lighthouse on deployed Vercel preview URL in browser DevTools before production cutover.

---

## 2. Demo isolation

| Check | Result |
|-------|--------|
| `appConfig.isDemo` forces `hasSupabase: false` | Pass (code) |
| Homepage network capture (`network-homepage-demo.json`) | **0 Supabase**, **0 PayPal**, **0 admin chunk** requests |
| `VITE_DISABLE_PAYMENTS=true` on demo build | Pass |
| `VITE_DISABLE_ADMIN=true` on demo build | Pass — `/admin/login` unavailable in demo bundle context |
| Demo admin at `/demo/admin/*` | Pass — session-only, no Admin bundle on browse/read flows |
| Unit: `demoAuth.test.ts` | **8/8 pass** — real auth off in demo |

---

## 3. Auth matrix

| Surface | Demo build | Staging/prod (when configured) |
|---------|------------|--------------------------------|
| Public browse/read | No login required | No login required |
| Real `/admin/*` | Disabled (`disableAdmin`) | Requires Supabase admin profile + `is_admin()` |
| `/demo/admin/*` | DemoRoleContext only | N/A |
| Role Lab `/demo` | Session role switch | Available when `features.roleLab` |
| PayPal / coins | Disabled | Gated by `VITE_PAYPAL_CLIENT_ID` + server secrets |
| Password reset | Route exists | Supabase auth when configured |

---

## 4. Secrets hygiene

| Scan | Result |
|------|--------|
| `service_role` / live keys in `src/` | **None found** |
| PayPal secret references | Admin diagnostic UI only (`PayPalSecretsChecker`) — names secrets, does not embed values |
| Client env surface | Anon key + public PayPal client id only (`.env.example`) |
| Server secrets | Documented as Edge Function dashboard-only |

---

## 5. Responsive + accessibility

Command: `npm run test:responsive` (2026-07-22)

| Metric | Count |
|--------|-------|
| Horizontal overflow failures | **0** |
| Serious/critical axe on swept routes | **0** |
| Runtime page errors | **0** |
| Screenshots updated | `docs/releases/seamless-v2/screenshots/responsive-final/` |

Routes swept include: `/`, `/series`, series detail, reader, blog, article, `/demo`, `/demo/admin`, checkout, uploader, admin (mocked).

**Pre-existing axe-homepage.json** (standalone audit, not re-run this sweep): 4 violations (color-contrast serious ×5 nodes, link-name serious ×3, heading-order moderate, landmark moderate). Responsive sweep reported 0 serious on current routes.

---

## 6. Series layouts + admin IA (Phase 1–2 evidence)

| Suite | Result |
|-------|--------|
| `series-layouts-verify.mjs` | **0 overflow**, **0 oversized Start Reading buttons** (12 screenshots) |
| Admin dashboard v2 demo screenshots | **12 captured** (home, series-design, appearance, backgrounds × 3 viewports) |
| Real `/admin` screenshots | **3 failures** — demo build disables admin login form; use staging build + mocked auth script for real admin captures |

---

## 7. Unit / type / lint

| Command | Result |
|---------|--------|
| `npm run typecheck` | **Pass** |
| `npm run lint` | **Pass** (pre-existing warnings only) |
| `npm test` | **143/143 pass** (15 files) |
| `npm run build:demo` | **Pass** |

---

## 8. Homepage designs (Phase 4)

| Item | Status |
|------|--------|
| Default design | **C — Catalogue** (`HOMEPAGE_DESIGN_DEFAULT`) |
| Admin picker | `/admin/homepage-design` |
| Demo compare | `/demo/home-styles` |
| Concept PNGs | **Not committed** (local `docs/releases/seamless-v2/homepage-concepts/` only) |

### PNG vs README discrepancies (PNG wins for visual intent)

| Topic | README says | PNG / implementation note |
|-------|-------------|---------------------------|
| Default implement first | **A — Editorial** | Task spec + code use **C — Catalogue** as fallback default |
| B hero | Full-bleed ~60% viewport | Implemented cinematic hero ~42–52vh + separate HeroSlider section |
| C search | Centered prominent search | Implemented functional search input; genre chips are static badges (not wired to filters yet) |
| D pricing | Large 3-tier section mid-page | Implemented pricing cards from `SUBSCRIPTION_PLANS` catalog |

---

## 9. Link / route hygiene

| Route | Status |
|-------|--------|
| `/admin/series-design`, `/admin/appearance`, `/admin/backgrounds`, `/admin/homepage-design` | Registered |
| `/demo/admin/*` nested routes | Registered |
| `/demo/home-styles` | Registered |
| Unknown admin routes | Fallback to dashboard home |

---

## 10. Go / no-go checklist

| Gate | Status |
|------|--------|
| All 5 phases committed + pushed | **Yes** (pending Phase 5 doc commit) |
| PR #2 not merged | **Yes** |
| No release notes published | **Yes** |
| Production migration `20260722020000_*` on prod DB | **ADMIN action** |
| ADMIN visual review of screenshots | **Pending** |
| Vercel prod redeploy | **Run after this commit** |

---

## 11. Commits (this run)

| Phase | Commit | Message |
|-------|--------|---------|
| 0 (base) | `0e649e5` | feat: add real admin access and redesign dashboard |
| 1 | `4128608` | feat: differentiate series layouts and chapter presentations |
| 2 | `002ed24` | feat: rebuild admin dashboard architecture |
| 3 | `3ba12b4` | docs: add seamless v2 phase 3 persistence audit |
| 4 | `1d03072` | feat: add selectable homepage designs |
| 5 | _(this doc)_ | docs: phase 5 verification sweep |

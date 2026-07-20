# Zax Million — Phase 1 Pre-Upgrade Audit

**Project:** Zax Million (package: `zax-million`)  
**Repository:** [ZAX-MILLION/zax-kodelex](https://github.com/ZAX-MILLION/zax-kodelex)  
**Local path:** `C:\Users\Windows 11\Projects\zax-kodelex`  
**Audit date:** 2026-07-20  
**Auditor scope:** Investigation only — no application code, dependencies, env, DNS, Pages settings, or production data changed  
**Git at audit start:** `main` @ `b8c42a02135a4890cf83ba88280349f2e60da307`

---

## Executive summary

Zax Million is a **React/Vite manga reading platform** with a large admin surface, Supabase backend, PayPal monetization hooks, and a **working public demo** on GitHub Pages. The codebase **builds and typechecks successfully**. The live demo is intentionally **database-free** and suitable for UI marketing only.

**Primary upgrade path:** Keep GitHub Pages as demo → deploy staging/production on Vercel/Netlify with Supabase → harden payments (sandbox first) → fix mobile homepage → complete security checklist.

**Application files modified during audit:** **0**

---

## 1. Project identity

| Field | Value |
|-------|-------|
| Display name | Zax Million |
| npm package | `zax-million` v1.0.0 |
| License | MIT (code only — not content rights) |
| Owner contact | ZAXMIllion@proton.me |
| Support | https://ko-fi.com/zaxmi |
| Dev server | http://localhost:8080 |

### GitHub Pages: user-site vs project-site

| URL | Type | Status | Explanation |
|-----|------|--------|-------------|
| https://zax-million.github.io/ | **User/org site root** | **404** | No repository configured to publish at account root |
| https://zax-million.github.io/zax-kodelex/ | **Project site** | **200 OK** | Repo `zax-kodelex` deployed via Actions; `VITE_BASE=/zax-kodelex/` |

This is **correct** for a project-scoped Pages deployment. README and workflow link to the project URL.

**Deploy workflow:** `.github/workflows/deploy-pages.yml`  
- Trigger: push to `main`, manual dispatch  
- Node 20, `npm ci`, demo build flags, SPA `404.html` copy  
- Artifact → `deploy-pages@v4`

---

## 2. Related systems

| System | Role | Connected on demo? |
|--------|------|-------------------|
| Supabase | Auth, Postgres, Storage, Edge Functions | **No** (no env in CI) |
| PayPal | Coins, subscriptions, webhooks | **No** on Pages |
| Ko-fi | Donations | Link only on Support page |
| Cloudflare | CDN ops (admin panel) | Optional edge function |
| PWA | Offline/install | Disabled on demo build |
| WordPress crawler | Admin import tool | Requires auth + DB |

---

## 3. Repository inventory

### Size summary

| Area | Files | Size |
|------|-------|------|
| `src/` | 487 | 24.12 MB |
| `docs/` | 21 | 3.73 MB |
| `public/` | 15 | 1.93 MB |
| `supabase/` | 91 | 0.34 MB |
| **Total** (excl. node_modules, .git, dist) | **634** | **30.85 MB** |

### Code counts

- **Pages:** 39 (`src/pages/*.tsx`)
- **Admin components:** 113 (`src/components/admin/`)
- **Migrations:** 82 SQL files
- **Edge functions:** 8

### Duplicate / overlapping names

Same filename in different folders (not necessarily duplicate logic):

| File | Locations | Notes |
|------|-----------|-------|
| `use-toast.ts` | `hooks/`, `components/ui/` | shadcn pattern |
| `Home.tsx` | `pages/`, `themes/components/` | page vs theme override |
| `WordPressCrawler.tsx` | `pages/`, `components/crawlers/` | page wrapper vs component |

Windows path listings may show both `src/pages/Buy.tsx` and `src\pages\Buy.tsx` — same file.

### Pre-existing vs audit artifacts

| Path | Origin |
|------|--------|
| `docs/RESPONSIVE_FIX_PLAN.md` | **Pre-existing** (untracked before audit) |
| `docs/audits/pre-upgrade/*` | **Created by this audit** |

Full machine-readable inventory: `project-inventory.json`

---

## 4. Technology stack

### Frontend

- React 18.3, TypeScript 5.5, Vite 5.4
- Tailwind CSS 3.4 + tailwindcss-animate + @tailwindcss/typography
- shadcn/ui (extensive Radix primitives)
- TanStack React Query 5
- React Router 6 (basename from `import.meta.env.BASE_URL`)
- react-helmet-async (SEO)
- Embla carousel, Recharts, DOMPurify, Zod, react-hook-form
- vite-plugin-pwa + Workbox (production builds only)

### Backend

- Supabase JS client 2.54
- 82 migrations — series, chapters, profiles, themes, coins, purchases, blog, etc.
- Edge functions (Deno): PayPal (4), security-middleware, check-subscription, cloudflare-operations, scheduled-deduplication

### Scripts (`package.json`)

| Command | Purpose |
|---------|---------|
| `npm run dev` | Dev server port 8080 |
| `npm run build` | Production Vite build |
| `npm run build:dev` | Development mode build |
| `npm run lint` | ESLint 9 |
| `npm run typecheck` | `tsc -b` |
| `npm run preview` | Preview dist |

---

## 5. Content & routes

### Route map (from `src/App.tsx`)

**Public:** `/`, `/home`, `/browse`, `/series`, `/series/:id`, `/blog`, `/help`, `/contact`, legal pages (`/privacy`, `/terms`, `/dmca`, etc.)

**Reader:** `/reader/:chapterId`, `/reader/:seriesId/:chapterNumber`, `/read/:seriesSlug/:chapterSlug`

**Auth:** `/login`, `/reset-password`, `/profile`, `/settings`

**Monetization:** `/coins`, `/premium`, `/subscribe`, `/buy`, `/monetization`, `/coin-analytics`

**Staff:** `/admin/*`, `/author/*`

**Tools:** `/wordpress-crawler`, `/contests`, `/community`, `/feedback`

**Redirects:** `/setup` → `/`, `/install` → `/`

### Demo content

- **20 series** in `src/utils/demoLibraryData.ts` (fictional titles)
- **20 chapters per series** (metadata only; `pages: []` in demo)
- Covers served from bundled/public assets
- Locked chapter UI shown for monetization preview

---

## 6. Design audit & direction

### Current aesthetic

- Dark-first manga platform with gradient accents
- Homepage: `ResetScansHomepage` — hero carousel, latest comics grid, updates feed, trending sidebar, blog section
- Child themes: Cyberpunk Neon, Zen Minimalist, Shiranami Sakura (+ custom via admin)
- Component library: shadcn/ui — consistent but admin-heavy

### Strengths

- Cohesive dark theme; readable typography
- Rich card metadata on desktop
- Theme system with CSS variables + ComponentRegistry
- Demo banner sets honest expectations

### Weaknesses (documented + confirmed in code)

See `docs/RESPONSIVE_FIX_PLAN.md`:

| Issue | Mobile impact |
|-------|---------------|
| Hero `basis-1/2` | Two tiny featured cards |
| `grid-cols-2` + full card metadata | Cramped latest comics |
| Double vertical spacing after hero | Large empty band |
| `EnhancedMangaCard` always shows 2 chapter rows | Tall, crowded cards |
| Nav logo hidden `<320px` | Icon-only brand |

### Design direction (Prompt 02+)

1. **Responsive tiers:** compact / standard / full card modes in one component
2. **Spacing tokens:** `px-4 sm:px-6 lg:px-8`, reduce hero→content gap on mobile
3. **Hero:** one card + peek on phone (~82% width)
4. **Align chrome:** nav/footer padding matches page containers
5. **Keep** dark brand; avoid new color system until responsive baseline fixed

---

## 7. Interactions & UX

| Feature | Demo behavior | Production needs |
|---------|---------------|------------------|
| Hero carousel | Swipe/drag (Embla) | Same |
| Search | UI present | Supabase full-text / API |
| Chapter unlock popup | Shows locked state | Coin wallet + PayPal |
| Comments | Component exists | DB + moderation |
| PWA install prompt | Disabled on demo | Enable on prod build |
| Setup wizard | Skipped on demo (`VITE_SKIP_SETUP`) | First-run Supabase config |

**Live demo errors (expected):**
- Toast: "Failed to load blog posts"
- Notification error for blog API

---

## 8. Responsive status

**Verdict:** Desktop acceptable; **mobile needs Phase 1 fixes** before marketing push.

**Breakpoints** (tailwind.config): `xs` 320, `sm` 640, `md` 768, `lg` 1024, `xl` 1280, `2xl` 1536

**Implementation plan exists:** `docs/RESPONSIVE_FIX_PLAN.md` — 3 phases + QA checklist

**Key files to touch (Phase 1):**
- `src/components/homepage/HeroSlider.tsx`
- `src/components/homepage/ResetScansHomepage.tsx`
- `src/components/manga/EnhancedMangaCard.tsx`

---

## 9. Performance

### Build output (standard `npm run build`)

| Asset | Raw | Gzip |
|-------|-----|------|
| `Admin-*.js` | 920 KB | 229 KB |
| `index-*.js` | 672 KB | 191 KB |
| `ui-*.js` | 195 KB | 62 KB |
| `index-*.css` | 151 KB | 23 KB |
| **dist total** | **4.23 MB** | — |

PWA precache: 91 entries, ~4.3 MB (production build only).

### Demo build (`VITE_DEMO_MODE=true`)

- Build time: **25.7s** vs 40.7s (no PWA plugin)
- Same JS chunk sizes (admin still in bundle — lazy route but downloaded on `/admin` visit)

### Recommendations

1. **Admin code-splitting** — already lazy route; consider prefetch guard so demo never loads Admin chunk
2. **Image optimization** — `src/utils/imageOptimization.ts` exists; verify cover sizes on CDN
3. **Browserslist** data 13 months old — run `npx update-browserslist-db@latest`
4. **Lighthouse** — not run this session; run on staging after deploy

---

## 10. SEO

### Implemented

- `EnhancedSEOHelmet`, `SEOHelmet`, `useSEO` hook
- Admin: SEOManager, SitemapManager, MetaTagsManager
- Homepage meta in App.tsx route
- Legal content in `src/content/legalDocuments.ts`

### Gaps

| Issue | File | Fix |
|-------|------|-----|
| Sitemap URL hardcoded to production domain | `public/robots.txt` | Point to actual domain or disable on demo |
| Demo on github.io | — | Add `noindex` for demo OR accept indexing of demo only |
| SPA on Pages | `404.html` copy | ✅ Already in workflow |
| Blog empty on demo | — | Expected; hurts content SEO until DB connected |

---

## 11. Accessibility

- Radix components provide baseline keyboard/focus patterns
- **Gaps noted in responsive plan:** hero filter buttons rely on tooltips (poor on touch) — add `aria-label`
- Touch targets: nav buttons should meet 44×44px on mobile
- No automated a11y scan run — recommend axe DevTools on homepage + reader in Prompt 02

---

## 12. Auth & roles

### Flow

1. `AuthProvider` — Supabase session + `profiles` table
2. Banned users auto sign-out with toast
3. `InstallationGate` — setup wizard if no credentials / not installed
4. `SecureRoute` / `AdminRoute` — role + premium checks with security logging

### Roles

`admin`, `editor`, `author`, `member`, `user`, `uploader`, `seo_manager`

### Permission model

- `useSimpleRole` — route-string pattern matching for admin sidebar
- `RoleGuard` — UI conditional render
- Premium via `useSubscription` + PayPal subscription check

### Test accounts

`src/hooks/useTestAccounts.ts` — **development only** (`import.meta.env.DEV`). Creates/logs in hardcoded test emails. Safe in production builds.

---

## 13. Demo architecture (summary)

Full document: `DEMO-AND-PAYMENT-ARCHITECTURE.md`

**GitHub Pages demo matrix:**

```
VITE_DEMO_MODE=true  → in-memory 20-series library
VITE_SKIP_SETUP=true → no setup wizard
No VITE_SUPABASE_*   → auth/payments/blog DB calls fail gracefully
VITE_BASE=/zax-kodelex/ → router basename
PWA disabled         → faster first paint
```

---

## 14. Payments & monetization

### In-app coins

- Tables: `coin_wallets`, `coin_transactions`
- PayPal edge: `paypal-purchase-coins`, `paypal-coin-webhook`
- Default API: **sandbox** (`PAYPAL_BASE_URL`)

### Subscriptions

- `/premium`, `/subscribe`
- Edge: `paypal-subscribe`, `check-subscription`, `paypal-webhook`

### Theme license `/buy`

- Prices: $49 / $149 / $299 USD
- **CRITICAL:** `processPayment()` simulates success with `setTimeout(3000)` — not real Stripe/PayPal despite UI labels

### Support donations

- Ko-fi link + optional `VITE_PAYPAL_CLIENT_ID`

### Egypt context

- PayPal USD accounts commonly used for digital exports; verify merchant eligibility
- No Stripe integration in repo; local gateways (Fawry, etc.) not implemented
- **Start sandbox-only**

### Refunds

- **No automated refund code** — owner must define policy before live payments

---

## 15. Security review

From `docs/SECURITY_CHECKLIST.md` + code inspection:

| Area | Status |
|------|--------|
| CSP / security headers utils | Implemented client-side |
| DOMPurify / validation utils | Present |
| Rate limiting (client + edge) | Present |
| RLS policies | **Manual audit required** |
| Leaked password protection | **Disabled — enable in Supabase** |
| OTP expiry | **Too long — reduce** |
| PayPal webhook signature verify | Verify in Prompt 02 |
| Admin destructive actions | Seed/reset buttons — admin-only |

Secrets: Only `VITE_*` in frontend; PayPal secrets belong in Supabase function env only. **No secrets recorded in this audit.**

---

## 16. Code quality

| Check | Result |
|-------|--------|
| `npm run build` | ✅ Pass |
| `npm run typecheck` | ✅ Pass |
| `npm run lint` | ⚠️ 0 errors, 478 warnings |

Warning breakdown (`docs/LINT_AUDIT.md`):
- 334× `@typescript-eslint/no-explicit-any`
- 134× `react-hooks/exhaustive-deps`
- 19× `react-refresh/only-export-components`

---

## 17. Folder structure proposal (post-upgrade)

No mandatory restructure. Optional clarity:

```
src/
  features/           # optional future: group by domain
    reader/
    admin/
    monetization/
  components/         # keep shared UI
  pages/              # route entrypoints only
docs/
  audits/pre-upgrade/ # this audit (archive after upgrade)
  runbooks/           # ops: deploy, rollback, payments
```

**Do not** mass-move files in Phase 1 — high churn risk.

---

## 18. Hosting architecture recommendation

| Tier | Host | Config |
|------|------|--------|
| **Demo** | GitHub Pages | Current workflow + add payment/admin disable flags |
| **Staging** | Vercel or Netlify | Supabase staging project, PayPal sandbox |
| **Production** | Vercel or Netlify + custom domain | Supabase prod, PayPal live, PWA on |

**Not recommended:** Single GitHub Pages host for production (no secure server env, no webhooks on static host).

---

## 19. Implementation phases (for Prompt 02+)

### Phase A — Quick wins (1–2 weeks)

1. Responsive homepage Phase 1 (`RESPONSIVE_FIX_PLAN.md`)
2. Demo hardening flags in Pages CI
3. Fix `robots.txt` / sitemap for correct environment
4. Staging deploy + Supabase project

### Phase B — Backend & payments (2–4 weeks)

5. RLS audit + auth hardening
6. PayPal sandbox E2E (coins + subscription)
7. Remove or gate simulated `/buy` payment
8. Blog + content on staging

### Phase C — Production launch

9. Custom domain + SSL
10. Lighthouse + a11y pass
11. Live PayPal (owner sign-off)
12. Monitoring (optional Sentry `VITE_SENTRY_DSN`)

---

## 20. Owner inputs

See `OWNER-DECISIONS.md`. Defaults allow work to start without blocking.

---

## 21. Evidence index

| Claim | Evidence |
|-------|----------|
| User-site 404 | HTTP fetch 2026-07-20 |
| Demo live | HTTP fetch + README |
| Build sizes | `npm run build` output in COMMAND-LOG |
| Simulated buy | `src/pages/Buy.tsx` lines 169–207 |
| Demo data | `src/utils/demoLibraryData.ts` |
| Pages CI | `.github/workflows/deploy-pages.yml` |
| Responsive issues | `docs/RESPONSIVE_FIX_PLAN.md` + HeroSlider/EnhancedMangaCard |

---

## 22. Audit deliverables checklist

- [x] `ZAX-SITE-PRE-UPGRADE-AUDIT.md` (this file)
- [x] `project-inventory.json`
- [x] `COMMAND-LOG.md`
- [x] `AUDIT-SUMMARY.md`
- [x] `DEMO-AND-PAYMENT-ARCHITECTURE.md`
- [x] `OWNER-DECISIONS.md`
- [x] `screenshots/` (existing desktop assets + notes)

---

*End of Phase 1 pre-upgrade audit.*

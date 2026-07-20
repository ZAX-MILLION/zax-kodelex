# Demo & Payment Architecture — Zax Million (Phase 1 Audit)

**Audience:** Owner + Prompt 02 implementer  
**Date:** 2026-07-20  
**Status:** Investigation only — recommendations, not implemented

---

## 1. Two deployment modes (must stay separate)

| Mode | Where | Database | Payments | Purpose |
|------|-------|----------|----------|---------|
| **Public demo** | GitHub Pages `/zax-kodelex/` | None (in-memory demo library) | **Hard blocked** | Marketing / UI preview |
| **Production** | Custom domain + Supabase | Live Postgres | PayPal sandbox → live (after review) | Real product |

**Evidence:** `.github/workflows/deploy-pages.yml` sets `VITE_DEMO_MODE=true`, `VITE_SKIP_SETUP=true`, `VITE_BASE=/zax-kodelex/`. No Supabase secrets in CI.

---

## 2. Demo mode — how it works today

### Activation

- Env: `VITE_DEMO_MODE=true` OR local `import.meta.env.DEV`
- Code: `src/utils/demoLibraryData.ts` → `isDemoModeEnabled()`
- Hooks fall back to demo data when demo enabled OR Supabase not configured:
  - `useSeriesData`, `useMangaData`, `useHomepageData`, `useChaptersFeed`, `useChildTheme`

### What visitors see

- **20 fictional series** (manga/manhwa/manhua/novel titles)
- **Covers + metadata** (ratings, locked chapter badges in UI)
- **Demo banner:** `DemoModeBanner` — "chapter pages are not included"
- **No chapter artwork** — reader routes exist but content is placeholder/empty in demo
- **Blog:** fails gracefully ("Failed to load blog posts") — expected without DB
- **Auth:** Supabase not configured on Pages → sign-in/sign-up non-functional on public demo

### PWA behavior

- Demo build **skips** `vite-plugin-pwa` (faster first load)
- Full production build enables PWA with ~4.3 MB precache

---

## 3. Role matrix — Guest / Member / Paid / TestBuyer / Uploader / Admin

| Role | Auth required | Demo (GitHub Pages) | Production (recommended) |
|------|---------------|---------------------|--------------------------|
| **Guest** | No | Browse demo library, legal pages, marketing | Browse public catalog |
| **Member** | Yes (`member` or `user` profile) | N/A (no DB) | Profile, comments, free chapters |
| **Paid / Premium** | Yes + subscription | N/A | Early access, ad-free, premium themes (`useSubscription`) |
| **TestBuyer** | Yes (test account) | **Block** — no coin purchases on demo | Sandbox PayPal only; isolated test user |
| **Uploader** | Yes (`uploader` role) | **Block** uploads/admin | Upload panel, chapter management |
| **Admin** | Yes (`admin` role) | **Block** — `/admin/*` should redirect/deny without session | Full dashboard (113 admin components) |

### Roles in code (`AuthContext` / `profiles.role`)

`admin`, `editor`, `author`, `member`, `user`, `uploader`, `seo_manager`

Route guards: `SecureRoute`, `AdminRoute`, `RoleGuard`, `useSimpleRole`

---

## 4. Hard blocks required before any upgrade (safe demo)

These are **not all enforced today** on GitHub Pages — Prompt 02 should implement or verify:

| Block | Why | Current state |
|-------|-----|---------------|
| No PayPal/Stripe on Pages demo | Prevent accidental charges / broken checkout | ✅ No payment env in CI; coin/buy pages may still render UI |
| `/buy` simulated payment | `Buy.tsx` uses `setTimeout` to mark purchase complete — **dangerous if connected to real DB** | ⚠️ Simulated — must stay dev-only or behind feature flag |
| Admin seed/reset buttons | `ComprehensiveDataResetButton`, `DemoDataSeeder`, etc. | ⚠️ Only safe if admin auth + RLS enforced |
| Test account shortcuts | `useTestAccounts` — hardcoded emails, **DEV only** (`import.meta.env.DEV`) | ✅ Blocked in production builds |
| PayPal edge functions default sandbox | `PAYPAL_BASE_URL` defaults to `api-m.sandbox.paypal.com` | ⚠️ Must verify before Egypt live launch |

### Recommended demo flags (Prompt 02)

```env
# GitHub Pages (already in CI)
VITE_DEMO_MODE=true
VITE_SKIP_SETUP=true
VITE_BASE=/zax-kodelex/

# Add for upgrade (recommended)
VITE_DISABLE_PAYMENTS=true
VITE_DISABLE_ADMIN=true   # optional: hide admin nav entirely on demo
```

---

## 5. Isolation & reset

| Tool | Path | Use |
|------|------|-----|
| Demo library (client-only) | `src/utils/demoLibraryData.ts` | No DB writes |
| Demo cleanup | `src/utils/seed/cleanupDemoData.ts` | Deletes demo rows from Supabase (admin/dev) |
| Comprehensive reset | `src/components/admin/ComprehensiveDataResetButton.tsx` | **Production danger** — admin only |
| Curated 10×10 seed | `src/utils/seed/curatedReset10x10.ts` | Dev/staging content |
| Test users | `src/utils/seed/seedTestUsers.ts`, `useTestAccounts.ts` | Local dev only |

**Rule:** Never run seed/reset against production without backup. Demo on Pages needs **zero** Supabase credentials.

---

## 6. Payment systems inventory

### A. In-app coins (reader monetization)

- **UI:** `/coins` → `CoinStore`, `CoinWallet`, `ChapterUnlockPopup`
- **Backend:** `coin_wallets`, `coin_transactions` tables
- **PayPal:** Edge functions:
  - `paypal-purchase-coins` — creates PayPal order (sandbox default)
  - `paypal-coin-webhook` — fulfillment webhook
- **Secrets (server only):** `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_BASE_URL`

### B. Subscriptions / Premium

- **UI:** `/premium`, `/subscribe`
- **Edge:** `paypal-subscribe`, `check-subscription`, `paypal-webhook`
- **Hook:** `useSubscription` → premium gating in `RoleGuard`

### C. Theme license sales (`/buy`)

- **Pricing:** Single $49, Extended $149, Developer $299 (USD)
- **Implementation:** Creates `customers`, `purchases`, `licenses` in Supabase
- **Payment:** **Simulated** — 3s timeout then marks `completed` without real processor
- **Download:** Demo text file, not real zip

### D. Donations / support

- **Support page:** Ko-fi link + optional `VITE_PAYPAL_CLIENT_ID` for PayPal donate button
- **No webhook** required for simple donate embed

---

## 7. Sandbox vs live — Egypt context

### PayPal

- PayPal operates in Egypt with **USD accounts**; local EGP receiving has limitations and compliance requirements.
- **Recommendation:** Start with **PayPal Sandbox** for all TestBuyer flows; move to live only after:
  1. Business verification complete
  2. Webhook URLs point to production Supabase functions
  3. `PAYPAL_BASE_URL=https://api-m.paypal.com` (not sandbox)
  4. Refund policy published (see §8)

### Alternatives to evaluate (owner decision)

| Provider | Notes for Egypt |
|----------|-----------------|
| PayPal | Supported; USD common for digital goods |
| Stripe | Limited merchant availability in Egypt — verify before building |
| Fawry / local gateways | May need custom integration (not in codebase today) |
| Ko-fi | Already linked; good for tips, not chapter unlocks |

**Safe default:** PayPal sandbox + Ko-fi donations until owner confirms live merchant status.

---

## 8. Payment security & refunds (critical warnings)

1. **`/buy` is not production-ready** — simulated payment must not be exposed with a live Supabase project without real payment integration.
2. **Webhook verification** — confirm `paypal-webhook` and `paypal-coin-webhook` validate PayPal signatures before crediting coins.
3. **Client-side trust** — coin balances must only change via server/webhook, never from client-only logic.
4. **Refunds:** No automated refund flow found in codebase. Owner must define:
   - Digital goods / coin refund policy (often no refund after unlock)
   - Chargeback handling via PayPal resolution center
   - Egypt consumer protection — publish clear Terms (`docs/legal/`)
5. **RLS audit** — `docs/SECURITY_CHECKLIST.md` flags manual RLS review as **required**.
6. **Leaked password protection** — Supabase setting must be enabled before launch.

---

## 9. Recommended architecture (Prompt 02)

```
┌─────────────────────────────────────────────────────────────┐
│  VISITORS                                                    │
└───────────────┬─────────────────────────┬───────────────────┘
                │                         │
        GitHub Pages                  Production host
        (demo only)                   (Vercel/Netlify/CF)
                │                         │
                ▼                         ▼
        Static SPA                  Static SPA + env
        VITE_DEMO_MODE=true         VITE_SUPABASE_* set
        No secrets                  VITE_DISABLE_PAYMENTS=false
                │                         │
                │                         ▼
                │                   Supabase Project
                │                   ├── Auth + RLS
                │                   ├── Postgres
                │                   ├── Storage (covers/pages)
                │                   └── Edge Functions
                │                         │
                │                         ▼
                │                   PayPal (sandbox → live)
                └─────────────────────────────────────────
                     Same codebase, different env matrix
```

---

## 10. TestBuyer flow (staging only)

1. Create dedicated Supabase project for **staging**
2. Seed test user with `member` role + starting coins optional
3. Configure PayPal **sandbox** app + webhook to staging functions
4. Test: purchase coins → unlock chapter → verify transaction row
5. Never reuse sandbox credentials in production

---

*End of demo & payment architecture document.*

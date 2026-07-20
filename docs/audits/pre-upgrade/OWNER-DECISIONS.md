# Owner Decisions — Zax Million Pre-Upgrade

**For:** Project owner (non-developer)  
**Date:** 2026-07-20  
**Instructions:** Review each section. Defaults marked ✅ are safe if you skip — implementer can proceed. Items marked ⚠️ need your answer before live payments or custom domain.

---

## Decision 1 — What is the public demo for?

**Question:** Should GitHub Pages stay a **UI-only demo** (no login, no payments)?

| Option | Description |
|--------|-------------|
| A ✅ **Recommended** | Keep demo as showcase only — current setup |
| B | Allow demo login with a shared test Supabase (more complex, higher risk) |

**Safe default:** **A** — no change.

---

## Decision 2 — Production domain

**Question:** What is your real site URL?

| Option | Example |
|--------|---------|
| A | `zaxmillion.com` (referenced in robots.txt) |
| B ✅ **Recommended for now** | No custom domain yet — use staging subdomain later |
| C | Other: _________________ |

**Safe default:** **B** — configure domain in Prompt 02 when ready.

**Note:** `public/robots.txt` sitemap points to `https://zaxmillion.com/sitemap.xml` — update when domain is live.

---

## Decision 3 — Hosting for production

**Question:** Where should the **real** app run (not the GitHub demo)?

| Option | Pros | Cons |
|--------|------|------|
| A ✅ **Vercel or Netlify** | Easy, free tier, env vars, auto HTTPS | Separate from Supabase |
| B | Cloudflare Pages | Good CDN; needs Supabase CORS setup |
| C | Keep GitHub Pages only | Cannot run live DB/payments properly |

**Safe default:** **A — Vercel or Netlify + Supabase.**

---

## Decision 4 — Payments go-live (Egypt)

**Question:** When should real money be accepted?

| Option | When |
|--------|------|
| A ✅ **Recommended** | After staging tests + legal pages reviewed + PayPal business verified |
| B | Immediately with PayPal sandbox only (no real charges) |
| C | Skip in-app payments; donations via Ko-fi only |

**Safe default:** **B for development, A for live.**

**Egypt note:** Confirm your PayPal business account can receive USD for digital goods. Stripe is not pre-integrated for Egypt in this codebase.

---

## Decision 5 — Coin pricing currency

**Question:** Display prices in which currency?

| Option | Notes |
|--------|-------|
| A ✅ **USD** | Matches `/buy` and PayPal edge functions today |
| B | EGP display + USD settlement (needs conversion UX) |

**Safe default:** **A — USD.**

---

## Decision 6 — Refund policy

**Question:** Refunds for purchased coins or premium?

| Option | Policy |
|--------|--------|
| A ✅ **Recommended** | No refunds on consumed digital coins; PayPal disputes handled case-by-case |
| B | 7-day refund window |
| C | Full refund anytime |

**Safe default:** **A** — add clear wording to Terms before live payments.

⚠️ **Owner must confirm** — legal/compliance preference.

---

## Decision 7 — Theme license `/buy` page

**Question:** Sell theme source licenses through the app?

| Option | Description |
|--------|-------------|
| A ✅ **Hide until real payment** | `/buy` currently fakes payment — do not promote |
| B | Integrate real PayPal/Stripe for license sales |
| C | Remove `/buy`; sell only via Ko-fi/email |

**Safe default:** **A.**

---

## Decision 8 — Responsive homepage fixes

**Question:** Proceed with mobile layout fixes documented in `docs/RESPONSIVE_FIX_PLAN.md`?

| Option | Effort |
|--------|--------|
| A ✅ **Phase 1 quick wins first** | ~1–2 hours — hero + spacing + simpler cards |
| B | Full 3-phase plan before upgrade |
| C | Defer — upgrade backend first |

**Safe default:** **A** — improves demo first impression.

---

## Decision 9 — Admin access on demo site

**Question:** Should `/admin` be visible on GitHub Pages?

| Option | Risk |
|--------|------|
| A ✅ **Hide admin nav + block routes on demo** | Lowest |
| B | Show admin UI but require login (needs Supabase — not on demo) |
| C | Leave as-is (admin UI loads client bundle but cannot auth) |

**Safe default:** **A** — add `VITE_DISABLE_ADMIN` on Pages build.

---

## Decision 10 — Content & legal responsibility

**Question:** Who provides licensed manga/content for production?

| Option | |
|--------|--|
| A ✅ **Owner uploads only licensed/original content** | Required by MIT NOTICE |
| B | User-generated uploads with moderation |

**Safe default:** **A + enable moderation tools already in admin.**

⚠️ **Owner confirms** content rights.

---

## Decision 11 — Email & support

**Current contacts (from README):**
- Email: ZAXMIllion@proton.me
- Ko-fi: https://ko-fi.com/zaxmi

**Question:** Keep these for production?

| Option |
|--------|
| A ✅ Yes — no change |
| B | Use custom domain email: _________________ |

**Safe default:** **A.**

---

## Decision 12 — Upgrade priority order

**Question:** What order for Prompt 02+?

| Priority ✅ Recommended | Task |
|-------------------------|------|
| 1 | Fix responsive homepage (Phase 1) |
| 2 | Staging Supabase + env on Vercel/Netlify |
| 3 | Harden demo blocks (no payments/admin on Pages) |
| 4 | PayPal sandbox end-to-end test |
| 5 | Security checklist (RLS, leaked passwords, OTP) |
| 6 | Custom domain + SEO sitemap update |
| 7 | Live payments (after owner sign-off) |

**Safe default:** Follow table order.

---

## Summary — if you answer nothing

Implementer may proceed with all ✅ defaults:

- Demo stays UI-only on GitHub Pages  
- Production on Vercel/Netlify + Supabase (staging first)  
- USD, PayPal sandbox until verified, no live `/buy`  
- Responsive Phase 1 quick wins  
- Hide admin on demo  
- No refunds on spent coins (document in Terms)  
- Owner responsible for licensed content  

---

*Reply with decision numbers + choices, or say "use all defaults" to start Prompt 02.*

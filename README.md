<div align="center">

# Zax Million

### A premium manga platform you can actually ship

Beautiful library. Smooth reader. Themes that feel alive.  
Built for creators and operators who want a real product — not a throwaway demo.

[![Live Demo](https://img.shields.io/badge/Live_Demo-Try_it_now-e11d48?style=for-the-badge)](https://zax-million.github.io/zax-kodelex/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0f172a?style=for-the-badge)](LICENSE)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://react.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)

**[Open the live demo](https://zax-million.github.io/zax-kodelex/)** · **[Seamless V2 preview](https://zax-kodelex.vercel.app)** · **[Docs](docs/SETUP.md)** · **[Support](https://ko-fi.com/zaxmi)**

<br />

![Zax Million homepage](docs/screenshots/app-homepage.png)

<em>Dark library UI — featured series, latest releases, and trending discovery</em>

<br />

![Zax Million promo](docs/screenshots/hero-promo.png)

</div>

---

## Why Zax Million?

Most “manga starter kits” stop at a pretty homepage.  
**Zax Million** is built like a platform: reading, discovery, memberships, uploads, and admin — with a public demo you can click through today.

| You want… | You get… |
|-----------|----------|
| Instant proof it works | A **no-install live demo** anyone can open |
| A modern reading feel | Vertical webtoon + page modes, mobile-first |
| Your own look | Switchable child themes (Neon, Zen, Sakura…) |
| A path to revenue | Coins, premium chapters, memberships, support links |
| Control | Full admin tools for series, users, and monetization |

---

## Try it in 10 seconds

No clone. No account. No setup wizard.

| | Link | Best for |
|---|------|----------|
| **Live demo** | [zax-million.github.io/zax-kodelex](https://zax-million.github.io/zax-kodelex/) | Public site visitors |
| **Seamless V2 preview** | [zax-kodelex.vercel.app](https://zax-kodelex.vercel.app) | Newest homepage, Role Lab, readable demo chapters |

> Demo builds use sample content and **fake payments**. They are safe to explore — not a live store.

---

## Features that stand out

### Immersive reading
- Vertical **webtoon** scroll and classic page-by-page
- Progress, chapter nav, and controls that stay out of the art
- Mobile and desktop layouts that don’t fight the viewport

### Discovery that feels editorial
- Featured hero, latest releases, trending, membership, and feed
- Browse, search, categories, and series detail pages
- Demo blog for news / creator updates

### Themes with personality
- **Cyberpunk Neon** · **Zen Minimalist** · **Shiranami Sakura**
- Child-theme system powered by CSS variables + component registry
- Build or import your own look without rewriting the app

### Roles & monetization (ready when you are)
- Auth: sign-up, sign-in, password reset
- Coins, premium unlocks, subscriptions, support (PayPal / Ko-fi)
- **Role Lab** in demo: guest → member → buyer → uploader → admin simulation

### Built for operators
- Admin dashboard for series, chapters, users, themes, monetization
- PWA — installable progressive web app
- Setup wizard on first launch when env vars are missing

---

## Quick start (about 5 minutes)

```bash
git clone https://github.com/ZAX-MILLION/zax-kodelex.git
cd zax-kodelex
npm install
cp .env.example .env
npm run dev
```

Open **http://localhost:8080**.

| Goal | What to do |
|------|------------|
| Explore without a database | Set `VITE_DEMO_MODE=true` in `.env` |
| Run a full local product | Add your Supabase URL + anon key (see below) |
| Ship a static demo build | `npm run build:demo` |

On first launch without env vars, the **setup wizard** walks you through Supabase and creating an admin account.

---

## Environment variables

| Variable | Required | What it does |
|----------|----------|--------------|
| `VITE_SUPABASE_URL` | Yes (production) | Your Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Yes (production) | Public anon key |
| `VITE_DEMO_MODE` | No | Built-in demo library when the DB is empty |
| `VITE_PAYPAL_CLIENT_ID` | No | PayPal on the Support page |
| `VITE_SKIP_SETUP` | No | Skip the first-run wizard |

Full production checklist → **[docs/SETUP.md](docs/SETUP.md)**

---

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Dev server on port **8080** |
| `npm run build` | Production build |
| `npm run build:demo` | Demo-only static build (no live payments/admin) |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests |

---

## Tech stack

<div align="center">

**React 18** · **TypeScript** · **Vite** · **Tailwind** · **shadcn/ui** · **TanStack Query**  
**Supabase** (Postgres · Auth · Storage · Edge Functions)  
**Themes** → `child_themes` → CSS variables → ComponentRegistry

</div>

---

## Documentation

| Guide | When you need it |
|-------|------------------|
| [Setup](docs/SETUP.md) | Supabase, migrations, edge functions, deploy |
| [GitHub Pages demo](docs/GITHUB_PAGES_DEMO.md) | How the free public demo stays online |
| [Themes](docs/THEMES.md) | Create / import child themes |
| [Security checklist](docs/SECURITY_CHECKLIST.md) | Before you go live |
| [Legal](docs/legal/) | Terms, Privacy, DMCA, Acceptable Use |

---

## Project map

```text
src/
  components/     UI · admin · reader · homepage · setup
  contexts/       Auth · feature flags · i18n
  hooks/          Data · SEO · installation
  integrations/   Supabase client
  pages/          Routes (library, reader, demo, blog…)
  themes/         Numbered child themes
  utils/          Runtime helpers + seed tooling
docs/             Setup, themes, runbooks, release notes
supabase/         Migrations + edge functions
public/           Static assets, demo chapter art, SEO files
```

---

## Support the project

If Zax Million saves you time, fuel the next chapter:

- **Ko-fi:** [ko-fi.com/zaxmi](https://ko-fi.com/zaxmi)
- **Email:** [ZAXMIllion@proton.me](mailto:ZAXMIllion@proton.me)

---

## License

MIT — see [`LICENSE`](LICENSE) and [`NOTICE`](NOTICE).

**The MIT license covers the code only.**  
It does **not** allow hosting pirated manga or other illegal content.  
Operators are responsible for what they publish. Legal drafts live in [docs/legal](docs/legal/).

---

<div align="center">

**Read more. Build better. Ship yours.**

[Try the live demo](https://zax-million.github.io/zax-kodelex/) · [Seamless V2 preview](https://zax-kodelex.vercel.app) · [Star the repo](https://github.com/ZAX-MILLION/zax-kodelex)

</div>

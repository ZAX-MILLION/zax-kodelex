# Zax Million — Setup Guide

Complete setup for a fresh Zax Million deployment.

## Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works for development)
- Optional: PayPal developer account for donations

## 1. Clone and install

```bash
git clone <repo-url> zax-million
cd zax-million
npm install
cp .env.example .env
```

## 2. Supabase project

1. Create a project at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Go to **Settings → API** and copy:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`
3. Paste into `.env`

## 3. Run database migrations

Install the [Supabase CLI](https://supabase.com/docs/guides/cli) or use the SQL editor in the dashboard.

```bash
# Link your project (one-time)
supabase link --project-ref <your-project-ref>

# Push all migrations
supabase db push
```

Migrations live in `supabase/migrations/` (80+ files). They create tables for series, chapters, profiles, child themes, monetization, and more.

### Auth settings

In Supabase **Authentication → URL Configuration**:

- **Site URL:** your production domain (e.g. `https://zaxmillion.com`)
- **Redirect URLs:** add `https://zaxmillion.com/reset-password` and `http://localhost:8080/reset-password`

Customize email templates with Zax Million branding under **Authentication → Email Templates**.

## 4. Deploy edge functions (optional)

Seven edge functions are in `supabase/functions/`:

```bash
supabase functions deploy paypal-subscribe
supabase functions deploy paypal-webhook
# ... deploy remaining functions as needed
```

Set secrets in the Supabase dashboard for PayPal and other integrations.

## 5. First-run wizard

**Option A — Environment variables (recommended for production)**

Set `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in your hosting provider. Deploy the app. Users go straight to the homepage.

Create your admin account via **Sign Up** in the auth modal, then promote the user in Supabase:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'you@example.com';
```

**Option B — Setup wizard (self-hosted / first clone)**

Leave env vars empty. Start the dev server:

```bash
npm run dev
```

The setup wizard at `/` will:

1. Collect Supabase URL and anon key (stored in `localStorage`)
2. Test the connection
3. Create an admin account via `signUp`
4. Mark installation complete

After setup, reload the page so the Supabase client picks up stored credentials.

## 6. Seed content (optional)

In **Admin → Dev Tools**, use the demo library seeder, or run from the browser console in dev:

```js
import { seedDemoLibrary } from './src/utils/seed/seedDemoLibrary';
await seedDemoLibrary();
```

For production with real content, upload series and chapters through the admin panel.

## 7. PayPal donations

1. Create a PayPal app at [developer.paypal.com](https://developer.paypal.com)
2. Set `VITE_PAYPAL_CLIENT_ID` in `.env`
3. Deploy `paypal-subscribe` and `paypal-webhook` edge functions with PayPal secrets

Without this variable, the Support page shows Ko-fi only (https://ko-fi.com/zaxmi).

## 8. Production deployment

Deploy to Vercel, Netlify, or Cloudflare Pages:

| Setting | Value |
|---------|-------|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 18+ |

**Required env vars:**

```
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

**Optional:**

```
VITE_PAYPAL_CLIENT_ID=...
VITE_SITE_URL=https://zaxmillion.com
```

Point your domain, enable HTTPS, and verify `public/sitemap.xml` and `public/robots.txt`.

## 9. Verify

```bash
npm run typecheck
npm run lint
npm run build
```

Smoke test:

- [ ] Homepage loads with theme
- [ ] Sign up / sign in / sign out
- [ ] Password reset email → `/reset-password`
- [ ] Admin panel at `/admin` (admin role)
- [ ] Reader at `/reader/:chapterId`
- [ ] Support page Ko-fi link works

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Setup wizard loops | Set `VITE_SUPABASE_*` env vars or complete wizard; check `install_status` table |
| Empty homepage | Add series in admin, or enable `VITE_DEMO_MODE=true` in dev |
| Auth "Access Denied" on admin | Confirm profile `role = 'admin'` in Supabase |
| Build fails on assets | Ensure `src/assets/` contains `hero-bg.jpg`, `reader-bg.jpg`, `zax-million-logo.png` |

## Contact

- Email: contact@zaxmillion.com
- Ko-fi: https://ko-fi.com/zaxmi

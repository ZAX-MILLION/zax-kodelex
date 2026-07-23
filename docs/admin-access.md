# Granting real administrator access

This project has **no signup flow, environment flag, or button that grants
admin access**. There is intentionally no backdoor. The only way to make an
account an administrator is to update its role directly in the database.

## How admin access works

- Real authentication is Supabase email/password (`src/contexts/AuthContext.tsx`).
- Every account gets a row in `public.profiles` with `role = 'member'` by
  default (see `supabase/migrations/20250711230000_zax_launch_auth_fixes.sql`).
- An account is an administrator only when `public.profiles.role = 'admin'`
  for that user. This is checked:
  - **Frontend**: `AuthContext.isAdmin` gates `/admin/*` via `AdminRoute` /
    `AdminLayout` and redirects to `/admin/login`.
  - **Backend (RLS)**: `public.is_admin(user_id)` is a `SECURITY DEFINER`
    SQL function used across row-level security policies, so admin-only
    writes are rejected by Postgres even if the frontend check were somehow
    bypassed.

## Granting the first administrator

1. Create a normal account through the site (sign up with the email you want
   to use as an administrator). It will be created with `role = 'member'`.
2. In the Supabase dashboard for your project, open **SQL Editor** and run:

   ```sql
   update public.profiles
   set role = 'admin'
   where email = 'you@example.com'; -- replace with the real account email
   ```

3. Sign out and sign back in at `/admin/login` (or refresh if already
   signed in) — the new session will pick up the `admin` role and unlock
   `/admin`.

## Granting additional administrators later

Once you have one administrator, you can promote further accounts from the
UI instead of SQL: **Admin → Users → Roles and Permissions**
(`/admin/roles`) lets an existing administrator change another user's role,
including to `admin`. This still writes through the same `profiles.role`
column and is still enforced by `is_admin()` RLS.

## What is intentionally NOT supported

- No hardcoded admin email/password.
- No environment variable or build flag that grants admin access.
- No client-side-only role — the `demo` role in the public Role Lab
  (`/demo/admin`) is a local/session-only simulation and can never reach the
  real `/admin` dashboard, regardless of `localStorage`/`sessionStorage`
  contents (see `src/features/demo/demoAuthPolicy.ts` and
  `tests/unit/demoAuth.test.ts`).
- No service-role key in the frontend bundle — role changes must go through
  the authenticated user's own RLS-checked `profiles` update (via the SQL
  editor for the first admin, or the Roles and Permissions screen after).

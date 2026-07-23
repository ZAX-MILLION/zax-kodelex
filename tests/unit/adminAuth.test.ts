import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('real admin login route', () => {
  it('registers /admin/login guarded the same way as /admin', () => {
    const app = read('src/App.tsx');
    expect(app).toMatch(/path="\/admin\/login"\s+element=\{<AdminRouteGuard><AdminLogin/);
    expect(app).toContain("const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'));");
  });

  it('redirects unauthenticated or non-admin users to /admin/login and preserves the destination', () => {
    const adminPage = read('src/pages/Admin.tsx');
    expect(adminPage).toContain('fallbackPath="/admin/login"');

    const secureRoute = read('src/components/auth/SecureRoute.tsx');
    expect(secureRoute).toMatch(/state=\{\{\s*from:\s*location\.pathname\s*\}\}/);

    const adminLayout = read('src/components/admin/AdminLayout.tsx');
    expect(adminLayout).toContain('/admin/login');
    expect(adminLayout).toMatch(/if \(!user \|\| !isAdmin\)/);
  });

  it('never renders a login form for an authenticated non-admin account', () => {
    const loginPage = read('src/pages/admin/AdminLogin.tsx');
    expect(loginPage).toContain('Not an administrator account');
    expect(loginPage).toMatch(/user && !isAdmin/);
  });

  it('uses real Supabase-backed auth, not demo roles, and has no hardcoded credentials', () => {
    const loginPage = read('src/pages/admin/AdminLogin.tsx');
    expect(loginPage).toContain("import { useAuth } from '@/contexts/AuthContext'");
    expect(loginPage).toContain('isRealAuthEnabled');
    expect(loginPage).not.toMatch(/password\s*===\s*['"]/i);
    expect(loginPage).not.toMatch(/admin@manga\.com/);
    expect(loginPage).not.toMatch(/manga_admin_2025/);
  });

  it('supports forgot-password and shows validation errors', () => {
    const loginPage = read('src/pages/admin/AdminLogin.tsx');
    expect(loginPage).toContain('resetPassword');
    expect(loginPage).toContain('Forgot your password?');
    expect(loginPage).toContain('fieldErrors');
  });

  it('offers a logout control in the admin dashboard shell', () => {
    const adminLayout = read('src/components/admin/AdminLayout.tsx');
    expect(adminLayout).toContain('signOut');
    expect(adminLayout).toMatch(/Log out/);
  });

  it('documents a safe, non-backdoor way to grant the first admin role', () => {
    const doc = read('docs/admin-access.md');
    expect(doc).toMatch(/update public\.profiles/);
    expect(doc).toMatch(/set role = 'admin'/);
    expect(doc).toContain('No hardcoded admin email/password');
    expect(doc).toContain('No service-role key in the frontend bundle');
  });

  it('keeps the real admin dashboard and the demo admin simulation strictly separate', () => {
    const demoSim = read('src/pages/demo/DemoAdminSim.tsx');
    expect(demoSim).not.toMatch(/from ['"]@\/pages\/Admin['"]/);
    expect(demoSim).not.toMatch(/AdminRoute/);

    const demoPolicy = read('src/features/demo/demoAuthPolicy.ts');
    expect(demoPolicy).toMatch(/isRealAuthEnabled[\s\S]*if \(appConfig\.isDemo\) return false/);
  });
});

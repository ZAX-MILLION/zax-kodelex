import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  DEMO_BANNER_COPY,
  DEMO_ROLE_PREVIEW_ACTIONS,
  getDemoRoleDestination,
  resolveDemoRoleAlias,
  shouldUseDemoRolePreview,
  isRealAuthEnabled,
} from '../../src/features/demo/demoAuthPolicy';
import { appConfig } from '../../src/config/env';

describe('demo auth policy', () => {
  it('keeps real login disabled whenever demo mode is active', () => {
    if (appConfig.isDemo) {
      expect(shouldUseDemoRolePreview()).toBe(true);
      expect(isRealAuthEnabled()).toBe(false);
    }
  });

  it('never enables real auth against the built-in dev-fallback project', () => {
    // Unit tests run in Node without env credentials → auth must stay off
    expect(isRealAuthEnabled()).toBe(false);
  });

  it('maps role preview buttons to simulation routes without credentials', () => {
    const paths = DEMO_ROLE_PREVIEW_ACTIONS.map((action) => action.path);
    expect(paths).toEqual([
      '/demo/member',
      '/demo/paid-member',
      '/demo/buyer',
      '/demo/uploader',
      '/demo/admin',
    ]);
    expect(DEMO_ROLE_PREVIEW_ACTIONS.every((a) => a.label.startsWith('Preview as'))).toBe(true);
  });

  it('resolves aliases to destinations used by Role Lab deep links', () => {
    expect(resolveDemoRoleAlias('paid-member')).toBe('paid');
    expect(getDemoRoleDestination('paid')).toBe('/demo/paid-member');
    expect(getDemoRoleDestination('admin')).toBe('/demo/admin');
    expect(getDemoRoleDestination('member')).toBe('/demo/member');
  });

  it('uses the updated interactive demo banner copy', () => {
    expect(DEMO_BANNER_COPY).toContain('readable chapters');
    expect(DEMO_BANNER_COPY).toContain('administration simulations');
    expect(DEMO_BANNER_COPY).not.toContain('chapter pages are not included');
  });
});

describe('demo admin simulation isolation', () => {
  it('does not import the production Admin module', () => {
    const source = readFileSync(
      resolve(__dirname, '../../src/pages/demo/DemoAdminSim.tsx'),
      'utf8'
    );
    expect(source).toContain('Admin dashboard (simulation)');
    expect(source).not.toMatch(/from ['"]@\/pages\/Admin['"]/);
    expect(source).not.toMatch(/pages\/Admin/);
    expect(source).not.toMatch(/EnhancedAdminDashboard/);
    expect(source).not.toMatch(/AdminRoute/);
    expect(source).not.toMatch(/SecureRoute/);
  });

  it('keeps AuthModal demo branch free of real login form markers', () => {
    const source = readFileSync(
      resolve(__dirname, '../../src/components/AuthModal.tsx'),
      'utf8'
    );
    expect(source).toContain('shouldUseDemoRolePreview');
    expect(source).toContain('DemoRolePreviewModal');
    expect(source).toMatch(/showQuickTest = import\.meta\.env\.DEV && isRealAuthEnabled\(\)/);
  });

  it('scopes Try Demo modal to public demo only', () => {
    const policy = readFileSync(
      resolve(__dirname, '../../src/features/demo/demoAuthPolicy.ts'),
      'utf8'
    );
    expect(policy).toMatch(/shouldUseDemoRolePreview\(\)[\s\S]*return appConfig\.isDemo/);
  });
});

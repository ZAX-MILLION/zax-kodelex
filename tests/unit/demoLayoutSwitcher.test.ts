import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

function read(relativePath: string): string {
  return readFileSync(resolve(process.cwd(), relativePath), 'utf8');
}

describe('public demo layout switcher', () => {
  it('is labeled as a demo preview and never talks to Supabase', () => {
    const source = read('src/components/series/DemoLayoutSwitcher.tsx');
    expect(source).toMatch(/demo preview only/i);
    expect(source).not.toMatch(/integrations\/supabase|supabase\.from|supabase\.auth/i);
  });

  it('is only rendered on series pages while isDemo is true', () => {
    const source = read('src/components/series/ModernSeriesDetail.tsx');
    expect(source).toMatch(/\{\(isDemo \|\| isDemoSeriesId\(series\.id\)\) && \(\s*<DemoLayoutSwitcher/);
  });

  it('keeps light/dark and layout switching independent (no appearance writes)', () => {
    const source = read('src/components/series/DemoLayoutSwitcher.tsx');
    expect(source).not.toMatch(/setGlobalAppearanceMode|setSeriesAppearanceOverride/);
  });

  it('offers a reset-to-default control', () => {
    const source = read('src/components/series/DemoLayoutSwitcher.tsx');
    expect(source).toContain('Reset to site default');
    expect(source).toContain('onReset');
  });

  it('registers the /demo/styles comparison page with zero Supabase usage', () => {
    const app = read('src/App.tsx');
    expect(app).toContain("const DemoStylesCompare = lazy(() => import('./pages/demo/DemoStylesCompare'));");
    expect(app).toMatch(/path="\/demo\/styles"/);

    const page = read('src/pages/demo/DemoStylesCompare.tsx');
    expect(page).not.toMatch(/integrations\/supabase|supabase\.from|supabase\.auth/i);
    expect(page).toContain('Open full page');
    expect(page).toMatch(/Light|Dark/);
  });

  it('does not hide chapters or comments behind tabs on the comparison page', () => {
    const page = read('src/pages/demo/DemoStylesCompare.tsx');
    expect(page).not.toMatch(/TabsList|TabsTrigger/);
  });
});

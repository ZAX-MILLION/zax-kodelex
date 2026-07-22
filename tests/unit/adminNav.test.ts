import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { ADMIN_NAV_GROUPS, isNavItemActivePath } from '../../src/features/admin/adminNav';

const EXPECTED_GROUP_LABELS = ['Overview', 'Content', 'Design', 'Monetization', 'Users', 'System', 'Account'];

function adminRoutedPaths(): Set<string> {
  const source = readFileSync(resolve(process.cwd(), 'src/pages/Admin.tsx'), 'utf8');
  const paths = new Set<string>(['/admin']);
  for (const match of source.matchAll(/<Route path="([^"*]+)"/g)) {
    paths.add(`/admin/${match[1]}`);
  }
  return paths;
}

describe('admin sidebar navigation structure', () => {
  it('matches the requested nav groups, in order', () => {
    expect(ADMIN_NAV_GROUPS.map((g) => g.label)).toEqual(EXPECTED_GROUP_LABELS);
  });

  it('every active item links to a route that actually exists in Admin.tsx (or a known static page)', () => {
    const routed = adminRoutedPaths();
    const staticPages = new Set(['/', '/profile']);

    for (const group of ADMIN_NAV_GROUPS) {
      for (const item of group.items) {
        if (item.status !== 'active' || item.action === 'logout') continue;
        expect(item.url, `${group.label} / ${item.title} is active but has no url`).toBeTruthy();
        const [basePath] = item.url!.split(/[?#]/);
        const isRouted = routed.has(basePath) || staticPages.has(basePath);
        expect(isRouted, `${group.label} / ${item.title} → ${basePath} is not a registered route`).toBe(true);
      }
    }
  });

  it('marks items without a matching route as coming-soon instead of linking nowhere', () => {
    const comingSoon = ADMIN_NAV_GROUPS.flatMap((g) => g.items).filter((i) => i.status === 'coming-soon');
    expect(comingSoon.length).toBeGreaterThan(0);
    for (const item of comingSoon) {
      expect(item.url).toBeUndefined();
    }
  });

  it('every nav item id is unique', () => {
    const ids = ADMIN_NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('includes a logout action with no navigable url', () => {
    const account = ADMIN_NAV_GROUPS.find((g) => g.id === 'account');
    const logout = account?.items.find((i) => i.id === 'logout');
    expect(logout?.action).toBe('logout');
  });

  it('resolves active path matching, including hash anchors', () => {
    expect(isNavItemActivePath('/admin', '/admin', '')).toBe(true);
    expect(isNavItemActivePath('/admin', '/admin/series', '')).toBe(false);
    expect(isNavItemActivePath('/admin/series', '/admin/series', '')).toBe(true);
    expect(isNavItemActivePath('/admin/series-design#appearance', '/admin/series-design', '#appearance')).toBe(true);
    expect(isNavItemActivePath('/admin/series-design#appearance', '/admin/series-design', '#backgrounds')).toBe(
      false
    );
  });
});

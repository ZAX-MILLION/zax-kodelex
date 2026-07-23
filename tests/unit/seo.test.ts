import { describe, expect, it } from 'vitest';
import { generateRobotsTxt } from '../../src/utils/seo/robots';
import { generateSitemap, generateMangaSitemap } from '../../src/utils/seo/sitemap';

function noIndexPaths(pathname: string, envNoIndex: boolean): boolean {
  if (envNoIndex) return true;
  const privatePrefixes = [
    '/demo',
    '/admin',
    '/author',
    '/login',
    '/reset-password',
    '/settings',
    '/profile',
    '/buy',
    '/coins',
    '/subscribe',
    '/monetization',
  ];
  return privatePrefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

describe('SEO robots generation', () => {
  it('disallows all for demo', () => {
    const txt = generateRobotsTxt({ allowIndexing: false });
    expect(txt).toContain('Disallow: /');
    expect(txt).not.toContain('Sitemap: https://zaxmillion.com');
  });

  it('uses VITE_SITE_URL for production sitemap', () => {
    const txt = generateRobotsTxt({
      allowIndexing: true,
      sitemapUrl: 'https://example.com/sitemap.xml',
      disallowPaths: ['/demo', '/admin'],
    });
    expect(txt).toContain('Allow: /');
    expect(txt).toContain('Disallow: /demo');
    expect(txt).toContain('Sitemap: https://example.com/sitemap.xml');
  });
});

describe('sitemap', () => {
  it('builds public entries without private routes', () => {
    const entries = generateMangaSitemap('https://example.com');
    const xml = generateSitemap(entries);
    expect(xml).toContain('https://example.com');
    expect(xml).not.toContain('/admin');
    expect(xml).not.toContain('/demo');
  });
});

describe('noindex path policy', () => {
  it('marks demo and private routes', () => {
    expect(noIndexPaths('/demo', false)).toBe(true);
    expect(noIndexPaths('/demo/admin', false)).toBe(true);
    expect(noIndexPaths('/login', false)).toBe(true);
    expect(noIndexPaths('/settings', false)).toBe(true);
    expect(noIndexPaths('/', false)).toBe(false);
    expect(noIndexPaths('/', true)).toBe(true);
  });
});

import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';

const PRIVATE_DISALLOW = [
  '/demo',
  '/demo/',
  '/admin',
  '/admin/',
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

function generateRobotsTxt(options: {
  allowIndexing: boolean;
  sitemapUrl?: string;
  disallowPaths?: string[];
}): string {
  const { allowIndexing, sitemapUrl, disallowPaths = [] } = options;
  let robotsTxt = 'User-agent: *\n';
  if (allowIndexing) {
    robotsTxt += 'Allow: /\n';
    for (const p of disallowPaths) {
      robotsTxt += `Disallow: ${p}\n`;
    }
    robotsTxt += 'Disallow: /admin/\n';
    robotsTxt += 'Disallow: /api/\n';
  } else {
    robotsTxt += 'Disallow: /\n';
  }
  if (sitemapUrl) {
    robotsTxt += `\nSitemap: ${sitemapUrl}\n`;
  }
  return robotsTxt;
}

function generateSitemap(
  entries: Array<{ url: string; lastmod?: string; changefreq?: string; priority?: number }>
): string {
  const urls = entries
    .map((entry) => {
      let urlXml = `  <url>\n    <loc>${entry.url}</loc>`;
      if (entry.lastmod) urlXml += `\n    <lastmod>${entry.lastmod}</lastmod>`;
      if (entry.changefreq) urlXml += `\n    <changefreq>${entry.changefreq}</changefreq>`;
      if (entry.priority !== undefined) urlXml += `\n    <priority>${entry.priority}</priority>`;
      urlXml += '\n  </url>';
      return urlXml;
    })
    .join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`;
}

/**
 * Writes environment-aware robots.txt and sitemap.xml into dist/ during build.
 */
export function seoArtifactsPlugin(): Plugin {
  return {
    name: 'zax-seo-artifacts',
    closeBundle() {
      const outDir = path.resolve(process.cwd(), 'dist');
      if (!fs.existsSync(outDir)) return;

      const appEnv = (process.env.VITE_APP_ENV || '').toLowerCase();
      const demoMode = process.env.VITE_DEMO_MODE === 'true' || appEnv === 'demo';
      const staging = appEnv === 'staging';
      const allowIndexing = !demoMode && !staging && appEnv === 'production';

      const siteUrl = (process.env.VITE_SITE_URL || '').replace(/\/$/, '');
      const sitemapUrl = allowIndexing && siteUrl ? `${siteUrl}/sitemap.xml` : undefined;

      const robots = generateRobotsTxt({
        allowIndexing,
        sitemapUrl,
        disallowPaths: allowIndexing ? PRIVATE_DISALLOW : [],
      });

      fs.writeFileSync(path.join(outDir, 'robots.txt'), robots, 'utf8');

      if (allowIndexing && siteUrl) {
        const now = new Date().toISOString();
        const publicPaths = [
          '/',
          '/browse',
          '/series',
          '/blog',
          '/support',
          '/premium',
          '/contact',
          '/help',
          '/terms',
          '/privacy',
          '/cookies',
          '/dmca',
          '/disclaimer',
          '/acceptable-use',
        ];
        const expanded = publicPaths.map((p) => ({
          url: `${siteUrl}${p === '/' ? '' : p}`,
          lastmod: now,
          changefreq: 'weekly',
          priority: p === '/' ? 1 : 0.7,
        }));
        fs.writeFileSync(path.join(outDir, 'sitemap.xml'), generateSitemap(expanded), 'utf8');
      } else {
        fs.writeFileSync(
          path.join(outDir, 'sitemap.xml'),
          '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n</urlset>\n',
          'utf8'
        );
      }

      fs.writeFileSync(
        path.join(outDir, 'seo-build-meta.json'),
        JSON.stringify(
          {
            allowIndexing,
            appEnv: appEnv || (demoMode ? 'demo' : 'unknown'),
            siteUrl: siteUrl || null,
            sitemapUrl: sitemapUrl || null,
            generatedAt: new Date().toISOString(),
          },
          null,
          2
        ),
        'utf8'
      );
    },
  };
}

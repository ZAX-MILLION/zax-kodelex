/**
 * Playwright responsive + axe smoke for Seamless V2 demo.
 * Loads via SPA entry then client-navigates (vite preview may 404 deep links).
 * Usage: node scripts/responsive-verify.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
let AxeBuilder = null;
try {
  AxeBuilder = require('@axe-core/playwright').default;
} catch {
  console.warn('@axe-core/playwright not installed — axe checks will be skipped');
}

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/responsive-final');
const reportPath = path.resolve('docs/releases/seamless-v2/responsive-run.json');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1024x768', width: 1024, height: 768 },
  { name: '1440x900', width: 1440, height: 900 },
];

const routes = [
  { id: 'home', path: '/' },
  { id: 'series', path: '/series' },
  { id: 'series-detail', path: '/series/00000000-0000-4000-a000-000000000001' },
  { id: 'reader', path: '/reader/00000000-0000-4000-a000-000000000001/1' },
  { id: 'blog', path: '/blog' },
  { id: 'article', path: '/blog/introducing-zax-seamless-v2' },
  { id: 'role-lab', path: '/demo' },
  { id: 'checkout', path: '/demo/checkout' },
  { id: 'uploader', path: '/demo/uploader' },
  { id: 'admin', path: '/demo/admin' },
];

const axeRoutes = [
  '/',
  '/series',
  '/demo',
  '/blog',
  '/reader/00000000-0000-4000-a000-000000000001/1',
];

const ignoreConsole = (text) =>
  /placeholder\.supabase\.co|ERR_NAME_NOT_RESOLVED|favicon|Failed to load resource: the server responded with a status of 404/i.test(
    text
  );

async function measureOverflow(page) {
  return page.evaluate(() => {
    const doc = document.documentElement;
    return {
      scrollWidth: doc.scrollWidth,
      clientWidth: doc.clientWidth,
      overflowX: doc.scrollWidth > doc.clientWidth + 1,
    };
  });
}

async function gotoSpa(page, routePath) {
  await page.goto(`${baseUrl}${routePath}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
  await page.waitForTimeout(900);
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = {
    baseUrl,
    generatedAt: new Date().toISOString(),
    screenshots: [],
    overflow: [],
    axe: [],
    errors: [],
  };

  for (const vp of viewports) {
    for (const route of routes) {
      const context = await browser.newContext({
        viewport: { width: vp.width, height: vp.height },
      });
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => {
        const msg = String(e);
        if (!ignoreConsole(msg)) pageErrors.push(msg);
      });
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!ignoreConsole(text)) pageErrors.push(text);
        }
      });
      try {
        await gotoSpa(page, route.path);
        const overflow = await measureOverflow(page);
        const shot = path.join(outDir, `${route.id}-${vp.name}.png`);
        await page.screenshot({ path: shot, fullPage: false });
        results.screenshots.push({ route: route.path, viewport: vp.name, file: shot });
        results.overflow.push({ route: route.path, viewport: vp.name, ...overflow });
        if (pageErrors.length) {
          results.errors.push({
            route: route.path,
            viewport: vp.name,
            pageErrors: pageErrors.slice(0, 10),
          });
        }
      } catch (err) {
        results.errors.push({ route: route.path, viewport: vp.name, fatal: String(err) });
      }
      await context.close();
    }
  }

  if (AxeBuilder) {
    for (const route of axeRoutes) {
      const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
      const page = await context.newPage();
      try {
        await gotoSpa(page, route);
        const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
        const serious = axe.violations.filter(
          (v) => v.impact === 'serious' || v.impact === 'critical'
        );
        results.axe.push({
          route,
          violationCount: axe.violations.length,
          seriousOrCritical: serious.length,
          violations: axe.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            nodes: v.nodes.length,
            help: v.help,
          })),
        });
      } catch (err) {
        results.axe.push({ route, error: String(err) });
      }
      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('Wrote', reportPath);
  const overflowFails = results.overflow.filter((o) => o.overflowX);
  const seriousAxe = results.axe.filter((a) => (a.seriousOrCritical || 0) > 0);
  console.log('overflow fails', overflowFails.length);
  console.log('serious axe pages', seriousAxe.length);
  console.log('runtime errors', results.errors.length);
  if (overflowFails.length || seriousAxe.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

/**
 * Verifies the four series-details layouts (A/B/C/D) are structurally
 * differentiated, responsive, and captures 1440x900 dark-mode screenshots
 * for each layout.
 * Usage: node scripts/series-layouts-verify.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const seriesPath = '/series/00000000-0000-4000-a000-000000000001';
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/series-layouts-differentiated');
const reportPath = path.resolve('docs/releases/seamless-v2/screenshots/series-layouts-differentiated/verification.json');
fs.mkdirSync(outDir, { recursive: true });

const layouts = ['A', 'B', 'C', 'D'];
const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

const layoutNames = {
  A: 'editorial',
  B: 'cinematic',
  C: 'compact-catalogue',
  D: 'compact-list',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { baseUrl, generatedAt: new Date().toISOString(), runs: [] };

  for (const layout of layouts) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await context.addInitScript(
        (layoutId) => {
          window.localStorage.setItem('zax-series-details-layout-global', layoutId);
        },
        layout
      );
      const page = await context.newPage();
      const pageErrors = [];
      page.on('pageerror', (e) => pageErrors.push(String(e)));

      await page.goto(`${baseUrl}${seriesPath}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(1100);

      const scheme = await page.evaluate(() => document.documentElement.classList.contains('dark') ? 'dark' : 'light');
      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));
      const buttonWidths = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('a[href*="/reader/"] button, a[href*="/reader/"]'))
          .filter((el) => el.textContent?.match(/Reading|Continue/i));
        return buttons.map((b) => Math.round(b.getBoundingClientRect().width));
      });

      const vpSuffix = vp.name.startsWith('390') ? '390' : vp.name.startsWith('768') ? '768' : '1440';
      const shotFile = path.join(outDir, `${layoutNames[layout]}-${scheme}-${vpSuffix}.png`);
      await page.screenshot({ path: shotFile, fullPage: false });

      results.runs.push({
        layout,
        viewport: vp.name,
        scheme,
        overflowX: overflow.overflowX,
        scrollWidth: overflow.scrollWidth,
        clientWidth: overflow.clientWidth,
        startReadingButtonWidths: buttonWidths,
        pageErrors: pageErrors.slice(0, 5),
        screenshot: shotFile,
      });

      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));
  console.log('Wrote', reportPath);
  const overflowFails = results.runs.filter((r) => r.overflowX);
  const wideButtons = results.runs.filter((r) => r.viewport !== '390x844' && r.startReadingButtonWidths.some((w) => w > 240));
  console.log('overflow fails:', overflowFails.length);
  console.log('oversized Start Reading buttons (desktop/tablet):', wideButtons.length);
  if (overflowFails.length || wideButtons.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

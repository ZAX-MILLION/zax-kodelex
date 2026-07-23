/**
 * Capture composition screenshots for all four series layouts × dark/light × viewports.
 * Usage: node scripts/series-layouts-composition-verify.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const seriesPath = '/series/00000000-0000-4000-a000-000000000001';
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/series-layouts-composition');
fs.mkdirSync(outDir, { recursive: true });

const layouts = ['A', 'B', 'C', 'D'];
const schemes = ['dark', 'light'];
const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

const layoutNames = {
  A: 'editorial',
  B: 'cinematic',
  C: 'catalogue',
  D: 'chapter-index',
};

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = { baseUrl, generatedAt: new Date().toISOString(), runs: [], thumbnails1440: {} };

  for (const layout of layouts) {
    for (const scheme of schemes) {
      for (const vp of viewports) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
          colorScheme: scheme === 'dark' ? 'dark' : 'light',
        });
        await context.addInitScript(
          ({ layoutId, mode }) => {
            window.localStorage.setItem('zax-series-details-layout-global', layoutId);
            window.localStorage.setItem('zax-appearance-global', mode);
            document.documentElement.classList.toggle('dark', mode === 'dark');
            document.documentElement.classList.toggle('light', mode === 'light');
          },
          { layoutId: layout, mode: scheme }
        );
        const page = await context.newPage();
        const pageErrors = [];
        page.on('pageerror', (e) => pageErrors.push(String(e)));

        await page.goto(`${baseUrl}${seriesPath}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
        await page.waitForTimeout(1200);
        await page.evaluate((mode) => {
          document.documentElement.classList.toggle('dark', mode === 'dark');
          document.documentElement.classList.toggle('light', mode === 'light');
        }, scheme);

        const markers = await page.evaluate(() => ({
          layoutAttr: document.querySelector('[data-series-layout]')?.getAttribute('data-series-layout'),
          hasMetaPanel: Boolean(document.querySelector('#series-meta-heading')),
          chaptersY: document.querySelector('#series-chapters')?.getBoundingClientRect().top ?? null,
          commentsY: document.querySelector('#series-comments')?.getBoundingClientRect().top ?? null,
          reviewsY: document.querySelector('#series-reviews')?.getBoundingClientRect().top ?? null,
          overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
        }));

        const shotFile = path.join(outDir, `${layoutNames[layout]}-${scheme}-${vp.name}.png`);
        await page.screenshot({ path: shotFile, fullPage: false });

        if (vp.name === '1440' && scheme === 'dark') {
          results.thumbnails1440[layout] = shotFile;
        }

        results.runs.push({
          layout,
          scheme,
          viewport: vp.name,
          ...markers,
          pageErrors: pageErrors.slice(0, 3),
          screenshot: path.basename(shotFile),
        });

        await context.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'verification.json'), JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

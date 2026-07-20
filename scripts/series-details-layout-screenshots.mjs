/**
 * Capture series details layout screenshots at 390 / 768 / 1440.
 * Usage: node scripts/series-details-layout-screenshots.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const seriesId = '00000000-0000-4000-a000-000000000001';
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/series-details-layouts');
fs.mkdirSync(outDir, { recursive: true });

const layouts = [
  { id: 'A', label: 'editorial' },
  { id: 'B', label: 'cinematic' },
  { id: 'C', label: 'compact' },
];

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { baseUrl, generatedAt: new Date().toISOString(), shots: [], overflow: [] };

  for (const layout of layouts) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      const page = await context.newPage();

      await page.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.evaluate((layoutId) => {
        localStorage.setItem('zax-series-details-layout-global', layoutId);
      }, layout.id);
      await page.goto(`${baseUrl}/series/${seriesId}`, {
        waitUntil: 'networkidle',
        timeout: 90000,
      });
      await page.waitForTimeout(1200);

      const overflow = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
        overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      }));

      const filename = `layout-${layout.label}-${vp.name}.png`;
      const filepath = path.join(outDir, filename);
      await page.screenshot({ path: filepath, fullPage: true });

      report.shots.push({ layout: layout.id, viewport: vp.name, file: filename });
      report.overflow.push({ layout: layout.id, viewport: vp.name, ...overflow });
      await context.close();
    }
  }

  fs.writeFileSync(path.join(outDir, 'verification.json'), JSON.stringify(report, null, 2));
  console.log(`Saved ${report.shots.length} screenshots to ${outDir}`);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

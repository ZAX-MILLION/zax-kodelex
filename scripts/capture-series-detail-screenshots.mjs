/**
 * Capture series details page screenshots for Seamless V2 release docs.
 * Usage: node scripts/capture-series-detail-screenshots.mjs [baseUrl]
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/series-details');
const seriesPath = '/series/00000000-0000-4000-a000-000000000001';

const viewports = [
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

fs.mkdirSync(outDir, { recursive: true });

async function main() {
  const browser = await chromium.launch({ headless: true });
  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    const page = await context.newPage();
    await page.goto(`${baseUrl}${seriesPath}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
    await page.waitForTimeout(1200);
    await page.screenshot({
      path: path.join(outDir, `series-detail-${vp.name}.png`),
      fullPage: false,
    });
    await context.close();
    console.log(`Saved series-detail-${vp.name}.png`);
  }
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

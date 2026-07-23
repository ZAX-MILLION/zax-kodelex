/**
 * Captures the 4 series-details layouts (A/B/C/D) x Light/Dark x 3 breakpoints.
 * Usage: node scripts/screenshot-series-details-four-themes.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/series-details-four-themes');
fs.mkdirSync(outDir, { recursive: true });

const SERIES_ID = '00000000-0000-4000-a000-000000000001';

const layouts = ['A', 'B', 'C', 'D'];
const modes = ['light', 'dark'];
const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const manifest = { baseUrl, generatedAt: new Date().toISOString(), shots: [] };

  for (const layout of layouts) {
    for (const mode of modes) {
      for (const vp of viewports) {
        const context = await browser.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();
        await page.addInitScript(
          ({ seriesId, layoutId, appearanceMode }) => {
            window.localStorage.setItem(
              'zax-series-details-layout-overrides',
              JSON.stringify({ [seriesId]: layoutId })
            );
            window.localStorage.setItem('zax-appearance-global', appearanceMode);
          },
          { seriesId: SERIES_ID, layoutId: layout, appearanceMode: mode }
        );
        try {
          await page.goto(`${baseUrl}/series/${SERIES_ID}`, {
            waitUntil: 'domcontentloaded',
            timeout: 90000,
          });
          await page.waitForTimeout(1100);
          const file = path.join(outDir, `layout-${layout}-${mode}-${vp.name}.png`);
          await page.screenshot({ path: file, fullPage: true });
          manifest.shots.push({ layout, mode, viewport: vp.name, file });
          console.log('captured', file);
        } catch (err) {
          manifest.shots.push({ layout, mode, viewport: vp.name, error: String(err) });
          console.error('failed', layout, mode, vp.name, err);
        }
        await context.close();
      }
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('Wrote', path.join(outDir, 'manifest.json'));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

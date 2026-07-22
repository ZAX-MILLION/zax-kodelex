/**
 * Axe accessibility pass for the new Light appearance across all 4 series-details layouts.
 * Usage: node scripts/axe-series-details-light.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';

const require = createRequire(import.meta.url);
const AxeBuilder = require('@axe-core/playwright').default;

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const SERIES_ID = '00000000-0000-4000-a000-000000000001';
const layouts = ['A', 'B', 'C', 'D'];
const outPath = path.resolve('docs/releases/seamless-v2/axe-series-details-light.json');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const results = [];

  for (const layout of layouts) {
    const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
    const page = await context.newPage();
    await page.addInitScript(
      ({ seriesId, layoutId }) => {
        window.localStorage.setItem(
          'zax-series-details-layout-overrides',
          JSON.stringify({ [seriesId]: layoutId })
        );
        window.localStorage.setItem('zax-appearance-global', 'light');
      },
      { seriesId: SERIES_ID, layoutId: layout }
    );
    try {
      await page.goto(`${baseUrl}/series/${SERIES_ID}`, { waitUntil: 'domcontentloaded', timeout: 90000 });
      await page.waitForTimeout(1000);
      const axe = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
      const serious = axe.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
      results.push({
        layout,
        violationCount: axe.violations.length,
        seriousOrCritical: serious.length,
        violations: axe.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, help: v.help })),
      });
      console.log(`layout ${layout}: ${axe.violations.length} violations (${serious.length} serious/critical)`);
    } catch (err) {
      results.push({ layout, error: String(err) });
      console.error('failed', layout, err);
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(outPath, JSON.stringify({ baseUrl, generatedAt: new Date().toISOString(), results }, null, 2));
  console.log('Wrote', outPath);
  const seriousAny = results.some((r) => (r.seriousOrCritical || 0) > 0);
  if (seriousAny) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

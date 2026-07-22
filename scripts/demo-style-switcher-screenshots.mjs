/**
 * Screenshots for the public demo "Try another layout" switcher and the
 * /demo/styles comparison page. Pure demo build — zero Supabase.
 * Usage: node scripts/demo-style-switcher-screenshots.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/admin-dashboard-redesign');
fs.mkdirSync(outDir, { recursive: true });

const SAMPLE_SERIES_ID = '00000000-0000-4000-a000-000000000001';

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

async function setAppearance(context, scheme) {
  await context.addInitScript((mode) => {
    window.localStorage.setItem('zax-appearance-global', mode);
  }, scheme);
}

async function shoot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { captured: [], errors: [] };

  for (const scheme of ['dark', 'light']) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await setAppearance(context, scheme);
      const page = await context.newPage();
      try {
        await page.goto(`${baseUrl}/series/${SAMPLE_SERIES_ID}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1200);

        const switcherBtn = page.locator('button[aria-label*="Try another layout"]').first();
        await switcherBtn.click({ timeout: 10000 });
        await page.waitForTimeout(400);
        const name = `demo-layout-switcher-${scheme}-${vp.name}`;
        await shoot(page, name);
        report.captured.push(name);
      } catch (err) {
        report.errors.push({ page: 'series-detail-switcher', scheme, viewport: vp.name, fatal: String(err) });
      }
      await context.close();
    }
  }

  for (const scheme of ['dark', 'light']) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await setAppearance(context, scheme);
      const page = await context.newPage();
      try {
        await page.goto(`${baseUrl}/demo/styles`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1000);
        const name = `demo-styles-compare-${scheme}-${vp.name}`;
        await shoot(page, name);
        report.captured.push(name);
      } catch (err) {
        report.errors.push({ page: 'demo-styles', scheme, viewport: vp.name, fatal: String(err) });
      }
      await context.close();
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'demo-style-switcher-verification.json'), JSON.stringify(report, null, 2));
  console.log('Captured', report.captured.length, 'screenshots');
  console.log('Errors', report.errors.length);
  if (report.errors.length) console.log(JSON.stringify(report.errors, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

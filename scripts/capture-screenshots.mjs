import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const outDir = path.resolve('docs/releases/seamless-v2/screenshots');
fs.mkdirSync(outDir, { recursive: true });

const viewports = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: '1440x900', width: 1440, height: 900 },
];

async function shoot(label, url) {
  const browser = await chromium.launch({ headless: true });
  for (const vp of viewports) {
    const page = await browser.newPage({ viewport: { width: vp.width, height: vp.height } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(String(e)));
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    await page.goto(url, { waitUntil: 'networkidle', timeout: 90000 });
    await page.waitForTimeout(1500);
    const file = path.join(outDir, `${label}-${vp.name}.png`);
    await page.screenshot({ path: file, fullPage: false });
    fs.writeFileSync(
      path.join(outDir, `${label}-${vp.name}.json`),
      JSON.stringify({ url, viewport: vp, errors: errors.slice(0, 20) }, null, 2)
    );
    console.log('saved', file, 'errors', errors.length);
    await page.close();
  }
  await browser.close();
}

const mode = process.argv[2] || 'after';
const url = process.argv[3];
if (!url) {
  console.error('Usage: node scripts/capture-screenshots.mjs <before|after> <url>');
  process.exit(1);
}
await shoot(mode, url);

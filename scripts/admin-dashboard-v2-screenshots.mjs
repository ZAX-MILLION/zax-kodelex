/**
 * Screenshots for the admin dashboard v2 IA (home, series-design, appearance, backgrounds).
 *
 * Demo admin routes run without auth mocking. Real /admin uses mocked Supabase
 * (same approach as admin-dashboard-screenshots.mjs).
 *
 * Usage: node scripts/admin-dashboard-v2-screenshots.mjs http://127.0.0.1:4173
 */
import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const baseUrl = (process.argv[2] || 'http://127.0.0.1:4173').replace(/\/$/, '');
const outDir = path.resolve('docs/releases/seamless-v2/screenshots/admin-dashboard-v2');
fs.mkdirSync(outDir, { recursive: true });

const FAKE_URL = 'https://mockproj.supabase.co';
const FAKE_ANON_KEY = 'mock-anon-key';
const USER_ID = '11111111-1111-4111-8111-111111111111';
const USER_EMAIL = 'admin@zaxmillion.test';

function base64url(obj) {
  return Buffer.from(JSON.stringify(obj)).toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function buildFakeSession() {
  const nowSec = Math.floor(Date.now() / 1000);
  const header = { alg: 'HS256', typ: 'JWT' };
  const payload = { sub: USER_ID, email: USER_EMAIL, role: 'authenticated', aud: 'authenticated', exp: nowSec + 3600 };
  const accessToken = `${base64url(header)}.${base64url(payload)}.mock-signature`;
  const user = {
    id: USER_ID,
    aud: 'authenticated',
    role: 'authenticated',
    email: USER_EMAIL,
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    app_metadata: { provider: 'email', providers: ['email'] },
    user_metadata: {},
    identities: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  return {
    access_token: accessToken,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: nowSec + 3600,
    refresh_token: 'mock-refresh-token',
    user,
  };
}

const PROFILE_ROW = {
  id: '22222222-2222-4222-8222-222222222222',
  user_id: USER_ID,
  email: USER_EMAIL,
  username: 'zax-admin',
  role: 'admin',
  is_banned: false,
  activity_score: 42,
  login_count: 17,
  last_login_at: new Date().toISOString(),
  chapter_layout_preference: 1,
  created_at: new Date('2025-01-01').toISOString(),
  updated_at: new Date().toISOString(),
};

const ADMIN_ACTIONS = [
  {
    id: 'a1',
    description: 'Changed user role to Administrator',
    action_type: 'role_change',
    created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
  },
];

async function installMocks(context) {
  const session = buildFakeSession();

  await context.addInitScript(
    ({ url, anon }) => {
      window.localStorage.setItem('supabase_url', url);
      window.localStorage.setItem('supabase_anon', anon);
    },
    { url: FAKE_URL, anon: FAKE_ANON_KEY }
  );

  await context.route('**/auth/v1/**', async (route) => {
    const req = route.request();
    if (req.url().includes('/logout')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(session) });
  });

  await context.route('**/rest/v1/**', async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const table = url.pathname.split('/').pop();
    const isHead = req.method() === 'HEAD';

    if (table === 'profiles' && !isHead) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([PROFILE_ROW]) });
      return;
    }
    if (table === 'admin_actions') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(ADMIN_ACTIONS) });
      return;
    }
    if (isHead) {
      const totals = { manga_meta: 184, chapters: 2137, comments: 958, profiles: 3021 };
      const total = totals[table] ?? 0;
      await route.fulfill({
        status: 200,
        headers: {
          'content-range': `0-0/${total}`,
          'access-control-expose-headers': 'content-range',
        },
        body: '',
      });
      return;
    }
    if (table === 'manga_meta') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          { id: '00000000-0000-4000-a000-000000000001', title: 'Neon Drift' },
          { id: '00000000-0000-4000-a000-000000000002', title: 'Sakura Line' },
        ]),
      });
      return;
    }
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await context.route('**/functions/v1/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });
}

async function setAppearance(context, scheme) {
  await context.addInitScript((mode) => {
    window.localStorage.setItem('zax-appearance-global', mode);
  }, scheme);
}

async function signIn(page) {
  await page.goto(`${baseUrl}/admin/login`, { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(600);
  await page.fill('#admin-email', USER_EMAIL);
  await page.fill('#admin-password', 'mock-password-for-screenshots');
  await page.click('button:has-text("Sign in")');
  await page.waitForURL('**/admin', { timeout: 15000 }).catch(() => {});
  await page.waitForTimeout(1000);
}

const viewports = [
  { name: '390', width: 390, height: 844 },
  { name: '768', width: 768, height: 1024 },
  { name: '1440', width: 1440, height: 900 },
];

async function shoot(page, name) {
  await page.screenshot({ path: path.join(outDir, `${name}.png`), fullPage: false });
}

const REAL_ADMIN_PAGES = [
  { slug: 'dashboard-home', path: '/admin' },
  { slug: 'series-design', path: '/admin/series-design' },
  { slug: 'appearance', path: '/admin/appearance' },
  { slug: 'backgrounds', path: '/admin/backgrounds' },
];

const DEMO_ADMIN_PAGES = [
  { slug: 'demo-admin-home', path: '/demo/admin' },
  { slug: 'demo-series-design', path: '/demo/admin/series-design' },
  { slug: 'demo-appearance', path: '/demo/admin/appearance' },
  { slug: 'demo-backgrounds', path: '/demo/admin/backgrounds' },
];

async function main() {
  const browser = await chromium.launch({ headless: true });
  const report = { baseUrl, generatedAt: new Date().toISOString(), captured: [], errors: [] };

  for (const scheme of ['dark']) {
    for (const vp of viewports) {
      const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
      await installMocks(context);
      await setAppearance(context, scheme);
      const page = await context.newPage();

      try {
        await signIn(page);
        for (const { slug, path: adminPath } of REAL_ADMIN_PAGES) {
          await page.goto(`${baseUrl}${adminPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
          await page.waitForTimeout(1100);
          const name = `${slug}-${scheme}-${vp.name}`;
          await shoot(page, name);
          report.captured.push(name);
        }
      } catch (err) {
        report.errors.push({ area: 'real-admin', scheme, viewport: vp.name, fatal: String(err) });
      }
      await context.close();
    }
  }

  for (const vp of viewports) {
    const context = await browser.newContext({ viewport: { width: vp.width, height: vp.height } });
    await setAppearance(context, 'dark');
    const page = await context.newPage();

    try {
      for (const { slug, path: demoPath } of DEMO_ADMIN_PAGES) {
        await page.goto(`${baseUrl}${demoPath}`, { waitUntil: 'domcontentloaded', timeout: 60000 });
        await page.waitForTimeout(1100);
        const name = `${slug}-dark-${vp.name}`;
        await shoot(page, name);
        report.captured.push(name);
      }
    } catch (err) {
      report.errors.push({ area: 'demo-admin', viewport: vp.name, fatal: String(err) });
    }
    await context.close();
  }

  await browser.close();
  fs.writeFileSync(path.join(outDir, 'verification.json'), JSON.stringify(report, null, 2));
  console.log('Captured', report.captured.length, 'screenshots to', outDir);
  console.log('Errors', report.errors.length);
  if (report.errors.length) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

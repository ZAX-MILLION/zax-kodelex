import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

const dist = 'dist';
const assets = path.join(dist, 'assets');
const files = fs.readdirSync(assets);
const rows = [];
let total = 0;
for (const f of files) {
  const b = fs.readFileSync(path.join(assets, f));
  total += b.length;
  rows.push({ f, raw: b.length, gz: zlib.gzipSync(b).length });
}
rows.sort((a, b) => b.raw - a.raw);

function find(pred) {
  return rows.find((r) => pred(r.f));
}

const main = find((f) => f.startsWith('index-') && f.endsWith('.js'));
const admin = find((f) => f.startsWith('Admin-') && f.endsWith('.js'));
const ui = find((f) => f.startsWith('ui-') && f.endsWith('.js'));
const css = find((f) => f.endsWith('.css'));
const vendor = find((f) => f.startsWith('vendor-') && f.endsWith('.js'));

function walk(dir) {
  let s = 0;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) s += walk(p);
    else s += fs.statSync(p).size;
  }
  return s;
}

const out = {
  measuredAt: new Date().toISOString(),
  distTotalBytes: walk(dist),
  assetsTotalBytes: total,
  chunkCount: rows.length,
  mainBundle: main || null,
  adminBundle: admin || null,
  uiBundle: ui || null,
  vendorBundle: vendor || null,
  cssBundle: css || null,
  topChunks: rows.slice(0, 20),
  robots: fs.existsSync(path.join(dist, 'robots.txt'))
    ? fs.readFileSync(path.join(dist, 'robots.txt'), 'utf8')
    : null,
  seoMeta: fs.existsSync(path.join(dist, 'seo-build-meta.json'))
    ? JSON.parse(fs.readFileSync(path.join(dist, 'seo-build-meta.json'), 'utf8'))
    : null,
  adminInAssetList: Boolean(admin),
  demoAdminSimChunk: find((f) => f.includes('DemoAdminSim')) || null,
};

fs.mkdirSync('docs/releases/seamless-v2', { recursive: true });
fs.writeFileSync(
  process.argv[2] || 'docs/releases/seamless-v2/bundle-metrics-demo.json',
  JSON.stringify(out, null, 2)
);
console.log(JSON.stringify(out, null, 2));

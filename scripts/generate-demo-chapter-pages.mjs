/**
 * Generates original, copyright-safe comic-style SVG pages for the public demo.
 * Run: node scripts/generate-demo-chapter-pages.mjs
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const outRoot = path.join(root, 'public', 'demo', 'chapters');

const FEATURED = [
  {
    slug: 'crimson-blade-chronicles',
    title: 'Crimson Blade Chronicles',
    accent: '#e11d48',
    secondary: '#7f1d1d',
  },
  {
    slug: 'dragon-throne-wars',
    title: 'Dragon Throne Wars',
    accent: '#f59e0b',
    secondary: '#92400e',
  },
  {
    slug: 'mystic-academy',
    title: 'Mystic Academy',
    accent: '#8b5cf6',
    secondary: '#4c1d95',
  },
  {
    slug: 'shadow-ninja-academy',
    title: 'Shadow Ninja Academy',
    accent: '#64748b',
    secondary: '#0f172a',
  },
  {
    slug: 'mecha-guardian-force',
    title: 'Mecha Guardian Force',
    accent: '#0ea5e9',
    secondary: '#0c4a6e',
  },
];

const SHARED = {
  slug: '_shared-sample',
  title: 'Demo Sample Chapter',
  accent: '#f97316',
  secondary: '#9a3412',
};

const W = 800;
const H = 1200;

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function pageShell({ accent, secondary, children, label }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(label)}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#0b0f19"/>
      <stop offset="55%" stop-color="#121826"/>
      <stop offset="100%" stop-color="${secondary}"/>
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a2236"/>
      <stop offset="100%" stop-color="#0f1524"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect x="28" y="28" width="${W - 56}" height="${H - 56}" rx="18" fill="none" stroke="${accent}" stroke-opacity="0.35" stroke-width="2"/>
  ${children}
</svg>
`;
}

function titlePage(series, chapterNum, chapterTitle) {
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} chapter ${chapterNum} title page`,
    children: `
  <rect x="80" y="220" width="640" height="520" rx="16" fill="url(#panel)" stroke="${series.accent}" stroke-width="2"/>
  <text x="400" y="340" text-anchor="middle" fill="${series.accent}" font-family="Georgia, serif" font-size="28" letter-spacing="4">ZAX DEMO</text>
  <text x="400" y="420" text-anchor="middle" fill="#f8fafc" font-family="Georgia, serif" font-size="42" font-weight="700">${esc(series.title)}</text>
  <text x="400" y="490" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="26">Chapter ${chapterNum}</text>
  <text x="400" y="540" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="20">${esc(chapterTitle)}</text>
  <text x="400" y="650" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="16">Original demo artwork · not affiliated with any published comic</text>
`,
  });
}

function dialoguePage(series, pageNum, lines) {
  const bubbles = lines
    .map((line, i) => {
      const y = 220 + i * 160;
      return `
  <rect x="90" y="${y}" width="620" height="120" rx="60" fill="#f8fafc"/>
  <text x="400" y="${y + 70}" text-anchor="middle" fill="#0f172a" font-family="system-ui, sans-serif" font-size="22">${esc(line)}</text>`;
    })
    .join('');
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} dialogue page ${pageNum}`,
    children: `
  <rect x="70" y="140" width="660" height="900" rx="12" fill="url(#panel)" stroke="#334155" stroke-width="2"/>
  <text x="100" y="185" fill="${series.accent}" font-family="system-ui, sans-serif" font-size="16" letter-spacing="2">DIALOGUE</text>
  ${bubbles}
`,
  });
}

function actionPage(series, pageNum) {
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} action page ${pageNum}`,
    children: `
  <polygon points="70,180 730,140 730,520 70,560" fill="url(#panel)" stroke="${series.accent}" stroke-width="3"/>
  <polygon points="90,600 710,580 680,1040 120,1060" fill="#111827" stroke="#475569" stroke-width="2"/>
  <path d="M140 340 L360 260 L520 380 L300 460 Z" fill="${series.accent}" fill-opacity="0.85"/>
  <path d="M420 720 L640 680 L600 900 L380 920 Z" fill="${series.accent}" fill-opacity="0.45"/>
  <text x="400" y="320" text-anchor="middle" fill="#fff" font-family="Impact, system-ui, sans-serif" font-size="54" letter-spacing="3">CLASH</text>
  <text x="400" y="820" text-anchor="middle" fill="#e2e8f0" font-family="system-ui, sans-serif" font-size="24">Action panel · motion study</text>
`,
  });
}

function transitionPage(series, pageNum) {
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} transition page ${pageNum}`,
    children: `
  <rect x="80" y="180" width="300" height="380" rx="10" fill="url(#panel)" stroke="#334155"/>
  <rect x="420" y="240" width="300" height="380" rx="10" fill="url(#panel)" stroke="#334155"/>
  <rect x="180" y="680" width="440" height="280" rx="10" fill="url(#panel)" stroke="${series.accent}"/>
  <text x="400" y="830" text-anchor="middle" fill="#cbd5e1" font-family="system-ui, sans-serif" font-size="22">Scene transition</text>
  <text x="400" y="870" text-anchor="middle" fill="#64748b" font-family="system-ui, sans-serif" font-size="16">Page ${pageNum}</text>
`,
  });
}

function panelGridPage(series, pageNum) {
  const panels = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 2; c++) {
      const x = 80 + c * 330;
      const y = 160 + r * 320;
      panels.push(
        `<rect x="${x}" y="${y}" width="300" height="280" rx="8" fill="url(#panel)" stroke="#475569" stroke-width="2"/>
         <circle cx="${x + 150}" cy="${y + 120}" r="36" fill="${series.accent}" fill-opacity="0.5"/>
         <text x="${x + 150}" y="${y + 210}" text-anchor="middle" fill="#94a3b8" font-size="16" font-family="system-ui, sans-serif">Panel ${r * 2 + c + 1}</text>`
      );
    }
  }
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} panel layout page ${pageNum}`,
    children: panels.join('\n'),
  });
}

function endPage(series, chapterNum) {
  return pageShell({
    accent: series.accent,
    secondary: series.secondary,
    label: `${series.title} chapter ${chapterNum} end page`,
    children: `
  <rect x="100" y="360" width="600" height="360" rx="20" fill="url(#panel)" stroke="${series.accent}" stroke-width="2"/>
  <text x="400" y="480" text-anchor="middle" fill="#f8fafc" font-family="Georgia, serif" font-size="40" font-weight="700">End of Chapter ${chapterNum}</text>
  <text x="400" y="540" text-anchor="middle" fill="#94a3b8" font-family="system-ui, sans-serif" font-size="20">${esc(series.title)}</text>
  <text x="400" y="600" text-anchor="middle" fill="${series.accent}" font-family="system-ui, sans-serif" font-size="18">Continue to the next chapter when ready</text>
`,
  });
}

function chapterTitle(ch) {
  const titles = ['The Awakening', 'Rising Stakes', 'Hidden Paths'];
  return titles[ch - 1] || `Chapter ${ch}`;
}

function buildChapterPages(series, chapterNum, pageCount) {
  const pages = [];
  pages.push(titlePage(series, chapterNum, chapterTitle(chapterNum)));
  for (let i = 2; i < pageCount; i++) {
    const kind = i % 4;
    if (kind === 0) {
      pages.push(
        dialoguePage(series, i, [
          'We hold the line here.',
          'Then we move at dawn.',
        ])
      );
    } else if (kind === 1) {
      pages.push(actionPage(series, i));
    } else if (kind === 2) {
      pages.push(transitionPage(series, i));
    } else {
      pages.push(panelGridPage(series, i));
    }
  }
  pages.push(endPage(series, chapterNum));
  return pages;
}

function writeChapter(series, chapterNum, pageCount) {
  const dir = path.join(outRoot, series.slug, `chapter-${String(chapterNum).padStart(2, '0')}`);
  fs.mkdirSync(dir, { recursive: true });
  const pages = buildChapterPages(series, chapterNum, pageCount);
  pages.forEach((svg, idx) => {
    const name = `page-${String(idx + 1).padStart(2, '0')}.svg`;
    fs.writeFileSync(path.join(dir, name), svg, 'utf8');
  });
  return pages.length;
}

function main() {
  fs.mkdirSync(outRoot, { recursive: true });
  let total = 0;
  for (const series of FEATURED) {
    for (let ch = 1; ch <= 3; ch++) {
      const count = 8 + ((ch + series.slug.length) % 5); // 8–12
      total += writeChapter(series, ch, count);
    }
  }
  // Shared sample for non-featured series (one readable chapter)
  total += writeChapter(SHARED, 1, 8);
  console.log(`Generated ${total} demo chapter pages under public/demo/chapters/`);
}

main();

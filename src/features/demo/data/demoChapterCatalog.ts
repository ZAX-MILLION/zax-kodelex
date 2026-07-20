/**
 * Readable demo chapter catalogue — client-only, never written to Supabase.
 */

export type DemoAccessType = 'free' | 'coins' | 'premium';

export interface DemoReadableSeriesMeta {
  seriesIndex: number;
  slug: string;
  title: string;
  featured: boolean;
  readableChapterCount: number;
}

/** First five catalogue titles = homepage featured set. */
export const FEATURED_DEMO_SERIES: DemoReadableSeriesMeta[] = [
  {
    seriesIndex: 0,
    slug: 'crimson-blade-chronicles',
    title: 'Crimson Blade Chronicles',
    featured: true,
    readableChapterCount: 3,
  },
  {
    seriesIndex: 1,
    slug: 'dragon-throne-wars',
    title: 'Dragon Throne Wars',
    featured: true,
    readableChapterCount: 3,
  },
  {
    seriesIndex: 2,
    slug: 'mystic-academy',
    title: 'Mystic Academy',
    featured: true,
    readableChapterCount: 3,
  },
  {
    seriesIndex: 3,
    slug: 'shadow-ninja-academy',
    title: 'Shadow Ninja Academy',
    featured: true,
    readableChapterCount: 3,
  },
  {
    seriesIndex: 4,
    slug: 'mecha-guardian-force',
    title: 'Mecha Guardian Force',
    featured: true,
    readableChapterCount: 3,
  },
];

const FEATURED_BY_INDEX = new Map(
  FEATURED_DEMO_SERIES.map((item) => [item.seriesIndex, item])
);
const FEATURED_BY_SLUG = new Map(
  FEATURED_DEMO_SERIES.map((item) => [item.slug, item])
);

export function slugifySeriesTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function getFeaturedMetaByIndex(index: number): DemoReadableSeriesMeta | undefined {
  return FEATURED_BY_INDEX.get(index);
}

export function getFeaturedMetaBySlug(slug: string): DemoReadableSeriesMeta | undefined {
  return FEATURED_BY_SLUG.get(slug);
}

export function isFeaturedDemoSeriesIndex(index: number): boolean {
  return FEATURED_BY_INDEX.has(index);
}

/** Chapter 1 free, 2 coin-locked, 3 premium-locked for featured series. */
export function getDemoAccessType(chapterNumber: number): DemoAccessType {
  if (chapterNumber <= 1) return 'free';
  if (chapterNumber === 2) return 'coins';
  return 'premium';
}

export function getDemoUnlockCost(access: DemoAccessType): number {
  if (access === 'coins') return 15;
  if (access === 'premium') return 0;
  return 0;
}

/**
 * Page counts match scripts/generate-demo-chapter-pages.mjs
 * (8 + ((ch + slug.length) % 5)).
 */
export function getFeaturedPageCount(slug: string, chapterNumber: number): number {
  return 8 + ((chapterNumber + slug.length) % 5);
}

export function demoChapterAssetBase(): string {
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');
  return `${base}/demo/chapters`;
}

export function buildFeaturedChapterPages(slug: string, chapterNumber: number): string[] {
  const count = getFeaturedPageCount(slug, chapterNumber);
  const folder = `chapter-${String(chapterNumber).padStart(2, '0')}`;
  const root = demoChapterAssetBase();
  return Array.from({ length: count }, (_, i) => {
    const page = `page-${String(i + 1).padStart(2, '0')}.svg`;
    return `${root}/${slug}/${folder}/${page}`;
  });
}

export function buildSharedSamplePages(): string[] {
  const root = demoChapterAssetBase();
  return Array.from({ length: 8 }, (_, i) => {
    const page = `page-${String(i + 1).padStart(2, '0')}.svg`;
    return `${root}/_shared-sample/chapter-01/${page}`;
  });
}

export function resolveDemoSeriesSlug(title: string, seriesIndex: number): string {
  const featured = getFeaturedMetaByIndex(seriesIndex);
  return featured?.slug || slugifySeriesTitle(title);
}

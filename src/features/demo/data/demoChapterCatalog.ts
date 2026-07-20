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
  lockedChapterCount: 1 | 2;
}

/** First five catalogue titles = homepage featured set. */
export const FEATURED_DEMO_SERIES: DemoReadableSeriesMeta[] = [
  {
    seriesIndex: 0,
    slug: 'crimson-blade-chronicles',
    title: 'Crimson Blade Chronicles',
    featured: true,
    readableChapterCount: 10,
    lockedChapterCount: 2,
  },
  {
    seriesIndex: 1,
    slug: 'dragon-throne-wars',
    title: 'Dragon Throne Wars',
    featured: true,
    readableChapterCount: 9,
    lockedChapterCount: 2,
  },
  {
    seriesIndex: 2,
    slug: 'mystic-academy',
    title: 'Mystic Academy',
    featured: true,
    readableChapterCount: 8,
    lockedChapterCount: 1,
  },
  {
    seriesIndex: 3,
    slug: 'shadow-ninja-academy',
    title: 'Shadow Ninja Academy',
    featured: true,
    readableChapterCount: 10,
    lockedChapterCount: 2,
  },
  {
    seriesIndex: 4,
    slug: 'mecha-guardian-force',
    title: 'Mecha Guardian Force',
    featured: true,
    readableChapterCount: 9,
    lockedChapterCount: 1,
  },
];

const FEATURED_BY_INDEX = new Map(
  FEATURED_DEMO_SERIES.map((item) => [item.seriesIndex, item])
);
const FEATURED_BY_SLUG = new Map(
  FEATURED_DEMO_SERIES.map((item) => [item.slug, item])
);

/** Max chapters in any demo series (for seed helpers). */
export const DEMO_MAX_CHAPTERS_PER_SERIES = 10;

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

/**
 * Deterministic chapter count per catalogue index.
 * Featured series: 8–10 chapters. All others: 5–8 chapters.
 */
export function getDemoSeriesChapterCount(seriesIndex: number, featured = false): number {
  if (featured) {
    const featuredCounts = [10, 9, 8, 10, 9];
    return featuredCounts[seriesIndex] ?? 8;
  }
  return 5 + (seriesIndex % 4);
}

/**
 * How many newest chapters are locked (1 = premium only, 2 = coin + premium).
 */
export function getDemoLockedChapterCount(seriesIndex: number): 1 | 2 {
  if (seriesIndex <= 4 && (seriesIndex === 2 || seriesIndex === 4)) return 1;
  if (seriesIndex > 4 && seriesIndex % 3 === 2) return 1;
  return 2;
}

/**
 * Chronological demo access tiers (by chapter_number within a series).
 * - Older chapters are free.
 * - Newest chapter is premium-locked.
 * - When lockedChapterCount is 2 and totalChapters >= 3, second-newest is coin-locked.
 * Never produces a newer free chapter after an older locked chapter.
 */
export function getDemoAccessType(
  chapterNumber: number,
  totalChapters = 3,
  lockedChapterCount: 1 | 2 = 2
): DemoAccessType {
  if (totalChapters < 2 || chapterNumber < 1) return 'free';
  if (chapterNumber >= totalChapters) return 'premium';
  if (
    lockedChapterCount >= 2 &&
    totalChapters >= 3 &&
    chapterNumber === totalChapters - 1
  ) {
    return 'coins';
  }
  return 'free';
}

/** True when a locked chapter is followed by a newer free chapter (invalid). */
export function hasChronologicalAccessViolation(
  chapters: Array<{ chapter_number: number; access_type: DemoAccessType }>
): boolean {
  const ordered = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
  let seenLocked = false;
  for (const chapter of ordered) {
    if (chapter.access_type !== 'free') {
      seenLocked = true;
      continue;
    }
    if (seenLocked) return true;
  }
  return false;
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

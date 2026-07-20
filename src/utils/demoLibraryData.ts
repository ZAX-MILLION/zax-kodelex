import {
  buildFeaturedChapterPages,
  buildSharedSamplePages,
  getDemoAccessType,
  getDemoUnlockCost,
  getFeaturedMetaByIndex,
  isFeaturedDemoSeriesIndex,
  resolveDemoSeriesSlug,
  type DemoAccessType,
} from '@/features/demo/data/demoChapterCatalog';

/** Newest → Oldest for chapter list UIs. */
export function sortDemoChaptersNewestFirst<T extends { chapter_number: number }>(
  chapters: T[]
): T[] {
  return [...chapters].sort((a, b) => b.chapter_number - a.chapter_number);
}

export const CHAPTERS_PER_SERIES = 20;

export interface DemoSeries {
  id: string;
  slug: string;
  title: string;
  description: string;
  author: string;
  artist?: string;
  status: 'ongoing' | 'completed';
  genres: string[];
  tags: string[];
  content_type: 'manga' | 'novel';
  format: 'manga' | 'manhwa' | 'manhua' | 'novel';
  cover_image_url: string;
  thumbnail_url: string;
  view_count: number;
  rating_average: number;
  rating_count: number;
  age_rating: string;
  language: string;
  publication_date: string;
  created_at: string;
  updated_at: string;
  locked_chapter_count: number;
  featured: boolean;
  alt_title?: string | null;
  followers_count?: number;
  /** Optional catalogue background for the series details page. */
  details_background_url?: string | null;
}

export interface DemoChapter {
  id: string;
  series_id: string;
  series_slug: string;
  chapter_number: number;
  chapter_slug: string;
  title: string;
  pages: string[];
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  unlock_cost: number;
  access_type: DemoAccessType;
  sort_order: number;
  content_type: 'image' | 'text';
  text_content?: string;
  created_at: string;
  previous_chapter_id: string | null;
  next_chapter_id: string | null;
  comment_count?: number;
}

const MANGA_TITLES = [
  'Crimson Blade Chronicles',
  'Dragon Throne Wars',
  'Mystic Academy',
  'Shadow Ninja Academy',
  'Mecha Guardian Force',
  'Demon Hunter Legacy',
  'Dragon Slayer Chronicles',
  'Forest Guardian Spirits',
];

const MANHWA_TITLES = [
  "Solo Ascension: Ranker's Path",
  'Tower of Infinite Floors',
  'Villainess Rewritten',
  'Murim Chronicles: Iron Fist',
  "I Became the Duke's Secret Advisor",
];

const MANHUA_TITLES = [
  'Immortal Cultivation: Nine Heavens',
  'Spirit Blade Sovereign',
  "Urban Cultivator's Return",
  'Heavenly Dao Reincarnation',
];

const NOVEL_TITLES = [
  'Digital Immortality',
  'Memories of Tomorrow',
  'The Ancient Runes Mystery',
  'Space Colony Alpha',
];

const CHAPTER_TITLE_POOL = [
  'The Awakening',
  'Rising Stakes',
  'Hidden Paths',
  'The Rival Appears',
  'Trial by Fire',
];

let demoModeActive = false;

export function setDemoModeActive(active: boolean) {
  demoModeActive = active;
}

export function isDemoModeActive() {
  return demoModeActive;
}

import { isDemoModeEnabled as isDemoEnv } from '@/config/env';

export function isDemoModeEnabled(): boolean {
  return isDemoEnv();
}

/** True when we should never hit Supabase (demo build or missing credentials). */
export function shouldUseOfflineDemo(): boolean {
  return isDemoModeEnabled();
}

export function shouldUseDemoData<T>(data: T[] | null | undefined, error?: unknown): boolean {
  if (!isDemoModeEnabled()) {
    return false;
  }
  return !!error || !data || data.length === 0;
}

function makeDemoId(index: number): string {
  return `00000000-0000-4000-a000-${String(index + 1).padStart(12, '0')}`;
}

function makeChapterId(seriesId: string, chapterNumber: number): string {
  return `${seriesId}-ch-${String(chapterNumber).padStart(3, '0')}`;
}

function makeChapterSlug(chapterNumber: number): string {
  return `chapter-${String(chapterNumber).padStart(3, '0')}`;
}

function getCoverUrl(index: number): string {
  const base = import.meta.env.BASE_URL || '/';
  return `${base}demo-covers/${(index % 8) + 1}.jpg`;
}

function generateDescription(title: string, format: string): string {
  const intros: Record<string, string> = {
    manga: `In ${title}, a young hero faces impossible odds in a world of ancient powers and modern conflict. This demo series includes original sample pages so you can try the reader.`,
    manhwa: `${title} follows a determined protagonist through a vertical-scroll epic of leveling and redemption.`,
    manhua: `Cultivation, destiny, and martial arts collide in ${title}.`,
    novel: `${title} unfolds through rich prose for immersive long-form reading.`,
  };
  return intros[format] || intros.manga;
}

function buildSeriesDefinition(
  title: string,
  contentType: 'manga' | 'novel',
  format: 'manga' | 'manhwa' | 'manhua' | 'novel',
  index: number
) {
  const formatMeta = {
    manga: {
      genres: ['Action', 'Fantasy', 'Adventure'],
      tags: ['Manga', 'Japanese', 'Shonen'],
      author: ['Takeshi Yamamoto', 'Akira Sato', 'Yuki Tanaka', 'Rei Nakamura'][index % 4],
      artist: ['Hiroshi Watanabe', 'Mei Yoshida', 'Saki Matsui', 'Kenji Ishida'][index % 4],
      language: 'Japanese',
    },
    manhwa: {
      genres: ['Action', 'Fantasy', 'Drama'],
      tags: ['Manhwa', 'Korean', 'Webtoon'],
      author: ['Park Min-jun', 'Kim Soo-hyun', 'Lee Ji-woo', 'Choi Hae-in', 'Han Yuri'][index % 5],
      artist: ['Park Min-jun', 'Kim Soo-hyun', 'Lee Ji-woo', 'Choi Hae-in', 'Han Yuri'][index % 5],
      language: 'Korean',
    },
    manhua: {
      genres: ['Fantasy', 'Cultivation', 'Action'],
      tags: ['Manhua', 'Chinese', 'Cultivation'],
      author: ['Chen Wei', 'Liu Feng', 'Zhang Ming', 'Wang Lei'][index % 4],
      artist: ['Chen Wei', 'Liu Feng', 'Zhang Ming', 'Wang Lei'][index % 4],
      language: 'Chinese',
    },
    novel: {
      genres: ['Sci-Fi', 'Fantasy', 'Drama'],
      tags: ['Novel', 'Light Novel', 'Prose'],
      author: ['Future Scribe', 'Memory Keeper', 'Rune Scholar', 'Mars Chronicler'][index % 4],
      language: 'English',
    },
  }[format];

  return {
    title,
    description: generateDescription(title, format),
    author: formatMeta.author,
    artist: formatMeta.artist,
    content_type: contentType,
    format,
    genres: formatMeta.genres,
    tags: formatMeta.tags,
    status: (index % 5 === 0 ? 'completed' : 'ongoing') as 'ongoing' | 'completed',
    age_rating: 'T',
    language: formatMeta.language,
  };
}

const SERIES_DEFINITIONS = [
  ...MANGA_TITLES.map((title, i) => buildSeriesDefinition(title, 'manga', 'manga', i)),
  ...MANHWA_TITLES.map((title, i) => buildSeriesDefinition(title, 'manga', 'manhwa', i + 8)),
  ...MANHUA_TITLES.map((title, i) => buildSeriesDefinition(title, 'manga', 'manhua', i + 13)),
  ...NOVEL_TITLES.map((title, i) => buildSeriesDefinition(title, 'novel', 'novel', i + 17)),
];

function buildReadablePages(seriesIndex: number, seriesSlug: string, chapterNumber: number): string[] {
  if (isFeaturedDemoSeriesIndex(seriesIndex)) {
    return buildFeaturedChapterPages(seriesSlug, chapterNumber);
  }
  if (chapterNumber === 1) {
    return buildSharedSamplePages();
  }
  return [];
}

function buildDemoLibrary() {
  const series: DemoSeries[] = [];
  const chapters: DemoChapter[] = [];

  SERIES_DEFINITIONS.forEach((def, index) => {
    const id = makeDemoId(index);
    const featured = isFeaturedDemoSeriesIndex(index);
    const featuredMeta = getFeaturedMetaByIndex(index);
    const slug = resolveDemoSeriesSlug(def.title, index);
    const readableCount = featured ? featuredMeta?.readableChapterCount || 3 : 1;
    const daysAgo = 180 + index * 14;
    const pubDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const createdAt = new Date(Date.now() - (daysAgo + 7) * 24 * 60 * 60 * 1000);
    const viewBase = def.format === 'manhwa' ? 80000 : def.format === 'manhua' ? 60000 : 40000;

    series.push({
      id,
      slug,
      title: def.title,
      ...(index % 4 === 1 ? { alt_title: `${def.title} (Official)` } : {}),
      description: def.description,
      author: def.author,
      artist: def.artist,
      status: def.status,
      genres: def.genres,
      ...(index === 0
        ? { details_background_url: 'https://picsum.photos/seed/crimson-blade-details/1600/900' }
        : {}),
      tags: [
        ...def.tags,
        ...(def.format === 'manhwa' ? ['Full Color'] : []),
        ...(def.format === 'manhua' ? ['Wuxia'] : []),
        ...(featured ? ['Featured Demo'] : []),
      ],
      content_type: def.content_type,
      format: def.format,
      cover_image_url: getCoverUrl(index),
      thumbnail_url: getCoverUrl(index),
      view_count: viewBase + index * 4200,
      rating_average: Number((3.8 + (index % 10) * 0.1).toFixed(1)),
      rating_count: 500 + index * 320,
      followers_count: 1200 + index * 890,
      age_rating: def.age_rating,
      language: def.language,
      publication_date: pubDate.toISOString().split('T')[0],
      created_at: createdAt.toISOString(),
      updated_at: new Date(Date.now() - index * 3 * 24 * 60 * 60 * 1000).toISOString(),
      locked_chapter_count: 0,
      featured,
    });

    const seriesChapterIds: string[] = [];
    let lockedCount = 0;

    for (let ch = 1; ch <= readableCount; ch++) {
      const access = getDemoAccessType(ch, readableCount);
      const unlockCost = getDemoUnlockCost(access);
      if (access !== 'free') lockedCount += 1;
      const pages =
        def.content_type === 'novel' && !featured
          ? []
          : buildReadablePages(index, slug, ch);
      const chapterId = makeChapterId(id, ch);
      seriesChapterIds.push(chapterId);
      const releaseDate = new Date(Date.now() - (readableCount - ch + index) * 2 * 24 * 60 * 60 * 1000);

      chapters.push({
        id: chapterId,
        series_id: id,
        series_slug: slug,
        chapter_number: ch,
        chapter_slug: makeChapterSlug(ch),
        title: `Ch. ${ch}: ${CHAPTER_TITLE_POOL[ch - 1] || `Chapter ${ch}`}`,
        pages,
        page_count: pages.length,
        release_date: releaseDate.toISOString(),
        view_count: 200 + ch * 50 + index * 30,
        is_locked: access !== 'free',
        unlock_cost: unlockCost,
        access_type: access,
        sort_order: ch,
        content_type: def.content_type === 'novel' && pages.length === 0 ? 'text' : 'image',
        text_content:
          def.content_type === 'novel' && pages.length === 0
            ? `# ${CHAPTER_TITLE_POOL[ch - 1] || `Chapter ${ch}`}\n\nA short demo excerpt from *${def.title}*. Open a featured series for full sample page artwork.`
            : undefined,
        created_at: releaseDate.toISOString(),
        previous_chapter_id: null,
        next_chapter_id: null,
        comment_count: featured ? 4 + ch + (index % 3) : ch > 1 ? 1 : 0,
      });
    }

    // Wire previous/next after creation
    for (let i = 0; i < seriesChapterIds.length; i++) {
      const chapter = chapters.find((c) => c.id === seriesChapterIds[i]);
      if (!chapter) continue;
      chapter.previous_chapter_id = i > 0 ? seriesChapterIds[i - 1] : null;
      chapter.next_chapter_id =
        i < seriesChapterIds.length - 1 ? seriesChapterIds[i + 1] : null;
    }

    const seriesRecord = series[series.length - 1];
    if (seriesRecord) {
      seriesRecord.locked_chapter_count = lockedCount;
    }
  });

  return { series, chapters };
}

const DEMO_LIBRARY = buildDemoLibrary();

export function getDemoSeriesList(): DemoSeries[] {
  return DEMO_LIBRARY.series;
}

export function getDemoSeriesById(id: string): DemoSeries | undefined {
  return DEMO_LIBRARY.series.find((series) => series.id === id);
}

export function getDemoSeriesBySlug(slug: string): DemoSeries | undefined {
  return DEMO_LIBRARY.series.find((series) => series.slug === slug);
}

export function isDemoSeriesId(id: string): boolean {
  return DEMO_LIBRARY.series.some((series) => series.id === id);
}

export function isDemoChapterId(id: string): boolean {
  return DEMO_LIBRARY.chapters.some((chapter) => chapter.id === id);
}

export function getDemoChaptersForSeries(seriesId: string): DemoChapter[] {
  return sortDemoChaptersNewestFirst(
    DEMO_LIBRARY.chapters
      .filter((chapter) => chapter.series_id === seriesId)
      .filter((chapter) => chapter.page_count > 0 || !!chapter.text_content)
  );
}

export function getDemoChapterById(chapterId: string): DemoChapter | undefined {
  return DEMO_LIBRARY.chapters.find((chapter) => chapter.id === chapterId);
}

export function getDemoChapterBySeriesAndNumber(
  seriesId: string,
  chapterNumber: number
): DemoChapter | undefined {
  return DEMO_LIBRARY.chapters.find(
    (chapter) => chapter.series_id === seriesId && chapter.chapter_number === chapterNumber
  );
}

export function getDemoChapterBySlugs(
  seriesSlug: string,
  chapterSlug: string
): DemoChapter | undefined {
  return DEMO_LIBRARY.chapters.find(
    (chapter) => chapter.series_slug === seriesSlug && chapter.chapter_slug === chapterSlug
  );
}

export function getRelatedDemoSeries(seriesId: string, limit = 3): DemoSeries[] {
  const current = getDemoSeriesById(seriesId);
  if (!current) return getDemoSeriesList().filter((s) => s.featured).slice(0, limit);
  return DEMO_LIBRARY.series
    .filter((series) => series.id !== seriesId)
    .filter(
      (series) =>
        series.featured ||
        series.genres.some((g) => current.genres.includes(g)) ||
        series.format === current.format
    )
    .slice(0, limit);
}

export function getDemoChapterFeed(limit = 10) {
  return [...DEMO_LIBRARY.chapters]
    .filter((chapter) => chapter.page_count > 0)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, limit)
    .map((chapter) => {
      const series = getDemoSeriesById(chapter.series_id);
      return {
        chapter_id: chapter.id,
        chapter_title: chapter.title,
        chapter_number: chapter.chapter_number,
        series_id: chapter.series_id,
        series_title: series?.title || 'Unknown Series',
        cover_image_url: series?.cover_image_url || '/placeholder.svg',
        created_at: chapter.created_at,
        is_locked: chapter.is_locked,
        unlock_cost: chapter.unlock_cost,
        access_type: chapter.access_type,
      };
    });
}

export function activateDemoMode() {
  setDemoModeActive(true);
}

export function getFeaturedDemoSeries(): DemoSeries[] {
  return DEMO_LIBRARY.series.filter((series) => series.featured);
}

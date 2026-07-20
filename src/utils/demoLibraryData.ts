export const CHAPTERS_PER_SERIES = 20;

export interface DemoSeries {
  id: string;
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
}

export interface DemoChapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  pages: string[];
  page_count: number;
  release_date: string;
  view_count: number;
  is_locked: boolean;
  unlock_cost: number;
  sort_order: number;
  content_type: 'image' | 'text';
  text_content?: string;
  created_at: string;
}

const MANGA_TITLES = [
  'Crimson Blade Chronicles', 'Dragon Throne Wars', 'Mystic Academy', 'Shadow Ninja Academy',
  'Mecha Guardian Force', 'Demon Hunter Legacy', 'Dragon Slayer Chronicles', 'Forest Guardian Spirits',
];

const MANHWA_TITLES = [
  "Solo Ascension: Ranker's Path", 'Tower of Infinite Floors', 'Villainess Rewritten',
  'Murim Chronicles: Iron Fist', "I Became the Duke's Secret Advisor",
];

const MANHUA_TITLES = [
  'Immortal Cultivation: Nine Heavens', 'Spirit Blade Sovereign', "Urban Cultivator's Return",
  'Heavenly Dao Reincarnation',
];

const NOVEL_TITLES = [
  'Digital Immortality', 'Memories of Tomorrow', 'The Ancient Runes Mystery',
  'Space Colony Alpha',
];

const CHAPTER_TITLE_POOL = [
  'The Awakening', 'First Steps', 'Hidden Power', 'The Rival Appears', 'Trial by Fire',
  'Unexpected Alliance', 'Secrets Unearthed', 'The Turning Point', 'Dark Revelation',
  'Point of No Return', 'Fractured Bonds', 'The Counterattack', 'Into the Abyss',
  'Light in Darkness', 'The Final Gambit', 'Echoes of the Past', 'Rising Storm',
  'Breaking the Seal', 'Last Stand', 'Dawn of a New Era',
];

const LOCK_COUNTS = [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 5, 5, 5, 5, 5];

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

function getCoverUrl(index: number): string {
  // Local covers — no slow external picsum redirects on the public demo
  const base = import.meta.env.BASE_URL || '/';
  return `${base}demo-covers/${(index % 8) + 1}.jpg`;
}

function getPageUrls(seriesIndex: number, chapterNum: number, pageCount: number): string[] {
  return Array.from(
    { length: pageCount },
    (_, i) => `https://picsum.photos/seed/zax-page-${seriesIndex}-${chapterNum}-${i}/800/1200`
  );
}

function generateDescription(title: string, format: string): string {
  const intros: Record<string, string> = {
    manga: `In ${title}, a young hero faces impossible odds in a world of ancient powers and modern conflict.`,
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

function isChapterLocked(chapterNum: number, lockedCount: number): boolean {
  return chapterNum > CHAPTERS_PER_SERIES - lockedCount;
}

function getCoinCost(chapterNum: number, lockedCount: number): number {
  const positionFromLatest = CHAPTERS_PER_SERIES - chapterNum + 1;
  const base = 8 + lockedCount * 2;
  return Math.min(30, base + positionFromLatest * 2);
}

function generateNovelContent(seriesTitle: string, chapterNum: number): string {
  return `# ${CHAPTER_TITLE_POOL[chapterNum - 1] || `Chapter ${chapterNum}`}

The story of *${seriesTitle}* continues in chapter ${chapterNum}. Alliances shift, secrets surface, and the stakes keep rising.

*"We don't get to choose the battles that find us — only how we answer them."*`;
}

function buildDemoLibrary() {
  const series: DemoSeries[] = [];
  const chapters: DemoChapter[] = [];

  SERIES_DEFINITIONS.forEach((def, index) => {
    const id = makeDemoId(index);
    const lockedCount = LOCK_COUNTS[index];
    const daysAgo = 180 + index * 14;
    const pubDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    const createdAt = new Date(Date.now() - (daysAgo + 7) * 24 * 60 * 60 * 1000);
    const viewBase = def.format === 'manhwa' ? 80000 : def.format === 'manhua' ? 60000 : 40000;

    series.push({
      id,
      title: def.title,
      description: def.description,
      author: def.author,
      artist: def.artist,
      status: def.status,
      genres: def.genres,
      tags: [
        ...def.tags,
        ...(def.format === 'manhwa' ? ['Full Color'] : []),
        ...(def.format === 'manhua' ? ['Wuxia'] : []),
      ],
      content_type: def.content_type,
      format: def.format,
      cover_image_url: getCoverUrl(index),
      thumbnail_url: getCoverUrl(index),
      view_count: viewBase + index * 4200,
      rating_average: Number((3.8 + (index % 10) * 0.1).toFixed(1)),
      rating_count: 500 + index * 320,
      age_rating: def.age_rating,
      language: def.language,
      publication_date: pubDate.toISOString().split('T')[0],
      created_at: createdAt.toISOString(),
      updated_at: new Date(Date.now() - index * 3 * 24 * 60 * 60 * 1000).toISOString(),
      locked_chapter_count: lockedCount,
    });

    for (let ch = 1; ch <= CHAPTERS_PER_SERIES; ch++) {
      const isLocked = isChapterLocked(ch, lockedCount);
      const releaseDate = new Date(Date.now() - (CHAPTERS_PER_SERIES - ch + index) * 2 * 24 * 60 * 60 * 1000);

      // Demo preview lists chapters but does not ship page artwork (keeps preview clean / legal-safe).
      chapters.push({
        id: makeChapterId(id, ch),
        series_id: id,
        chapter_number: ch,
        title: `Ch. ${ch}: ${CHAPTER_TITLE_POOL[ch - 1] || `Chapter ${ch}`}`,
        pages: [],
        page_count: 0,
        release_date: releaseDate.toISOString(),
        view_count: 200 + ch * 50 + index * 30,
        is_locked: isLocked,
        unlock_cost: isLocked ? getCoinCost(ch, lockedCount) : 0,
        sort_order: ch,
        content_type: def.content_type === 'novel' ? 'text' : 'image',
        text_content: undefined,
        created_at: releaseDate.toISOString(),
      });
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

export function isDemoSeriesId(id: string): boolean {
  return DEMO_LIBRARY.series.some((series) => series.id === id);
}

export function isDemoChapterId(id: string): boolean {
  return DEMO_LIBRARY.chapters.some((chapter) => chapter.id === id);
}

export function getDemoChaptersForSeries(seriesId: string): DemoChapter[] {
  return DEMO_LIBRARY.chapters
    .filter((chapter) => chapter.series_id === seriesId)
    .sort((a, b) => a.chapter_number - b.chapter_number);
}

export function getDemoChapterById(chapterId: string): DemoChapter | undefined {
  return DEMO_LIBRARY.chapters.find((chapter) => chapter.id === chapterId);
}

export function getDemoChapterFeed(limit = 10) {
  return [...DEMO_LIBRARY.chapters]
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
      };
    });
}

export function activateDemoMode() {
  setDemoModeActive(true);
}

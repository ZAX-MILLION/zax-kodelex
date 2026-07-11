import { supabase } from '@/integrations/supabase/client';

const COVER_IMAGES = [
  '/src/assets/manga-covers/crimson-blade-cover.jpg',
  '/src/assets/manga-covers/dragons-legacy-cover.jpg',
  '/src/assets/manga-covers/mystic-academy-cover.jpg',
  '/src/assets/manga-covers/elemental-magic-academy.jpg',
  '/src/assets/manga-covers/cyberpunk-detective.jpg',
  '/src/assets/manga-covers/demon-hunter-chronicles.jpg',
  '/src/assets/manga-covers/cherry-blossom-romance.jpg',
  '/src/assets/manga-covers/space-pirate-captain.jpg',
  '/src/assets/manga-covers/forest-spirit-guardian.jpg',
  '/src/assets/manga-covers/cafe-love-stories.jpg',
  '/src/assets/manga-covers/clumsy-chef-adventures.jpg',
  '/src/assets/manga-covers/pet-shop-pandemonium.jpg',
  '/src/assets/manga-covers/shadow-ninja-academy.jpg',
  '/src/assets/manga-covers/mecha-warriors-united.jpg',
  '/src/assets/manga-covers/midnight-confessions.jpg',
  '/src/assets/manga-covers/dragon-slayer-chronicles.jpg',
  '/src/assets/manga-covers/elemental-magic-academy-ai.jpg',
];

const PAGE_IMAGES = [
  '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg',
  '/src/assets/manga-pages/crimson-blade-ch1-p2.jpg',
  '/src/assets/manga-pages/crimson-blade-ch1-p3.jpg',
  '/src/assets/manga-pages/crimson-blade-ch1-p4.jpg',
  '/src/assets/manga-pages/crimson-blade-ch1-p5.jpg',
  '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg',
  '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg',
];

const CHAPTERS_PER_SERIES = 20;

// 5 series each lock latest 1, 2, 3, or 5 chapters — shuffled for realism
const LOCK_COUNTS = shuffleArray([
  ...Array(5).fill(1),
  ...Array(5).fill(2),
  ...Array(5).fill(3),
  ...Array(5).fill(5),
]);

const MANGA_TITLES = [
  'Crimson Blade Chronicles', 'Dragon Throne Wars', 'Mystic Academy', 'Shadow Ninja Academy',
  'Mecha Guardian Force', 'Demon Hunter Legacy', 'Dragon Slayer Chronicles', 'Forest Guardian Spirits',
];

const MANHWA_TITLES = [
  'Solo Ascension: Ranker\'s Path', 'Tower of Infinite Floors', 'Villainess Rewritten',
  'Murim Chronicles: Iron Fist', 'I Became the Duke\'s Secret Advisor',
];

const MANHUA_TITLES = [
  'Immortal Cultivation: Nine Heavens', 'Spirit Blade Sovereign', 'Urban Cultivator\'s Return',
  'Heavenly Dao Reincarnation',
];

const NOVEL_TITLES = [
  'Digital Immortality', 'Memories of Tomorrow', 'The Ancient Runes Mystery',
  'Space Colony Alpha',
];

interface DemoSeries {
  title: string;
  description: string;
  author: string;
  artist?: string;
  content_type: 'manga' | 'novel';
  format: 'manga' | 'manhwa' | 'manhua' | 'novel';
  genres: string[];
  tags: string[];
  status: 'ongoing' | 'completed';
  age_rating: string;
  language: string;
}

const SERIES_DEFINITIONS: DemoSeries[] = [
  ...MANGA_TITLES.map((title, i) => buildSeries(title, 'manga', 'manga', i)),
  ...MANHWA_TITLES.map((title, i) => buildSeries(title, 'manga', 'manhwa', i + 8)),
  ...MANHUA_TITLES.map((title, i) => buildSeries(title, 'manga', 'manhua', i + 13)),
  ...NOVEL_TITLES.map((title, i) => buildSeries(title, 'novel', 'novel', i + 17)),
];

function buildSeries(
  title: string,
  contentType: 'manga' | 'novel',
  format: 'manga' | 'manhwa' | 'manhua' | 'novel',
  index: number
): DemoSeries {
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
    status: index % 5 === 0 ? 'completed' : 'ongoing',
    age_rating: format === 'manhwa' ? 'T' : 'T',
    language: formatMeta.language,
  };
}

function generateDescription(title: string, format: string): string {
  const intros: Record<string, string> = {
    manga: `In ${title}, a young hero faces impossible odds in a world of ancient powers and modern conflict. Every chapter deepens the mystery and raises the stakes.`,
    manhwa: `${title} follows a determined protagonist through a vertical-scroll epic of leveling, betrayal, and redemption — a hallmark of modern Korean webtoon storytelling.`,
    manhua: `Cultivation, destiny, and martial arts collide in ${title}. As realms clash and sects scheme, one cultivator must rise above fate itself.`,
    novel: `${title} unfolds through rich prose, exploring character psychology and world-building in a narrative crafted for immersive long-form reading.`,
  };
  return intros[format] || intros.manga;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const CHAPTER_TITLE_POOL = [
  'The Awakening', 'First Steps', 'Hidden Power', 'The Rival Appears', 'Trial by Fire',
  'Unexpected Alliance', 'Secrets Unearthed', 'The Turning Point', 'Dark Revelation',
  'Point of No Return', 'Fractured Bonds', 'The Counterattack', 'Into the Abyss',
  'Light in Darkness', 'The Final Gambit', 'Echoes of the Past', 'Rising Storm',
  'Breaking the Seal', 'Last Stand', 'Dawn of a New Era',
];

function getChapterTitle(num: number): string {
  return CHAPTER_TITLE_POOL[num - 1] || `Chapter ${num}`;
}

function generatePages(chapterNum: number, pageCount: number): string[] {
  return Array.from({ length: pageCount }, (_, i) =>
    PAGE_IMAGES[(chapterNum * 3 + i) % PAGE_IMAGES.length]
  );
}

function generateNovelContent(seriesTitle: string, chapterNum: number): string {
  return `# ${getChapterTitle(chapterNum)}

The story of *${seriesTitle}* continues as new revelations reshape everything our characters believed. Chapter ${chapterNum} opens with tension hanging in the air — alliances tested, secrets surfacing, and the path forward more uncertain than ever.

Dialogue crackles with emotion. Inner monologue reveals doubts and resolve in equal measure. Each paragraph builds toward a climax that leaves readers eager for the next installment.

*"We don't get to choose the battles that find us,"* a voice echoes. *"Only how we answer them."*

As dusk settles, the narrative threads of ${seriesTitle} weave tighter. What began as a simple journey has become a saga of sacrifice, growth, and the stubborn refusal to surrender hope.

---

*Word count: ~1,800 | ${seriesTitle} — Chapter ${chapterNum}*`;
}

function isChapterLocked(chapterNum: number, lockedCount: number): boolean {
  return chapterNum > CHAPTERS_PER_SERIES - lockedCount;
}

function getCoinCost(chapterNum: number, lockedCount: number): number {
  const positionFromLatest = CHAPTERS_PER_SERIES - chapterNum + 1;
  const base = 8 + lockedCount * 2;
  return Math.min(30, base + positionFromLatest * 2);
}

async function clearExistingLibrary() {
  await supabase.from('chapter_prices').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('chapter_access').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('series_views').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('manga_meta').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}

export interface DemoLibraryStats {
  series: number;
  chapters: number;
  lockedChapters: number;
  lockDistribution: Record<number, number>;
}

export const seedDemoLibrary = async (): Promise<{
  success: boolean;
  stats?: DemoLibraryStats;
  error?: unknown;
}> => {
  try {
    console.log('🌱 Seeding demo library: 20 series × 20 chapters...');
    await clearExistingLibrary();

    const lockCounts = shuffleArray(LOCK_COUNTS);
    const lockDistribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 5: 0 };

    const seriesInserts = SERIES_DEFINITIONS.map((series, i) => {
      const daysAgo = 180 + i * 14;
      const pubDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      const viewBase = series.format === 'manhwa' ? 80000 : series.format === 'manhua' ? 60000 : 40000;

      return {
        title: series.title,
        description: series.description,
        author: series.author,
        artist: series.artist ?? null,
        content_type: series.content_type,
        genres: series.genres,
        tags: [
          ...series.tags,
          ...(series.format === 'manhwa' ? ['Full Color'] : []),
          ...(series.format === 'manhua' ? ['Wuxia'] : []),
        ],
        status: series.status as 'ongoing' | 'completed',
        age_rating: series.age_rating,
        language: series.language,
        cover_image_url: COVER_IMAGES[i % COVER_IMAGES.length],
        thumbnail_url: COVER_IMAGES[i % COVER_IMAGES.length],
        view_count: viewBase + Math.floor(Math.random() * 50000),
        rating_average: Number((3.8 + Math.random() * 1.1).toFixed(1)),
        rating_count: Math.floor(Math.random() * 8000) + 500,
        publication_date: pubDate.toISOString().split('T')[0],
        meta_title: `${series.title} — Read Online`,
        meta_description: series.description.slice(0, 155),
      };
    });

    const { data: createdSeries, error: seriesError } = await supabase
      .from('manga_meta')
      .insert(seriesInserts)
      .select('id, title');

    if (seriesError) throw seriesError;
    if (!createdSeries?.length) throw new Error('No series created');

    let totalChapters = 0;
    let totalLocked = 0;
    const allChapterPrices: { chapter_id: string; coin_cost: number; premium_only: boolean }[] = [];

    for (let s = 0; s < createdSeries.length; s++) {
      const series = createdSeries[s];
      const def = SERIES_DEFINITIONS[s];
      const lockedCount = lockCounts[s];
      lockDistribution[lockedCount] = (lockDistribution[lockedCount] || 0) + 1;

      const chapterBatch = [];
      for (let ch = 1; ch <= CHAPTERS_PER_SERIES; ch++) {
        const isLocked = isChapterLocked(ch, lockedCount);
        const pageCount = def.content_type === 'novel' ? 1 : 14 + (ch % 8);
        const releaseDate = new Date(Date.now() - (CHAPTERS_PER_SERIES - ch) * 7 * 24 * 60 * 60 * 1000);

        const pages = def.content_type === 'novel'
          ? JSON.stringify([`novel-${series.id}-ch${ch}`])
          : JSON.stringify(generatePages(ch, pageCount));

        chapterBatch.push({
          series_id: series.id,
          chapter_number: ch,
          title: `Ch. ${ch}: ${getChapterTitle(ch)}`,
          page_count: pageCount,
          pages,
          sort_order: ch,
          is_locked: isLocked,
          release_date: releaseDate.toISOString(),
          view_count: Math.floor(Math.random() * 15000) + 200 + ch * 50,
          thumbnail_url: def.content_type === 'novel'
            ? '/placeholder.svg'
            : PAGE_IMAGES[ch % PAGE_IMAGES.length],
        });

        if (isLocked) totalLocked++;
      }

      const { data: insertedChapters, error: chError } = await supabase
        .from('chapters')
        .insert(chapterBatch)
        .select('id, chapter_number, is_locked');

      if (chError) {
        console.error(`Failed chapters for ${series.title}:`, chError);
        continue;
      }

      totalChapters += insertedChapters?.length ?? 0;

      for (const ch of insertedChapters ?? []) {
        if (ch.is_locked) {
          allChapterPrices.push({
            chapter_id: ch.id,
            coin_cost: getCoinCost(ch.chapter_number, lockedCount),
            premium_only: false,
          });
        }
      }

      console.log(`📖 ${series.title}: 20 chapters, ${lockedCount} locked (latest ${lockedCount})`);
    }

    if (allChapterPrices.length > 0) {
      const { error: priceError } = await supabase.from('chapter_prices').insert(allChapterPrices);
      if (priceError) console.warn('chapter_prices insert warning:', priceError);
    }

    // Seed view events for trending realism
    const viewsBatch = createdSeries.flatMap((series, i) =>
      Array.from({ length: 20 + i * 3 }, () => ({
        series_id: series.id,
        user_id: null,
        ip_address: `10.0.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        user_agent: 'Mozilla/5.0 (DemoSeeder)',
        referrer: 'https://zaxmillion.com/browse',
        created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      }))
    );

    await supabase.from('series_views').insert(viewsBatch.slice(0, 500));

    const stats: DemoLibraryStats = {
      series: createdSeries.length,
      chapters: totalChapters,
      lockedChapters: totalLocked,
      lockDistribution,
    };

    console.log('🎉 Demo library seeded:', stats);
    return { success: true, stats };
  } catch (error) {
    console.error('❌ Demo library seed failed:', error);
    return { success: false, error };
  }
};

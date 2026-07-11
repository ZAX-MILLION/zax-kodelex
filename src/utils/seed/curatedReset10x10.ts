import { supabase } from '@/integrations/supabase/client';

export interface CuratedResetStats {
  seriesCount: number;
  mangaCount: number;
  novelCount: number;
  chapterCount: number;
  lockedCount: number;
}

// Helper to slugify for deterministic image seeds
const slugify = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export const runCuratedReset10x10 = async (): Promise<{ success: boolean; stats?: CuratedResetStats; error?: string }> => {
  try {
    console.log('🧹 Wiping existing series, chapters, prices, views, bookmarks, and progress...');

    // Delete in dependency-safe order
    await supabase.from('chapter_prices').delete().neq('chapter_id', '');
    await supabase.from('series_views').delete().neq('id', '');
    await supabase.from('bookmarks').delete().neq('user_id', '');
    await supabase.from('reading_progress').delete().neq('user_id', '');
    await supabase.from('chapters').delete().neq('id', '');
    await supabase.from('manga_meta').delete().neq('id', '');

    // Curated 5 manga + 5 novels
    const mangaSeries = [
      {
        title: 'Crimson Blade Saga',
        description: 'Akira awakens the legendary Crimson Blade to repel an otherworldly invasion—an epic of magic, steel, and destiny.',
        author: 'Takeshi Yamamoto',
        status: 'ongoing',
        genres: ['Action', 'Fantasy', 'Supernatural'],
        cover_image_url: 'https://picsum.photos/seed/crimson-blade/400/600',
      },
      {
        title: "Dragon's Legacy",
        description: 'A young archaeologist uncovers the last dragon egg and a conspiracy that could reshape the world.',
        author: 'Miyuki Sato',
        status: 'ongoing',
        genres: ['Fantasy', 'Adventure', 'Drama'],
        cover_image_url: 'https://picsum.photos/seed/dragons-legacy/400/600',
      },
      {
        title: 'Mystic Academy Chronicles',
        description: 'Elite students train to master arcane arts as an ancient prophecy stirs within the academy walls.',
        author: 'Sakura Kimura',
        status: 'ongoing',
        genres: ['Romance', 'Fantasy', 'School Life'],
        cover_image_url: 'https://picsum.photos/seed/mystic-academy/400/600',
      },
      {
        title: 'Shadow Ninja Academy',
        description: 'Hidden villages, forbidden jutsu, and a conspiracy threaten the code of the shadow clan.',
        author: 'Kenji Ishida',
        status: 'completed',
        genres: ['Action', 'Martial Arts', 'Adventure'],
        cover_image_url: 'https://picsum.photos/seed/shadow-ninja/400/600',
      },
      {
        title: 'Cyberpunk Detective',
        description: 'In neon-lit Neo Tokyo, a cybernetic detective hunts crimes that blur human and machine.',
        author: 'Ryo Hashimoto',
        status: 'ongoing',
        genres: ['Sci-Fi', 'Mystery', 'Thriller'],
        cover_image_url: 'https://picsum.photos/seed/cyberpunk-detective/400/600',
      },
    ];

    const novelSeries = [
      {
        title: 'Reincarnated as a Villain',
        description: 'Awakening in the body of the story’s villain, our protagonist must outwit fate to survive.',
        author: 'Aoi Kisaragi',
        status: 'ongoing',
        genres: ['Fantasy', 'Isekai', 'Drama'],
        cover_image_url: 'https://picsum.photos/seed/villain-reincarnated/400/600',
      },
      {
        title: 'The System Awakens',
        description: 'A mundane life shatters when a mysterious system grants quests, stats, and danger.',
        author: 'Haru Minase',
        status: 'ongoing',
        genres: ['Sci-Fi', 'Action', 'Adventure'],
        cover_image_url: 'https://picsum.photos/seed/system-awakens/400/600',
      },
      {
        title: "Cultivation Master's Path",
        description: 'From humble roots to immortal heights—alchemy, martial arts, and destiny intertwine.',
        author: 'Li Wei',
        status: 'ongoing',
        genres: ['Martial Arts', 'Xianxia', 'Adventure'],
        cover_image_url: 'https://picsum.photos/seed/cultivation-path/400/600',
      },
      {
        title: 'Academy of Forbidden Arts',
        description: 'A secretive academy teaches arts banned by the realm—power at a terrible price.',
        author: 'Natsumi Aoki',
        status: 'ongoing',
        genres: ['Fantasy', 'School Life', 'Mystery'],
        cover_image_url: 'https://picsum.photos/seed/forbidden-arts/400/600',
      },
      {
        title: 'Immortal Sword Saint',
        description: 'A lone swordsman walks the thin line between honor and eternity.',
        author: 'Zhang Rui',
        status: 'completed',
        genres: ['Wuxia', 'Adventure', 'Drama'],
        cover_image_url: 'https://picsum.photos/seed/immortal-saint/400/600',
      },
    ];

    const insertSeries = async (s: any, content_type: 'manga' | 'novel') => {
      const { data, error } = await supabase
        .from('manga_meta')
        .insert({
          title: s.title,
          description: s.description,
          author: s.author,
          status: s.status,
          genres: s.genres,
          content_type,
          cover_image_url: s.cover_image_url,
          rating_average: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
          rating_count: Math.floor(Math.random() * 3000) + 200,
          view_count: Math.floor(Math.random() * 100000) + 5000,
          publication_date: new Date().toISOString().slice(0, 10),
          age_rating: 'T',
          language: 'en',
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    };

    const createChapterPages = (seriesSeed: string, chapterNum: number, count: number) => {
      return Array.from({ length: count }, (_, idx) => `https://picsum.photos/seed/${seriesSeed}-ch${chapterNum}-p${idx + 1}/800/1200`);
    };

    let seriesCount = 0;
    let chapterCount = 0;
    let lockedCount = 0;

    // Seed manga
    for (const s of mangaSeries) {
      const series = await insertSeries(s, 'manga');
      seriesCount++;
      const seed = slugify(s.title);
      for (let i = 1; i <= 10; i++) {
        const pages = createChapterPages(seed, i, 12);
        const isLocked = i >= 9; // last two locked
        const { data: chapter, error: chErr } = await supabase
          .from('chapters')
          .insert({
            series_id: series.id,
            chapter_number: i,
            title: `Chapter ${i}: ${i === 1 ? 'Beginnings' : i === 10 ? 'New Dawn' : 'Story Unfolds'}`,
            pages: JSON.stringify(pages),
            page_count: pages.length,
            release_date: new Date(Date.now() - (10 - i) * 3 * 24 * 60 * 60 * 1000).toISOString(),
            sort_order: i,
            is_locked: isLocked,
            thumbnail_url: pages[0],
            view_count: Math.floor(Math.random() * 5000) + 500,
          })
          .select()
          .single();
        if (chErr) throw chErr;
        chapterCount++;
        if (isLocked && chapter) {
          lockedCount++;
          await supabase.from('chapter_prices').insert({
            chapter_id: chapter.id,
            coin_cost: 10,
            premium_only: false,
            early_access_hours: 0,
          });
        }
      }
    }

    // Seed novels (use image pages for compatibility with current reader)
    for (const s of novelSeries) {
      const series = await insertSeries(s, 'novel');
      seriesCount++;
      const seed = slugify(s.title);
      for (let i = 1; i <= 10; i++) {
        const pages = createChapterPages(seed, i, 10);
        const isLocked = i >= 9;
        const { data: chapter, error: chErr } = await supabase
          .from('chapters')
          .insert({
            series_id: series.id,
            chapter_number: i,
            title: `Chapter ${i}: ${i === 1 ? 'Prologue' : i === 10 ? 'Epilogue' : 'Arc'}`,
            pages: JSON.stringify(pages),
            page_count: pages.length,
            release_date: new Date(Date.now() - (10 - i) * 2 * 24 * 60 * 60 * 1000).toISOString(),
            sort_order: i,
            is_locked: isLocked,
            thumbnail_url: pages[0],
            view_count: Math.floor(Math.random() * 4000) + 300,
          })
          .select()
          .single();
        if (chErr) throw chErr;
        chapterCount++;
        if (isLocked && chapter) {
          lockedCount++;
          await supabase.from('chapter_prices').insert({
            chapter_id: chapter.id,
            coin_cost: 10,
            premium_only: false,
            early_access_hours: 0,
          });
        }
      }
    }

    console.log('✅ Curated reset complete:', { seriesCount, chapterCount, lockedCount });

    return {
      success: true,
      stats: {
        seriesCount,
        mangaCount: mangaSeries.length,
        novelCount: novelSeries.length,
        chapterCount,
        lockedCount,
      },
    };
  } catch (error) {
    console.error('❌ Curated reset failed:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
};

// Expose in browser console for convenience
if (typeof window !== 'undefined') {
  (window as any).runCuratedReset10x10 = runCuratedReset10x10;
}

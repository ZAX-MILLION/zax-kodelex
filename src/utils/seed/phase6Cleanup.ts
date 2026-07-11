import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive database cleanup and seeding for Phase 6
 * Wipes all data and creates 20 manga + 10 novel series with working content
 */

interface SeriesTemplate {
  title: string;
  author: string;
  artist?: string;
  description: string;
  genres: string[];
  tags: string[];
  status: 'ongoing' | 'completed';
  content_type: 'manga' | 'novel' | 'webtoon' | 'light_novel';
}

const MANGA_TEMPLATES: SeriesTemplate[] = [
  {
    title: "Crimson Blade Chronicles",
    author: "Akira Sato",
    artist: "Yuki Tanaka",
    description: "In a world where ancient spirits and modern technology collide, young warrior Akira must master the legendary Crimson Blade to save humanity from an otherworldly threat.",
    genres: ["Action", "Fantasy", "Supernatural"],
    tags: ["sword fighting", "spirits", "technology", "adventure"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Cyber Guardian Academy",
    author: "Neo Fukuda",
    artist: "Ray Morimoto", 
    description: "In 2087, elite students train to become digital protectors in a world where cyber warfare threatens humanity's survival.",
    genres: ["Sci-Fi", "Action", "School Life"],
    tags: ["cyberpunk", "academy", "technology", "future"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Dragon Slayer's Legacy",
    author: "Miyuki Yamamoto",
    artist: "Kenji Sato",
    description: "Ancient dragons return to terrorize the kingdom. Only the descendants of legendary dragon slayers can save the realm.",
    genres: ["Fantasy", "Action", "Adventure"],
    tags: ["dragons", "magic", "kingdom", "legacy"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Elemental Magic Academy",
    author: "Rei Nakamura",
    artist: "Saki Matsui",
    description: "Students master fire, water, earth, and air magic while uncovering ancient secrets that threaten their world.",
    genres: ["Fantasy", "School Life", "Magic"],
    tags: ["elements", "academy", "friendship", "magic"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Space Pirate Captain Nova",
    author: "Hana Ogawa",
    artist: "Kyo Nakajima",
    description: "Captain Nova and her crew search for legendary treasure across the galaxy while evading the Galactic Empire.",
    genres: ["Adventure", "Comedy", "Sci-Fi"],
    tags: ["pirates", "space", "treasure", "comedy"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Cherry Blossom Romance",
    author: "Sakura Kimura",
    artist: "Ren Watanabe",
    description: "A heartwarming tale of high school love that blooms like cherry blossoms in spring.",
    genres: ["Romance", "School Life", "Drama"],
    tags: ["high school", "first love", "spring", "slice of life"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Mecha Warriors United",
    author: "Taro Suzuki",
    artist: "Yui Hayashi",
    description: "Giant robot pilots defend Earth from alien invasion in epic mecha battles.",
    genres: ["Mecha", "Sci-Fi", "Action"],
    tags: ["robots", "aliens", "military", "teamwork"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Shadow Ninja Academy",
    author: "Dark Sensei",
    artist: "Shadow Artist",
    description: "Elite ninja students train in ancient arts while facing modern threats to their hidden village.",
    genres: ["Action", "Martial Arts", "School Life"],
    tags: ["ninja", "academy", "stealth", "tradition"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Forest Spirit Guardian",
    author: "Midori Yoshida",
    artist: "Haru Sasaki",
    description: "Young druid Mira protects mystical forest creatures from those who would harm the natural world.",
    genres: ["Fantasy", "Adventure", "Environmental"],
    tags: ["nature", "spirits", "magic", "protection"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Midnight Café Chronicles",
    author: "Luna Takahashi",
    artist: "Mio Fujiwara",
    description: "A mysterious 24-hour café serves supernatural customers with otherworldly problems.",
    genres: ["Supernatural", "Slice of Life", "Mystery"],
    tags: ["café", "supernatural", "mystery", "night"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Cooking Tournament King",
    author: "Chef Yamada",
    artist: "Gourmet Sato",
    description: "Young chef Ryo competes in the ultimate cooking tournament to become the culinary king.",
    genres: ["Comedy", "Sports", "Cooking"],
    tags: ["cooking", "competition", "comedy", "tournament"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Time Traveler's Dilemma",
    author: "Chrono Writer",
    artist: "Time Artist",
    description: "Students learn to navigate time while preventing paradoxes that could destroy reality.",
    genres: ["Sci-Fi", "Time Travel", "Drama"],
    tags: ["time travel", "paradox", "school", "responsibility"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Beast Tamer Chronicles",
    author: "Wild Heart",
    artist: "Creature Master",
    description: "Kira communicates with mythical beasts to maintain balance between human and animal worlds.",
    genres: ["Fantasy", "Adventure", "Animals"],
    tags: ["beasts", "taming", "balance", "nature"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Virtual Reality Quest",
    author: "VR Master",
    artist: "Digital Artist",
    description: "Players trapped in a virtual MMORPG must clear 100 floors to return to reality.",
    genres: ["Sci-Fi", "Gaming", "Adventure"],
    tags: ["VR", "gaming", "trapped", "levels"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Demon Hunter Squad",
    author: "Kai Moriguchi",
    artist: "Yuki Ogawa",
    description: "Elite demon hunters protect modern cities from supernatural threats lurking in the shadows.",
    genres: ["Action", "Supernatural", "Urban Fantasy"],
    tags: ["demons", "hunters", "modern", "urban"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Musical Prodigy Academy",
    author: "Melody Composer",
    artist: "Harmony Artist",
    description: "Talented musicians compete and collaborate at the world's most prestigious music academy.",
    genres: ["Music", "School Life", "Drama"],
    tags: ["music", "academy", "competition", "talent"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Steampunk Inventor's Tale",
    author: "Gear Engineer",
    artist: "Steam Artist",
    description: "In Victorian London, inventor Alice creates mechanical wonders while solving supernatural mysteries.",
    genres: ["Steampunk", "Mystery", "Adventure"],
    tags: ["steampunk", "invention", "victorian", "mystery"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Magical Girl Squadron",
    author: "Star Princess",
    artist: "Moon Artist",
    description: "Five girls with elemental powers unite to protect Earth from cosmic threats.",
    genres: ["Magical Girl", "Action", "Friendship"],
    tags: ["magical girl", "elements", "friendship", "cosmic"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Underground Fight Club",
    author: "Ring Master",
    artist: "Fighter Artist",
    description: "Street fighter Jin enters underground tournaments to prove he's the strongest in the city.",
    genres: ["Action", "Sports", "Urban"],
    tags: ["fighting", "tournament", "street", "strength"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Galactic Explorer Corps",
    author: "Star Navigator",
    artist: "Galaxy Artist",
    description: "Space explorers discover new worlds and alien civilizations while facing cosmic dangers.",
    genres: ["Sci-Fi", "Adventure", "Space"],
    tags: ["space", "exploration", "aliens", "discovery"],
    status: "ongoing",
    content_type: "manga"
  }
];

const NOVEL_TEMPLATES: SeriesTemplate[] = [
  {
    title: "The Chronicles of Digital Immortality",
    author: "Future Scribe",
    description: "In 2095, consciousness can be uploaded to achieve immortality. Dr. Maya Chen investigates mysterious disappearances in the digital realm while questioning the nature of human identity.",
    genres: ["Sci-Fi", "Thriller", "Philosophy"],
    tags: ["consciousness", "digital", "immortality", "identity"],
    status: "completed",
    content_type: "novel"
  },
  {
    title: "Ancient Runes of Power",
    author: "Rune Scholar",
    description: "Archaeologist Sarah discovers runes that can alter reality. As she deciphers their secrets, she uncovers a conspiracy spanning millennia.",
    genres: ["Fantasy", "Mystery", "Archaeological"],
    tags: ["runes", "archaeology", "ancient", "conspiracy"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Space Colony Alpha Chronicles",
    author: "Colony Writer",
    description: "The first human colony on Mars faces challenges of survival, politics, and the discovery of ancient alien artifacts.",
    genres: ["Sci-Fi", "Political", "Survival"],
    tags: ["mars", "colony", "aliens", "survival"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "The Last Dragon Keeper",
    author: "Dragon Lore Master",
    description: "In a world where dragons are nearly extinct, young keeper Lyra must protect the last dragon eggs from those who would destroy them.",
    genres: ["Fantasy", "Adventure", "Conservation"],
    tags: ["dragons", "keeper", "extinction", "protection"],
    status: "ongoing",
    content_type: "light_novel"
  },
  {
    title: "Quantum Detective Stories",
    author: "Quantum Mystery",
    description: "Detective Quinn solves crimes across multiple timelines using quantum physics principles in this mind-bending series.",
    genres: ["Sci-Fi", "Mystery", "Crime"],
    tags: ["quantum", "detective", "timeline", "physics"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Academy of Forbidden Arts",
    author: "Forbidden Scholar",
    description: "Students secretly learn banned magical arts while avoiding detection by the magical authorities.",
    genres: ["Fantasy", "School Life", "Rebellion"],
    tags: ["forbidden", "magic", "academy", "rebellion"],
    status: "ongoing",
    content_type: "light_novel"
  },
  {
    title: "The Merchant Prince's Journey",
    author: "Trade Master",
    description: "Young merchant Alex builds a trading empire while navigating political intrigue and magical dangers.",
    genres: ["Fantasy", "Adventure", "Economics"],
    tags: ["merchant", "trade", "empire", "politics"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Cyber Samurai Rebellion",
    author: "Digital Warrior",
    description: "In cyberpunk Japan, traditional samurai values clash with corporate dystopia as warriors fight for freedom.",
    genres: ["Cyberpunk", "Action", "Cultural"],
    tags: ["samurai", "cyberpunk", "rebellion", "tradition"],
    status: "completed",
    content_type: "novel"
  },
  {
    title: "The Dreamwalker's Guild",
    author: "Dream Weaver",
    description: "Professional dreamwalkers enter sleeping minds to solve problems, but face nightmares that threaten reality itself.",
    genres: ["Fantasy", "Psychological", "Supernatural"],
    tags: ["dreams", "nightmares", "mind", "guild"],
    status: "ongoing",
    content_type: "light_novel"
  },
  {
    title: "Interstellar Refugee Crisis",
    author: "Star Chronicler",
    description: "When Earth becomes uninhabitable, humanity must find new homes among the stars while facing alien politics.",
    genres: ["Sci-Fi", "Political", "Drama"],
    tags: ["refugees", "interstellar", "politics", "survival"],
    status: "ongoing",
    content_type: "novel"
  }
];

// Helper functions for generating realistic content
const getRandomDate = () => {
  const start = new Date(2020, 0, 1);
  const end = new Date(2024, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().split('T')[0];
};

const getRandomAgeRating = () => {
  const ratings = ['G', 'PG', 'T', 'M', 'MA'];
  return ratings[Math.floor(Math.random() * ratings.length)];
};

const generateChapterTitle = () => {
  const titles = [
    'The Beginning', 'New Challenges', 'Hidden Secrets', 'Unexpected Allies', 'The Truth Revealed',
    'Final Confrontation', 'A New Dawn', 'Past Memories', 'Future Plans', 'The Journey Continues',
    'Ancient Mysteries', 'Power Awakens', 'Bonds of Friendship', 'Dark Revelations', 'Hope Returns'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generateMangaPages = (chapterNum: number, seriesId: string) => {
  const pageCount = Math.floor(Math.random() * 11) + 15; // 15-25 pages
  const pages = [];
  
  for (let i = 1; i <= pageCount; i++) {
    pages.push({
      page_number: i,
      image_url: `https://picsum.photos/seed/page-${seriesId}-${chapterNum}-${i}/800/1200`,
      alt_text: `Chapter ${chapterNum}, Page ${i}`
    });
  }
  
  return pages;
};

const generateNovelContent = (chapterNum: number) => {
  const content = `Chapter ${chapterNum} content: This is a compelling piece of literature that explores deep themes and character development. The narrative unfolds with careful attention to detail, drawing readers into a rich and immersive world. Each paragraph builds upon the last, creating a cohesive and engaging reading experience that showcases the author's skill in storytelling.`;
  
  return [{
    page_number: 1,
    content: content,
    word_count: content.split(' ').length
  }];
};

const getRandomReleaseDate = (publicationDate: string, chapterNum: number, totalChapters: number) => {
  const pubDate = new Date(publicationDate);
  const daysBetween = Math.floor((Date.now() - pubDate.getTime()) / (1000 * 60 * 60 * 24));
  const intervalPerChapter = Math.max(1, Math.floor(daysBetween / totalChapters));
  
  const releaseDate = new Date(pubDate.getTime() + (chapterNum - 1) * intervalPerChapter * 24 * 60 * 60 * 1000);
  return releaseDate.toISOString();
};

const generateRandomIP = () => {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
};

const getRandomRecentDate = () => {
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30); // Last 30 days
  const hoursAgo = Math.floor(Math.random() * 24);
  const date = new Date(now.getTime() - (daysAgo * 24 + hoursAgo) * 60 * 60 * 1000);
  return date.toISOString();
};

/**
 * Enhanced Phase 6 cleanup and comprehensive data seeding
 * Wipes ALL data and creates realistic manga/novel content with working images
 */
export const runPhase6Cleanup = async () => {
  console.log('🚀 Starting Enhanced Phase 6 Database Cleanup...');
  
  try {
    // Wipe all existing data
    console.log('🗑️ Wiping existing data...');
    
    const deleteQueries = [
      supabase.from('series_views').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('manga_ratings').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('comments').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('chapter_access').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('chapter_prices').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('chapters').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('manga_meta').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    ];
    
    await Promise.all(deleteQueries);
    console.log('✅ Data wiped successfully');

    // Create 20 manga series from templates
    console.log('📚 Creating 20 manga series...');
    const mangaData = MANGA_TEMPLATES.map((template, index) => ({
      id: crypto.randomUUID(),
      title: template.title,
      author: template.author,
      artist: template.artist,
      description: template.description,
      genres: template.genres,
      tags: template.tags,
      status: template.status,
      content_type: 'manga',
      cover_image_url: `https://picsum.photos/seed/manga-${index + 1}/400/600`,
      thumbnail_url: `https://picsum.photos/seed/manga-${index + 1}/200/300`,
      publication_date: getRandomDate(),
      language: 'en',
      age_rating: getRandomAgeRating(),
      view_count: Math.floor(Math.random() * 50000),
      rating_average: Number((Math.random() * 3 + 2).toFixed(1)),
      rating_count: Math.floor(Math.random() * 1000) + 50
    }));

    // Create 10 novel series from templates  
    console.log('📖 Creating 10 novel series...');
    const novelData = NOVEL_TEMPLATES.map((template, index) => ({
      id: crypto.randomUUID(),
      title: template.title,
      author: template.author,
      description: template.description,
      genres: template.genres,
      tags: template.tags,
      status: template.status,
      content_type: 'novel',
      cover_image_url: `https://picsum.photos/seed/novel-${index + 1}/400/600`,
      thumbnail_url: `https://picsum.photos/seed/novel-${index + 1}/200/300`,
      publication_date: getRandomDate(),
      language: 'en',
      age_rating: getRandomAgeRating(),
      view_count: Math.floor(Math.random() * 30000),
      rating_average: Number((Math.random() * 3 + 2).toFixed(1)),
      rating_count: Math.floor(Math.random() * 500) + 20
    }));

    // Insert all series
    const allSeriesData = [...mangaData, ...novelData];
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(allSeriesData);

    if (seriesError) throw seriesError;
    console.log('✅ Series created successfully');

    // Create chapters for each series
    console.log('📝 Creating chapters...');
    let totalChapters = 0;
    
    for (const series of allSeriesData) {
      const chapterCount = Math.floor(Math.random() * 81) + 20; // 20-100 chapters
      const chapters = [];
      const chapterPrices = [];
      
      for (let chapterNum = 1; chapterNum <= chapterCount; chapterNum++) {
        const chapterId = crypto.randomUUID();
        const isLocked = chapterNum % 3 === 0; // Every 3rd chapter is locked
        const coinCost = isLocked ? Math.floor(Math.random() * 21) + 5 : 0; // 5-25 coins
        
        const pages = series.content_type === 'manga' 
          ? generateMangaPages(chapterNum, series.id)
          : generateNovelContent(chapterNum);
        
        const chapter = {
          id: chapterId,
          series_id: series.id,
          chapter_number: chapterNum,
          title: `Chapter ${chapterNum}: ${generateChapterTitle()}`,
          pages,
          page_count: series.content_type === 'manga' ? pages.length : 1,
          is_locked: isLocked,
          thumbnail_url: series.content_type === 'manga' 
            ? `https://picsum.photos/seed/ch-${series.id}-${chapterNum}/300/200`
            : null,
          release_date: getRandomReleaseDate(series.publication_date, chapterNum, chapterCount),
          view_count: Math.floor(Math.random() * 5000),
          sort_order: chapterNum
        };
        
        chapters.push(chapter);
        
        if (isLocked) {
          chapterPrices.push({
            id: crypto.randomUUID(),
            chapter_id: chapterId,
            coin_cost: coinCost,
            premium_only: Math.random() > 0.8 // 20% premium only
          });
        }
      }
      
      // Insert chapters in batches
      const batchSize = 50;
      for (let i = 0; i < chapters.length; i += batchSize) {
        const batch = chapters.slice(i, i + batchSize);
        const { error: chapterError } = await supabase
          .from('chapters')
          .insert(batch);
        if (chapterError) throw chapterError;
      }
      
      // Insert chapter prices
      if (chapterPrices.length > 0) {
        const { error: priceError } = await supabase
          .from('chapter_prices')
          .insert(chapterPrices);
        if (priceError) throw priceError;
      }
      
      totalChapters += chapters.length;
    }

    // Generate view data for trending
    console.log('👀 Generating view data...');
    const viewData = [];
    const allSeriesIds = allSeriesData.map(s => s.id);
    
    for (let i = 0; i < 500; i++) {
      const seriesId = allSeriesIds[Math.floor(Math.random() * allSeriesIds.length)];
      viewData.push({
        id: crypto.randomUUID(),
        series_id: seriesId,
        user_id: Math.random() > 0.5 ? crypto.randomUUID() : null,
        ip_address: generateRandomIP(),
        user_agent: 'Mozilla/5.0 (compatible)',
        created_at: getRandomRecentDate()
      });
    }
    
    const { error: viewError } = await supabase
      .from('series_views')
      .insert(viewData);
    if (viewError) throw viewError;

    console.log('✅ Phase 6 cleanup completed successfully!');
    
    return {
      success: true,
      mangaCount: mangaData.length,
      novelCount: novelData.length,
      chapterCount: totalChapters,
      viewCount: viewData.length
    };
    
  } catch (error) {
    console.error('❌ Phase 6 cleanup failed:', error);
    throw error;
  }
};

// Make available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).runPhase6Cleanup = runPhase6Cleanup;
}
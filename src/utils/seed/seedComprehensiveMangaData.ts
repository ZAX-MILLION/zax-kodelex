import { supabase } from '@/integrations/supabase/client';

interface MangaSeries {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  cover_image_url: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  genres: string[];
  tags: string[];
  rating_average: number;
  rating_count: number;
  view_count: number;
  age_rating: string;
  publication_date: string;
}

interface Chapter {
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
  thumbnail_url: string;
  sort_order: number;
  content_type: 'image' | 'text';
  text_content?: string;
}

const mangaSeriesData: MangaSeries[] = [
  {
    id: 'crimson-blade-saga',
    title: 'Crimson Blade Saga',
    description: 'In a world where ancient magic clashes with modern technology, young warrior Akira must master the legendary Crimson Blade to save his homeland from an otherworldly invasion. With stunning action sequences and deep character development, this epic saga will keep you on the edge of your seat.',
    author: 'Takeshi Yamamoto',
    artist: 'Yuki Nakamura',
    cover_image_url: '/src/assets/manga-covers/crimson-blade-cover.jpg',
    status: 'ongoing',
    genres: ['Action', 'Fantasy', 'Supernatural'],
    tags: ['Sword Fighting', 'Magic', 'Demons', 'Coming of Age'],
    rating_average: 4.8,
    rating_count: 2547,
    view_count: 125430,
    age_rating: 'T',
    publication_date: '2023-01-15'
  },
  {
    id: 'dragons-legacy',
    title: "Dragon's Legacy",
    description: 'When the last dragon egg is discovered in the ruins of an ancient civilization, a young archaeologist finds herself thrust into a world of political intrigue and magical warfare. Can she protect the dragon and uncover the truth about her own mysterious heritage?',
    author: 'Miyuki Sato',
    artist: 'Hiroshi Tanaka',
    cover_image_url: '/src/assets/manga-covers/dragons-legacy-cover.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    tags: ['Dragons', 'Magic', 'Politics', 'Mystery'],
    rating_average: 4.6,
    rating_count: 1832,
    view_count: 89650,
    age_rating: 'T',
    publication_date: '2023-03-22'
  },
  {
    id: 'mystic-academy',
    title: 'Mystic Academy Chronicles',
    description: 'At the prestigious Mystic Academy, students learn to harness their magical abilities while navigating teenage drama, dangerous rivalries, and an ancient prophecy that threatens to destroy everything they hold dear. Romance, friendship, and epic battles await!',
    author: 'Sakura Kimura',
    artist: 'Ren Matsui',
    cover_image_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
    status: 'ongoing',
    genres: ['Romance', 'Fantasy', 'School Life'],
    tags: ['Magic', 'School', 'Romance', 'Friendship'],
    rating_average: 4.7,
    rating_count: 3241,
    view_count: 156780,
    age_rating: 'T',
    publication_date: '2022-11-08'
  },
  {
    id: 'shadow-ninja-academy',
    title: 'Shadow Ninja Academy',
    description: 'In the hidden village of shadows, elite ninja students train in the ancient arts of stealth, combat, and forbidden jutsu. When a dark conspiracy threatens to tear apart their world, these young warriors must unite to protect everything they believe in.',
    author: 'Kenji Ishida',
    artist: 'Akira Watanabe',
    cover_image_url: '/src/assets/manga-covers/shadow-ninja-academy.jpg',
    status: 'completed',
    genres: ['Action', 'Martial Arts', 'Adventure'],
    tags: ['Ninja', 'Training', 'Brotherhood', 'Conspiracy'],
    rating_average: 4.9,
    rating_count: 4156,
    view_count: 287540,
    age_rating: 'T',
    publication_date: '2021-05-12'
  },
  {
    id: 'cyberpunk-detective',
    title: 'Cyberpunk Detective',
    description: 'In the neon-lit streets of Neo Tokyo 2087, detective Jin Nakamura uses advanced cybernetic enhancements to solve crimes that blur the line between human and machine. A gripping sci-fi thriller exploring themes of identity and consciousness.',
    author: 'Ryo Hashimoto',
    artist: 'Mei Yoshida',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Mystery', 'Thriller'],
    tags: ['Cyberpunk', 'Detective', 'Future', 'Technology'],
    rating_average: 4.5,
    rating_count: 1967,
    view_count: 73290,
    age_rating: 'M',
    publication_date: '2023-06-03'
  },
  {
    id: 'cherry-blossom-romance',
    title: 'Cherry Blossom Romance',
    description: 'A heartwarming tale of first love set against the beautiful backdrop of springtime Japan. When shy bookworm Yuki meets the popular but mysterious transfer student Haruto, their lives become intertwined in ways neither could have imagined.',
    author: 'Yui Nakamura',
    artist: 'Saki Hayashi',
    cover_image_url: '/src/assets/manga-covers/cherry-blossom-romance.jpg',
    status: 'completed',
    genres: ['Romance', 'Slice of Life', 'Drama'],
    tags: ['First Love', 'School', 'Drama', 'Seasonal'],
    rating_average: 4.4,
    rating_count: 2834,
    view_count: 142680,
    age_rating: 'T',
    publication_date: '2022-04-01'
  }
];

const generateChapterData = (seriesId: string, seriesTitle: string, totalChapters: number): Chapter[] => {
  const chapters: Chapter[] = [];
  
  for (let i = 1; i <= totalChapters; i++) {
    const chapterId = `${seriesId}-ch${i.toString().padStart(3, '0')}`;
    
    // Generate different page counts and content types
    const isTextChapter = i % 7 === 0; // Every 7th chapter is text-based
    const pageCount = isTextChapter ? 1 : Math.floor(Math.random() * 8) + 12; // 12-20 pages for image chapters
    
    let pages: string[] = [];
    let textContent: string | undefined;
    
    if (isTextChapter) {
      // Text-based chapter (light novel style)
      textContent = `Chapter ${i}: ${getChapterTitle(i)}\n\n${generateSampleText(seriesTitle, i)}`;
      pages = ['text-content']; // Placeholder for text content
    } else {
      // Image-based chapter
      pages = Array.from({ length: pageCount }, (_, pageIndex) => {
        // Use existing assets for first few pages, then generate placeholder URLs
        if (seriesId === 'crimson-blade-saga' && i === 1 && pageIndex < 5) {
          return `/src/assets/manga-pages/crimson-blade-ch1-p${pageIndex + 1}.jpg`;
        }
        if (seriesId === 'dragons-legacy' && i === 1 && pageIndex === 0) {
          return `/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg`;
        }
        if (seriesId === 'mystic-academy' && i === 1 && pageIndex === 0) {
          return `/src/assets/manga-pages/mystic-academy-ch1-p1.jpg`;
        }
        
        // Generate placeholder URLs for other pages
        return `https://images.unsplash.com/photo-${1500000000000 + (i * 1000) + pageIndex}?w=800&h=1200&fit=crop&auto=format`;
      });
    }
    
    chapters.push({
      id: chapterId,
      series_id: seriesId,
      chapter_number: i,
      title: getChapterTitle(i),
      pages,
      page_count: pageCount,
      release_date: new Date(Date.now() - (totalChapters - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      view_count: Math.floor(Math.random() * 10000) + 1000,
      is_locked: i > 3 && Math.random() > 0.7, // Some chapters locked
      unlock_cost: i > 3 ? Math.floor(Math.random() * 20) + 5 : 0,
      thumbnail_url: pages[0] || '/placeholder.svg',
      sort_order: i,
      content_type: isTextChapter ? 'text' : 'image',
      text_content: textContent
    });
  }
  
  return chapters;
};

const getChapterTitle = (chapterNumber: number): string => {
  const titles = [
    'The Beginning of Everything',
    'First Steps into Darkness',
    'Awakening Powers',
    'The Mentor Appears',
    'Training Begins',
    'First Real Battle',
    'Hidden Truths Revealed',
    'The Dark Past Unveiled',
    'Allies and Enemies',
    'Point of No Return',
    'The Ultimate Test',
    'Bonds of Friendship',
    'Betrayal and Loss',
    'Rising from Ashes',
    'The Final Confrontation',
    'New Horizons'
  ];
  
  if (chapterNumber <= titles.length) {
    return titles[chapterNumber - 1];
  }
  
  return `Chapter ${chapterNumber}`;
};

const generateSampleText = (seriesTitle: string, chapterNumber: number): string => {
  return `The morning sun cast long shadows across the training grounds as our protagonist contemplated the events that had led to this moment. The weight of responsibility pressed down like a heavy cloak, yet determination burned bright in their eyes.

"This is just the beginning," they whispered to themselves, fingers tightening around the hilt of their weapon. The journey ahead would be fraught with challenges, but every great story starts with a single step into the unknown.

In the distance, the sound of approaching footsteps echoed across the courtyard. Friend or foe? Only time would tell. The adventure of ${seriesTitle} continues...

[This is a sample text chapter showcasing the light novel reading experience. In a real implementation, this would contain the full chapter content with proper formatting, dialogue, and narrative elements.]

--- End of Chapter ${chapterNumber} ---`;
};

export const seedComprehensiveMangaData = async () => {
  try {
    console.log('🌱 Starting comprehensive manga data seeding...');

    // Check if data already exists
    const { data: existingSeries } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      console.log('📚 Manga data already exists, skipping seeding...');
      return { success: true, message: 'Data already exists' };
    }

    // Insert manga series
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(mangaSeriesData);

    if (seriesError) {
      console.error('❌ Error inserting manga series:', seriesError);
      throw seriesError;
    }

    console.log(`📚 Created ${mangaSeriesData.length} manga series`);

    // Generate and insert chapters for each series
    let totalChapters = 0;
    
    for (const series of mangaSeriesData) {
      const chapterCount = series.status === 'completed' ? 
        Math.floor(Math.random() * 10) + 15 : // Completed: 15-24 chapters
        Math.floor(Math.random() * 8) + 5;   // Ongoing: 5-12 chapters
      
      const chapters = generateChapterData(series.id, series.title, chapterCount);
      
      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters);

      if (chaptersError) {
        console.error(`❌ Error inserting chapters for ${series.title}:`, chaptersError);
        continue;
      }

      totalChapters += chapters.length;
      console.log(`📖 Created ${chapters.length} chapters for "${series.title}"`);
    }

    // Create some series views for trending calculation
    const viewsData = [];
    for (const series of mangaSeriesData) {
      const viewCount = Math.floor(Math.random() * 100) + 50;
      for (let i = 0; i < viewCount; i++) {
        viewsData.push({
          series_id: series.id,
          user_id: null,
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`,
          user_agent: 'Mozilla/5.0 (compatible; SeedBot/1.0)',
          referrer: 'https://example.com',
          created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
        });
      }
    }

    const { error: viewsError } = await supabase
      .from('series_views')
      .insert(viewsData);

    if (viewsError) {
      console.warn('⚠️ Warning: Could not insert series views:', viewsError);
    } else {
      console.log(`👀 Created ${viewsData.length} series views`);
    }

    console.log('🎉 Comprehensive manga data seeding completed successfully!');
    console.log(`📊 Total: ${mangaSeriesData.length} series, ${totalChapters} chapters, ${viewsData.length} views`);
    
    return { 
      success: true, 
      message: `Created ${mangaSeriesData.length} series with ${totalChapters} chapters` 
    };

  } catch (error) {
    console.error('❌ Error seeding comprehensive manga data:', error);
    return { success: false, error };
  }
};
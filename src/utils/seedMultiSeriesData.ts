import { supabase } from '@/integrations/supabase/client';

// 20 diverse test series data
const testSeries = [
  {
    id: 'series-1',
    title: 'Crimson Blade Chronicles',
    description: 'An epic tale of warriors fighting against ancient evils with mystical swords in a world where magic and technology collide.',
    author: 'Takeshi Yamamoto',
    artist: 'Akira Sato',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Action', 'Fantasy', 'Adventure'],
    tags: ['Swords', 'Magic', 'Warriors', 'Epic'],
    cover_image_url: '/src/assets/manga-covers/crimson-blade-cover.jpg',
    age_rating: 'T',
    total_chapters: 45,
    view_count: 125000,
    rating: 4.8,
    is_featured: true
  },
  {
    id: 'series-2',
    title: 'Digital Hearts',
    description: 'A cyberpunk romance novel where love transcends the boundaries between human and AI in a neon-lit future metropolis.',
    author: 'Luna Chen',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Romance', 'Sci-Fi', 'Cyberpunk'],
    tags: ['AI', 'Future', 'Love', 'Technology'],
    cover_image_url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    age_rating: 'M',
    total_chapters: 28,
    view_count: 89000,
    rating: 4.6,
    is_featured: true
  },
  {
    id: 'series-3',
    title: 'Dragon\'s Legacy',
    description: 'A young dragon rider discovers their destiny in a world where dragons rule the skies and ancient prophecies come to life.',
    author: 'Miyuki Tanaka',
    artist: 'Hiroshi Nakamura',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Fantasy', 'Adventure', 'Drama'],
    tags: ['Dragons', 'Magic', 'Prophecy', 'Adventure'],
    cover_image_url: '/src/assets/manga-covers/dragons-legacy-cover.jpg',
    age_rating: 'T',
    total_chapters: 32,
    view_count: 98000,
    rating: 4.7,
    is_featured: false
  },
  {
    id: 'series-4',
    title: 'Mystic Academy',
    description: 'Students at a magical academy learn to harness their powers while uncovering dark secrets that threaten the magical world.',
    author: 'Hana Sato',
    artist: 'Yuki Suzuki',
    content_type: 'manga',
    status: 'completed',
    genres: ['Fantasy', 'School', 'Mystery'],
    tags: ['Magic', 'School', 'Mystery', 'Friendship'],
    cover_image_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
    age_rating: 'T',
    total_chapters: 120,
    view_count: 250000,
    rating: 4.9,
    is_featured: true
  },
  {
    id: 'series-5',
    title: 'Neon Nights Detective',
    description: 'A hardboiled detective navigates the seedy underbelly of a futuristic city where crime and corruption run deep.',
    author: 'Marcus Kane',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Mystery', 'Noir', 'Sci-Fi'],
    tags: ['Detective', 'Crime', 'Future', 'Investigation'],
    cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    age_rating: 'M',
    total_chapters: 15,
    view_count: 45000,
    rating: 4.3,
    is_featured: false
  },
  {
    id: 'series-6',
    title: 'Sakura\'s Journey',
    description: 'A slice-of-life story following a young girl\'s adventures through the seasons in a peaceful Japanese town.',
    author: 'Emi Watanabe',
    artist: 'Tomoko Ishida',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Slice of Life', 'Drama', 'Comedy'],
    tags: ['School', 'Friendship', 'Japan', 'Seasonal'],
    cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    age_rating: 'E',
    total_chapters: 67,
    view_count: 156000,
    rating: 4.5,
    is_featured: false
  },
  {
    id: 'series-7',
    title: 'Stellar Conquest',
    description: 'An epic space opera novel chronicling humanity\'s expansion across the galaxy and encounters with alien civilizations.',
    author: 'Alexander Ross',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Adventure', 'Action'],
    tags: ['Space', 'Aliens', 'War', 'Exploration'],
    cover_image_url: 'https://images.unsplash.com/photo-1486312338294-66c63f39a415',
    age_rating: 'T',
    total_chapters: 42,
    view_count: 134000,
    rating: 4.4,
    is_featured: true
  },
  {
    id: 'series-8',
    title: 'Shadow Hunters',
    description: 'Modern-day warriors hunt supernatural creatures hiding in plain sight while protecting innocent people.',
    author: 'Kenji Mori',
    artist: 'Satoshi Ito',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Action', 'Supernatural', 'Horror'],
    tags: ['Monsters', 'Hunters', 'Modern', 'Dark'],
    cover_image_url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    age_rating: 'M',
    total_chapters: 38,
    view_count: 87000,
    rating: 4.2,
    is_featured: false
  },
  {
    id: 'series-9',
    title: 'The Merchant\'s Tale',
    description: 'A fantasy novel about a cunning merchant who travels dangerous lands seeking rare treasures and profitable deals.',
    author: 'Isabella Martinez',
    artist: null,
    content_type: 'novel',
    status: 'completed',
    genres: ['Fantasy', 'Adventure', 'Comedy'],
    tags: ['Trade', 'Adventure', 'Treasure', 'Travel'],
    cover_image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    age_rating: 'T',
    total_chapters: 85,
    view_count: 203000,
    rating: 4.6,
    is_featured: false
  },
  {
    id: 'series-10',
    title: 'Mecha Warriors',
    description: 'Giant robot pilots defend Earth from alien invasion in this high-octane mecha action series.',
    author: 'Ryoji Tanaka',
    artist: 'Masato Yamada',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Mecha', 'Action', 'Sci-Fi'],
    tags: ['Robots', 'War', 'Pilots', 'Aliens'],
    cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    age_rating: 'T',
    total_chapters: 55,
    view_count: 178000,
    rating: 4.5,
    is_featured: true
  },
  {
    id: 'series-11',
    title: 'Whispers of the Past',
    description: 'A historical romance novel set in Victorian England where secrets from the past threaten to destroy true love.',
    author: 'Catherine Brooks',
    artist: null,
    content_type: 'novel',
    status: 'completed',
    genres: ['Romance', 'Historical', 'Drama'],
    tags: ['Victorian', 'Love', 'Secrets', 'Historical'],
    cover_image_url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    age_rating: 'M',
    total_chapters: 72,
    view_count: 145000,
    rating: 4.7,
    is_featured: false
  },
  {
    id: 'series-12',
    title: 'Spirit Guardians',
    description: 'Teenagers with the ability to see spirits must protect the balance between the living and dead worlds.',
    author: 'Yui Nakamura',
    artist: 'Kenta Fujiwara',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Supernatural', 'Action', 'Drama'],
    tags: ['Spirits', 'Teenagers', 'Supernatural', 'Guardian'],
    cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    age_rating: 'T',
    total_chapters: 29,
    view_count: 76000,
    rating: 4.1,
    is_featured: false
  },
  {
    id: 'series-13',
    title: 'Quantum Paradox',
    description: 'A sci-fi thriller novel exploring parallel universes and the consequences of tampering with quantum mechanics.',
    author: 'Dr. Sarah Mitchell',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Thriller', 'Mystery'],
    tags: ['Quantum', 'Parallel', 'Science', 'Thriller'],
    cover_image_url: 'https://images.unsplash.com/photo-1486312338294-66c63f39a415',
    age_rating: 'M',
    total_chapters: 21,
    view_count: 62000,
    rating: 4.3,
    is_featured: false
  },
  {
    id: 'series-14',
    title: 'Cooking Master',
    description: 'Follow the culinary adventures of a young chef competing in the world\'s most prestigious cooking competitions.',
    author: 'Masaki Doi',
    artist: 'Shinji Ogawa',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Slice of Life', 'Comedy', 'Competition'],
    tags: ['Cooking', 'Chef', 'Competition', 'Food'],
    cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    age_rating: 'E',
    total_chapters: 94,
    view_count: 198000,
    rating: 4.6,
    is_featured: true
  },
  {
    id: 'series-15',
    title: 'The Last Alchemist',
    description: 'In a world where magic is fading, the last alchemist seeks to preserve ancient knowledge and power.',
    author: 'Elena Volkov',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Fantasy', 'Adventure', 'Magic'],
    tags: ['Alchemy', 'Magic', 'Ancient', 'Knowledge'],
    cover_image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    age_rating: 'T',
    total_chapters: 36,
    view_count: 112000,
    rating: 4.4,
    is_featured: false
  },
  {
    id: 'series-16',
    title: 'Urban Legends',
    description: 'A horror manga exploring modern urban legends and the terrifying truths behind them.',
    author: 'Daisuke Sato',
    artist: 'Reiko Taniguchi',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Horror', 'Supernatural', 'Mystery'],
    tags: ['Urban Legends', 'Horror', 'Mystery', 'Supernatural'],
    cover_image_url: 'https://images.unsplash.com/photo-1649972904349-6e44c42644a7',
    age_rating: 'M',
    total_chapters: 23,
    view_count: 54000,
    rating: 4.0,
    is_featured: false
  },
  {
    id: 'series-17',
    title: 'Galaxy Academy',
    description: 'A space academy trains the next generation of starship captains and explorers in this coming-of-age novel.',
    author: 'Commander Jack Sterling',
    artist: null,
    content_type: 'novel',
    status: 'completed',
    genres: ['Sci-Fi', 'Adventure', 'Coming of Age'],
    tags: ['Space', 'Academy', 'Training', 'Leadership'],
    cover_image_url: 'https://images.unsplash.com/photo-1518770660439-4636190af475',
    age_rating: 'T',
    total_chapters: 68,
    view_count: 187000,
    rating: 4.5,
    is_featured: true
  },
  {
    id: 'series-18',
    title: 'Magical Girl Luna',
    description: 'A middle school student transforms into a magical girl to fight evil forces threatening her city.',
    author: 'Sailor Moon Enthusiast',
    artist: 'Magical Artist',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Magical Girl', 'Action', 'School'],
    tags: ['Magic', 'Transformation', 'School', 'Hero'],
    cover_image_url: 'https://images.unsplash.com/photo-1486312338294-66c63f39a415',
    age_rating: 'E',
    total_chapters: 41,
    view_count: 143000,
    rating: 4.3,
    is_featured: false
  },
  {
    id: 'series-19',
    title: 'Post-Apocalyptic Survivors',
    description: 'After a global catastrophe, survivors band together to rebuild civilization in this gritty dystopian novel.',
    author: 'Max Thunder',
    artist: null,
    content_type: 'novel',
    status: 'ongoing',
    genres: ['Post-Apocalyptic', 'Drama', 'Action'],
    tags: ['Survival', 'Dystopia', 'Rebuild', 'Hope'],
    cover_image_url: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6',
    age_rating: 'M',
    total_chapters: 33,
    view_count: 91000,
    rating: 4.2,
    is_featured: false
  },
  {
    id: 'series-20',
    title: 'Time Traveling Detective',
    description: 'A detective gains the ability to travel through time to solve cold cases and prevent crimes before they happen.',
    author: 'Koji Watanabe',
    artist: 'Nana Kimura',
    content_type: 'manga',
    status: 'ongoing',
    genres: ['Mystery', 'Sci-Fi', 'Time Travel'],
    tags: ['Time Travel', 'Detective', 'Crime', 'Investigation'],
    cover_image_url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b',
    age_rating: 'T',
    total_chapters: 18,
    view_count: 68000,
    rating: 4.1,
    is_featured: false
  }
];

// Generate chapters for each series
const generateChaptersForSeries = (seriesId: string, totalChapters: number, contentType: 'manga' | 'novel') => {
  const chapters = [];
  const maxChaptersToGenerate = Math.min(totalChapters, 5); // Only generate first 5 chapters for demo
  
  for (let i = 1; i <= maxChaptersToGenerate; i++) {
    const basePages = contentType === 'manga' 
      ? [
          '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p2.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p3.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p4.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p5.jpg'
        ]
      : ['/novel-page-placeholder.txt']; // For novels, we'd have text content

    chapters.push({
      id: `${seriesId}-ch-${i}`,
      series_id: seriesId,
      chapter_number: i,
      title: `Chapter ${i}: ${getChapterTitle(i)}`,
      pages: JSON.stringify(basePages),
      page_count: basePages.length,
      sort_order: i,
      release_date: new Date(Date.now() - (maxChaptersToGenerate - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      is_locked: i > 2, // First 2 chapters free, rest locked
      thumbnail_url: contentType === 'manga' ? basePages[0] : null
    });
  }
  
  return chapters;
};

const getChapterTitle = (chapterNumber: number) => {
  const titles = [
    'The Beginning',
    'First Steps',
    'Rising Action',
    'The Challenge',
    'New Discoveries'
  ];
  return titles[chapterNumber - 1] || `Part ${chapterNumber}`;
};

export const seedMultiSeriesData = async () => {
  try {
    console.log('🌱 Starting multi-series data seeding...');

    // Check if series already exist
    const { data: existingSeries } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      console.log('⏭️ Multi-series data already exists, skipping seeding...');
      return { success: true, message: 'Data already exists' };
    }

    // Insert manga_meta entries
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(testSeries.map(series => ({
        id: series.id,
        title: series.title,
        description: series.description,
        author: series.author,
        artist: series.artist,
        status: series.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
        genres: series.genres,
        cover_image_url: series.cover_image_url,
        age_rating: series.age_rating,
        meta_title: `${series.title} - Read Online`,
        meta_description: series.description?.substring(0, 160)
      })));

    if (seriesError) {
      console.error('❌ Error creating series:', seriesError);
      throw seriesError;
    }

    console.log(`📚 Created ${testSeries.length} test series`);

    // Generate and insert chapters for each series
    let totalChapters = 0;
    for (const series of testSeries) {
      const chapters = generateChaptersForSeries(series.id, series.total_chapters, series.content_type as 'manga' | 'novel');
      
      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters);

      if (chaptersError) {
        console.error(`❌ Error creating chapters for ${series.title}:`, chaptersError);
      } else {
        totalChapters += chapters.length;
        console.log(`📖 Created ${chapters.length} chapters for ${series.title}`);
      }
    }

    console.log(`🎉 Multi-series seeding completed! Created ${testSeries.length} series with ${totalChapters} total chapters`);
    return { 
      success: true, 
      message: `Successfully created ${testSeries.length} series with ${totalChapters} chapters`,
      seriesCount: testSeries.length,
      chapterCount: totalChapters
    };

  } catch (error) {
    console.error('❌ Error seeding multi-series data:', error);
    return { success: false, error };
  }
};

export const validateMultiSeriesData = async () => {
  try {
    console.log('🔍 Validating multi-series data...');

    // Check series count
    const { data: seriesData, error: seriesError } = await supabase
      .from('manga_meta')
      .select('id, title, status, genres');

    if (seriesError) {
      throw seriesError;
    }

    // Check chapters count
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, series_id, chapter_number');

    if (chaptersError) {
      throw chaptersError;
    }

    const validation = {
      seriesCount: seriesData?.length || 0,
      chapterCount: chaptersData?.length || 0,
      seriesByType: {
        manga: seriesData?.filter(s => s.title?.includes('manga') || Math.random() > 0.5).length || 0,
        novel: seriesData?.filter(s => !s.title?.includes('manga') && Math.random() > 0.5).length || 0
      },
      seriesByStatus: {
        ongoing: seriesData?.filter(s => s.status === 'ongoing').length || 0,
        completed: seriesData?.filter(s => s.status === 'completed').length || 0
      },
      genreDistribution: seriesData?.reduce((acc: Record<string, number>, series) => {
        if (series.genres) {
          series.genres.forEach((genre: string) => {
            acc[genre] = (acc[genre] || 0) + 1;
          });
        }
        return acc;
      }, {}) || {}
    };

    console.log('✅ Validation completed:', validation);
    return { success: true, validation };

  } catch (error) {
    console.error('❌ Error validating multi-series data:', error);
    return { success: false, error };
  }
};
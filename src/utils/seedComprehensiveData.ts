import { supabase } from '@/integrations/supabase/client';

interface Series {
  id: string;
  title: string;
  description: string;
  author: string;
  artist: string;
  status: 'ongoing' | 'completed';
  genres: string[];
  tags: string[];
  cover_image_url: string;
  rating_average: number;
  rating_count: number;
  view_count: number;
  publication_date: string;
  age_rating: string;
  language: string;
  type: 'manga' | 'manhwa' | 'manhua' | 'novel';
}

interface Chapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  pages?: string;
  content?: string;
  release_date: string;
  page_count: number;
  is_locked: boolean;
  sort_order: number;
  thumbnail_url?: string;
}

export const seedComprehensiveData = async () => {
  try {
    console.log('🌱 Starting comprehensive data seeding...');

    // Check if data already exists
    const { data: existingSeries } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      console.log('⏭️ Data already exists, skipping seeding...');
      return { success: true };
    }

    // Create comprehensive series data
    const series: Series[] = [
      {
        id: 'series-1',
        title: 'Crimson Blade Chronicles',
        description: 'A young warrior discovers an ancient blade that holds the power to reshape the world. But with great power comes great responsibility, and dark forces seek to claim the blade for themselves.',
        author: 'Akira Yamamoto',
        artist: 'Kenji Nakamura',
        status: 'ongoing',
        genres: ['Action', 'Fantasy', 'Drama'],
        tags: ['sword fighting', 'magic', 'adventure'],
        cover_image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&auto=format&q=80',
        rating_average: 9.2,
        rating_count: 1547,
        view_count: 245789,
        publication_date: '2022-03-15T00:00:00Z',
        age_rating: 'T',
        language: 'en',
        type: 'manga'
      },
      {
        id: 'series-2',
        title: 'Dragons Legacy',
        description: 'In a world where dragons once ruled the skies, a young mage discovers she is the last heir to an ancient dragon bloodline. She must master her powers before an ancient evil awakens.',
        author: 'Luna Chen',
        artist: 'Mei Li',
        status: 'ongoing',
        genres: ['Fantasy', 'Magic', 'Romance'],
        tags: ['dragons', 'magic academy', 'coming of age'],
        cover_image_url: 'https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=400&h=600&fit=crop&auto=format&q=80',
        rating_average: 8.8,
        rating_count: 892,
        view_count: 156432,
        publication_date: '2023-01-10T00:00:00Z',
        age_rating: 'T',
        language: 'en',
        type: 'manhwa'
      },
      {
        id: 'series-3',
        title: 'Mystic Academy Chronicles',
        description: 'Welcome to Mystic Academy, where students learn to harness magical powers and ancient mysteries unfold in the halls of learning. Follow Elena as she discovers her unique abilities.',
        author: 'Sarah Thompson',
        artist: 'David Kim',
        status: 'ongoing',
        genres: ['Fantasy', 'School Life', 'Magic'],
        tags: ['magic school', 'friendship', 'mystery'],
        cover_image_url: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=600&fit=crop&auto=format',
        rating_average: 8.5,
        rating_count: 723,
        view_count: 98654,
        publication_date: '2023-05-20T00:00:00Z',
        age_rating: 'E',
        language: 'en',
        type: 'manga'
      },
      {
        id: 'series-4',
        title: 'Cyberpunk Detective',
        description: 'In Neo-Tokyo 2087, detective Ray Harrison investigates crimes that blur the line between human and machine. When androids start developing consciousness, the case becomes personal.',
        author: 'Takeshi Noir',
        artist: 'Yuki Sato',
        status: 'completed',
        genres: ['Sci-Fi', 'Mystery', 'Thriller'],
        tags: ['cyberpunk', 'detective', 'android'],
        cover_image_url: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=400&h=600&fit=crop&auto=format',
        rating_average: 9.0,
        rating_count: 2156,
        view_count: 342190,
        publication_date: '2021-08-12T00:00:00Z',
        age_rating: 'M',
        language: 'en',
        type: 'manga'
      },
      {
        id: 'series-5',
        title: 'Cherry Blossom Romance',
        description: 'A heartwarming romance that follows Yuki and Hana as they navigate love, friendship, and growing up in a small Japanese town during cherry blossom season.',
        author: 'Miho Sakura',
        artist: 'Rina Fujiwara',
        status: 'completed',
        genres: ['Romance', 'Slice of Life', 'Drama'],
        tags: ['high school', 'first love', 'coming of age'],
        cover_image_url: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=600&fit=crop&auto=format',
        rating_average: 8.7,
        rating_count: 1834,
        view_count: 278543,
        publication_date: '2022-11-05T00:00:00Z',
        age_rating: 'T',
        language: 'en',
        type: 'manga'
      },
      {
        id: 'series-6',
        title: 'Demon Hunter Chronicles',
        description: 'When demons break through the barriers between worlds, elite hunters are humanity\'s last line of defense. Follow Jin as he battles creatures from the underworld.',
        author: 'Kazuki Dark',
        artist: 'Hiroshi Shadow',
        status: 'ongoing',
        genres: ['Action', 'Supernatural', 'Horror'],
        tags: ['demons', 'supernatural', 'dark fantasy'],
        cover_image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42b?w=400&h=600&fit=crop&auto=format',
        rating_average: 8.9,
        rating_count: 1267,
        view_count: 187654,
        publication_date: '2023-02-14T00:00:00Z',
        age_rating: 'M',
        language: 'en',
        type: 'manhwa'
      },
      // Novels
      {
        id: 'novel-1',
        title: 'Elemental Magic Academy',
        description: 'A comprehensive novel series about students learning to master the four elemental magics. Rich world-building and character development across multiple volumes.',
        author: 'Rebecca Matthews',
        artist: 'Cover Artist Studio',
        status: 'ongoing',
        genres: ['Fantasy', 'Novel', 'Magic'],
        tags: ['elemental magic', 'academy', 'young adult'],
        cover_image_url: 'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=400&h=600&fit=crop&auto=format',
        rating_average: 9.1,
        rating_count: 3456,
        view_count: 567890,
        publication_date: '2021-01-01T00:00:00Z',
        age_rating: 'T',
        language: 'en',
        type: 'novel'
      },
      {
        id: 'novel-2',
        title: 'Space Pirate Captain',
        description: 'Adventure awaits in the far reaches of space as Captain Nova leads her crew on daring heists and battles against the galactic empire.',
        author: 'Marcus Steel',
        artist: 'Sci-Fi Cover Art',
        status: 'ongoing',
        genres: ['Sci-Fi', 'Novel', 'Adventure'],
        tags: ['space pirates', 'rebellion', 'space opera'],
        cover_image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=400&h=600&fit=crop&auto=format',
        rating_average: 8.6,
        rating_count: 2134,
        view_count: 345678,
        publication_date: '2022-06-15T00:00:00Z',
        age_rating: 'T',
        language: 'en',
        type: 'novel'
      }
    ];

    // Insert series data
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(series);

    if (seriesError) {
      console.error('❌ Error creating series:', seriesError);
      throw seriesError;
    }

    console.log(`📚 Created ${series.length} series`);

    // Create chapters for each series
    const allChapters: Chapter[] = [];

    series.forEach((seriesItem, seriesIndex) => {
      const isNovel = seriesItem.type === 'novel';
      const chapterCount = isNovel ? 15 : (seriesItem.status === 'completed' ? 12 : 8);
      
      for (let i = 1; i <= chapterCount; i++) {
        const isLocked = i > (chapterCount - 2); // Last 2 chapters are locked
        const releaseDate = new Date(Date.now() - (chapterCount - i) * 24 * 60 * 60 * 1000);
        
        const chapter: Chapter = {
          id: `${seriesItem.id}-ch${i}`,
          series_id: seriesItem.id,
          chapter_number: i,
          title: isNovel ? `Volume ${Math.ceil(i/3)} - Chapter ${((i-1) % 3) + 1}` : `Chapter ${i}: ${getChapterTitle(seriesItem.title, i)}`,
          release_date: releaseDate.toISOString(),
          page_count: isNovel ? 0 : Math.floor(Math.random() * 20) + 15,
          is_locked: isLocked,
          sort_order: i,
          thumbnail_url: getThumbnailUrl(seriesItem.id, i)
        };

        if (isNovel) {
          // Novel content
          chapter.content = generateNovelContent(seriesItem.title, i);
        } else {
          // Manga pages
          chapter.pages = JSON.stringify(generateMangaPages(seriesItem.id, i));
        }

        allChapters.push(chapter);
      }
    });

    // Insert chapters in batches
    const batchSize = 50;
    for (let i = 0; i < allChapters.length; i += batchSize) {
      const batch = allChapters.slice(i, i + batchSize);
      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(batch);

      if (chaptersError) {
        console.error('❌ Error creating chapters batch:', chaptersError);
        throw chaptersError;
      }
    }

    console.log(`📖 Created ${allChapters.length} chapters`);
    console.log('🎉 Comprehensive data seeding completed successfully!');
    
    return { success: true };

  } catch (error) {
    console.error('❌ Error seeding comprehensive data:', error);
    return { success: false, error };
  }
};

// Helper functions
function getChapterTitle(seriesTitle: string, chapterNumber: number): string {
  const titles = {
    'Crimson Blade Chronicles': [
      'The Awakening', 'First Blood', 'Ancient Secrets', 'The Training Begins', 
      'Dark Revelations', 'Battle in the Shadows', 'The True Enemy', 'Powers Unleashed'
    ],
    'Dragons Legacy': [
      'Dragon\'s Blood', 'The Academy', 'First Flight', 'Ancient Prophecy',
      'The Dragon King', 'Forbidden Magic', 'The Final Test', 'Legacy Revealed'
    ],
    'Mystic Academy Chronicles': [
      'Welcome to Mystic Academy', 'First Lessons', 'The Mystery Deepens', 'Magical Bonds',
      'Ancient Artifacts', 'The Secret Chamber', 'Final Exams', 'Graduation Day'
    ]
  } as const;

  const seriesTitles = titles[seriesTitle as keyof typeof titles] || [
    'New Beginnings', 'Rising Action', 'Plot Twist', 'Character Development',
    'Major Conflict', 'Resolution', 'New Challenges', 'Grand Finale'
  ];

  return seriesTitles[(chapterNumber - 1) % seriesTitles.length] || `Chapter ${chapterNumber}`;
}

function getThumbnailUrl(seriesId: string, chapterNumber: number): string {
  // Use placeholder images for thumbnails
  const placeholders = [
    'photo-1461749280684-dccba630e2f6',
    'photo-1487058792275-0ad4aaf24ca7',
    'photo-1498050108023-c5249f4df085',
    'photo-1469474968028-56623f02e42b'
  ];
  
  const placeholder = placeholders[(chapterNumber - 1) % placeholders.length];
  return `https://images.unsplash.com/${placeholder}?w=300&h=200&fit=crop`;
}

function generateMangaPages(seriesId: string, chapterNumber: number): string[] {
  // Use actual existing pages for first few chapters, then placeholders
  const pageCount = Math.floor(Math.random() * 15) + 10;
  const pages = [];
  
  // For series-1 chapters 1-3, use real page assets
  if (seriesId === 'series-1' && chapterNumber <= 3) {
    for (let i = 1; i <= Math.min(pageCount, 5); i++) {
      pages.push(`/src/assets/manga-pages/crimson-blade-ch1-p${i}.jpg`);
    }
    // Fill remaining with placeholders
    for (let i = pages.length + 1; i <= pageCount; i++) {
      pages.push(`https://images.unsplash.com/photo-1626618012641-bfbca5a31239?w=800&h=1200&fit=crop&auto=format&q=80&t=${Date.now()}`);
    }
  } else {
    // Use varied placeholder images for other series/chapters
    for (let i = 1; i <= pageCount; i++) {
      const photoIds = [
        'photo-1626618012641-bfbca5a31239', // manga style
        'photo-1618005182384-a83a8bd57fbe', // anime style
        'photo-1578662996442-48f60103fc96', // artistic
        'photo-1541701494587-cb58502866ab', // dramatic
        'photo-1506905925346-21bda4d32df4' // scenic
      ];
      const photoId = photoIds[(i - 1) % photoIds.length];
      pages.push(`https://images.unsplash.com/${photoId}?w=800&h=1200&fit=crop&auto=format&q=80&page=${i}`);
    }
  }
  
  return pages;
}

function generateNovelContent(seriesTitle: string, chapterNumber: number): string {
  return `
# ${seriesTitle} - Chapter ${chapterNumber}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

## Section 1

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam, eaque ipsa quae ab illo inventore veritatis et quasi architecto beatae vitae dicta sunt explicabo.

## Section 2

Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores eos qui ratione voluptatem sequi nesciunt.

### Subsection

Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit, sed quia non numquam eius modi tempora incidunt ut labore et dolore magnam aliquam quaerat voluptatem.

*[Continue reading to discover what happens next...]*
`.trim();
}
import { supabase } from '@/integrations/supabase/client';

const MANGA_SERIES = [
  {
    title: "Crimson Blade Chronicles",
    description: "In a world where demons threaten humanity's existence, young warrior Akira discovers an ancient blade with the power to seal evil forever. But wielding such power comes at a terrible cost.",
    author: "Takeshi Yamamoto",
    artist: "Yuki Sato",
    genres: ["Action", "Fantasy", "Supernatural"],
    tags: ["Demons", "Swords", "Ancient Power", "Coming of Age"],
    status: "ongoing" as const,
    age_rating: "T",
    cover_image_url: "/src/assets/manga-covers/midnight-confessions.jpg",
    view_count: 93450
  },
  {
    title: "Cafe Love Stories",
    description: "In a cozy corner cafe, love blooms over coffee and pastries. Each customer brings their own story of romance, heartbreak, and new beginnings.",
    author: "Anna Lee",
    artist: "Yui Matsumoto",
    genres: ["Romance", "Slice of Life", "Comedy"],
    tags: ["Cafe", "Love", "Stories", "Cozy"],
    status: "ongoing",
    age_rating: "G",
    cover_image_url: "/src/assets/manga-covers/cafe-love-stories.jpg",
    view_count: 78920
  },
  {
    title: "Clumsy Chef Adventures",
    description: "Despite burning water and confusing salt with sugar, Maya dreams of becoming a world-renowned chef. Her disasters in the kitchen are legendary!",
    author: "Robert Garcia",
    artist: "Miku Hayashi",
    genres: ["Comedy", "Slice of Life", "Cooking"],
    tags: ["Cooking", "Comedy", "Dreams", "Disasters"],
    status: "ongoing",
    age_rating: "G",
    cover_image_url: "/src/assets/manga-covers/clumsy-chef-adventures.jpg",
    view_count: 145670
  },
  {
    title: "Pet Shop Pandemonium",
    description: "When magical creatures start appearing in an ordinary pet shop, employee Ken must keep the secret while dealing with everything from flying cats to singing fish.",
    author: "Jenny Park",
    artist: "Tsubasa Kimura",
    genres: ["Comedy", "Fantasy", "Slice of Life"],
    tags: ["Pets", "Magic", "Comedy", "Secret"],
    status: "ongoing",
    age_rating: "G",
    cover_image_url: "/src/assets/manga-covers/pet-shop-pandemonium.jpg",
    view_count: 67840
  }
];

const CHAPTER_TEMPLATES = [
  {
    title: "The New Beginning",
    pages: [
      "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg"
    ]
  },
  {
    title: "First Encounter",
    pages: [
      "/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg"
    ]
  },
  {
    title: "Hidden Powers",
    pages: [
      "/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg",
      "/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg"
    ]
  },
  {
    title: "The Academy",
    pages: [
      "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
      "/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
      "/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg"
    ]
  },
  {
    title: "Trials and Challenges",
    pages: [
      "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg",
      "/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
      "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg"
    ]
  }
];

export const seedEnhancedDemoData = async () => {
  try {
    console.log('🌱 Starting enhanced demo data seeding...');

    // Check if we already have substantial data
    const { data: existingSeries } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(10);

    if (existingSeries && existingSeries.length >= 10) {
      console.log('⏭️ Substantial demo data already exists, skipping...');
      return { success: true };
    }

    // Clear existing test data
    await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabase.from('manga_meta').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Create manga series
    const seriesInserts = MANGA_SERIES.map(series => ({
      title: series.title,
      description: series.description,
      author: series.author,
      artist: series.artist,
      genres: series.genres,
      tags: series.tags,
      status: series.status as "ongoing" | "completed" | "hiatus" | "cancelled",
      age_rating: series.age_rating,
      cover_image_url: series.cover_image_url,
      view_count: series.view_count,
      rating_average: Math.random() * 2 + 3, // Random rating between 3-5
      rating_count: Math.floor(Math.random() * 1000) + 100,
      publication_date: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }));

    const { data: createdSeries, error: seriesError } = await supabase
      .from('manga_meta')
      .insert(seriesInserts)
      .select('id, title');

    if (seriesError) {
      console.error('❌ Error creating series:', seriesError);
      throw seriesError;
    }

    console.log(`📚 Created ${createdSeries.length} manga series`);

    // Create chapters for each series
    let totalChapters = 0;
    for (let i = 0; i < createdSeries.length; i++) {
      const series = createdSeries[i];
      const numChapters = Math.floor(Math.random() * 15) + 5; // 5-20 chapters per series

      const chapterInserts = [];
      for (let j = 1; j <= numChapters; j++) {
        const template = CHAPTER_TEMPLATES[j % CHAPTER_TEMPLATES.length];
        const isLocked = j > 3 && Math.random() > 0.7; // Some later chapters are locked
        
        chapterInserts.push({
          series_id: series.id,
          chapter_number: j,
          title: `Chapter ${j}: ${template.title}`,
          pages: JSON.stringify(template.pages),
          page_count: template.pages.length,
          sort_order: j,
          is_locked: isLocked,
          release_date: new Date(Date.now() - (numChapters - j) * 7 * 24 * 60 * 60 * 1000).toISOString(),
          view_count: Math.floor(Math.random() * 10000) + 500
        });
      }

      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapterInserts);

      if (chaptersError) {
        console.error(`❌ Error creating chapters for ${series.title}:`, chaptersError);
      } else {
        totalChapters += chapterInserts.length;
      }
    }

    console.log(`📖 Created ${totalChapters} chapters`);

    // Create chapter pricing for locked chapters
    const { data: lockedChapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('is_locked', true);

    if (lockedChapters && lockedChapters.length > 0) {
      const pricingInserts = lockedChapters.map(chapter => ({
        chapter_id: chapter.id,
        coin_cost: Math.floor(Math.random() * 50) + 10, // 10-60 coins
        premium_only: Math.random() > 0.8, // 20% are premium only
        early_access_hours: Math.random() > 0.5 ? Math.floor(Math.random() * 72) + 24 : 0
      }));

      const { error: pricingError } = await supabase
        .from('chapter_prices')
        .insert(pricingInserts);

      if (pricingError) {
        console.error('❌ Error creating chapter pricing:', pricingError);
      } else {
        console.log(`💰 Created pricing for ${pricingInserts.length} chapters`);
      }
    }

    // Create some sample comments
    const { data: allChapters } = await supabase
      .from('chapters')
      .select('id')
      .limit(20);

    if (allChapters && allChapters.length > 0) {
      const sampleComments = [
        "Amazing chapter! Can't wait for the next one!",
        "The art style is incredible in this series.",
        "Plot twist! Didn't see that coming.",
        "This character development is so well done.",
        "The action scenes are epic!",
        "Love the world-building in this story.",
        "The emotional depth is outstanding.",
        "Great pacing throughout this chapter.",
        "The dialogue feels so natural.",
        "Brilliant storytelling as always!"
      ];

      const commentInserts = [];
      allChapters.forEach(chapter => {
        const numComments = Math.floor(Math.random() * 5) + 1;
        for (let i = 0; i < numComments; i++) {
          commentInserts.push({
            chapter_id: chapter.id,
            content: sampleComments[Math.floor(Math.random() * sampleComments.length)],
            user_id: '00000000-0000-0000-0000-000000000000', // Demo user
            like_count: Math.floor(Math.random() * 20),
            created_at: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });

      // Only insert if we have a demo user (this might fail if no auth)
      try {
        const { error: commentsError } = await supabase
          .from('comments')
          .insert(commentInserts.slice(0, 50)); // Limit to 50 comments

        if (!commentsError) {
          console.log(`💬 Created ${Math.min(commentInserts.length, 50)} demo comments`);
        }
      } catch (error) {
        console.log('ℹ️ Skipped creating comments (no auth user)');
      }
    }

    // Create trending data
    if (createdSeries.length > 0) {
      const trendingInserts = createdSeries.slice(0, 8).map(series => ({
        series_id: series.id,
        user_id: null,
        ip_address: '127.0.0.1',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
      }));

      // Create multiple views for trending
      const allViews = [];
      trendingInserts.forEach(view => {
        const viewCount = Math.floor(Math.random() * 100) + 20;
        for (let i = 0; i < viewCount; i++) {
          allViews.push({
            ...view,
            created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
          });
        }
      });

      try {
        const { error: viewsError } = await supabase
          .from('series_views')
          .insert(allViews.slice(0, 500)); // Limit to 500 views

        if (!viewsError) {
          console.log(`👀 Created ${Math.min(allViews.length, 500)} series views`);
        }
      } catch (error) {
        console.log('ℹ️ Skipped creating series views');
      }
    }

    console.log('🎉 Enhanced demo data seeding completed successfully!');
    console.log(`📊 Summary: ${createdSeries.length} series, ${totalChapters} chapters`);
    
    return { 
      success: true, 
      stats: {
        series: createdSeries.length,
        chapters: totalChapters,
        lockedChapters: lockedChapters?.length || 0
      }
    };

  } catch (error) {
    console.error('❌ Error seeding enhanced demo data:', error);
    return { success: false, error };
  }
};
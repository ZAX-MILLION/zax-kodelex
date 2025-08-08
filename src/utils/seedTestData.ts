import { supabase } from '@/integrations/supabase/client';

export const seedTestData = async () => {
  try {
    console.log('🌱 Starting test data seeding...');

    // Check existing test content first
    const { data: existingChapters } = await supabase
      .from('chapters')
      .select('id')
      .limit(1);

    if (existingChapters && existingChapters.length > 0) {
      console.log('⏭️ Test data already exists, skipping seeding...');
      return { success: true };
    }

    // Create test chapters with proper schema
    const chapters = [
      {
        chapter_number: 1,
        title: 'The Beginning',
        pages: JSON.stringify([
          '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p2.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p3.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p4.jpg',
          '/src/assets/manga-pages/crimson-blade-ch1-p5.jpg'
        ]),
        sort_order: 1,
        release_date: new Date().toISOString()
      },
      {
        chapter_number: 2,
        title: 'Early Access Chapter',
        pages: JSON.stringify([
          '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg',
          '/placeholder-page2.jpg',
          '/placeholder-page3.jpg'
        ]),
        sort_order: 2,
        release_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        chapter_number: 3,
        title: 'Premium Chapter',
        pages: JSON.stringify([
          '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg',
          '/placeholder-page2.jpg',
          '/placeholder-page3.jpg'
        ]),
        sort_order: 3,
        release_date: new Date().toISOString()
      }
    ];

    const { error: chaptersError } = await supabase
      .from('chapters')
      .insert(chapters);

    if (chaptersError) {
      console.error('❌ Error creating test chapters:', chaptersError);
    } else {
      console.log(`📚 Created ${chapters.length} test chapters`);
    }

    console.log('🎉 Test data seeding completed successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error seeding test data:', error);
    return { success: false, error };
  }
};
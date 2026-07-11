import { supabase } from '@/integrations/supabase/client';

// Quick data reset tool that can be run from browser console
export const quickDatabaseReset = async () => {
  console.log('🚀 Starting quick database reset...');
  
  try {
    // Create a few test series quickly
    const testSeries = [
      {
        title: 'Test Manga 1',
        description: 'A test manga series',
        author: 'Test Author',
        status: 'ongoing' as const,
        genres: ['Action', 'Adventure'],
        content_type: 'manga',
        cover_image_url: 'https://picsum.photos/seed/test1/400/600',
        view_count: 1000,
        rating_average: 4.5
      },
      {
        title: 'Test Novel 1', 
        description: 'A test novel series',
        author: 'Test Novelist',
        status: 'ongoing' as const,
        genres: ['Fantasy', 'Romance'],
        content_type: 'novel',
        cover_image_url: 'https://picsum.photos/seed/test2/400/600',
        view_count: 800,
        rating_average: 4.2
      }
    ];

    for (const series of testSeries) {
      const { data, error } = await supabase
        .from('manga_meta')
        .insert(series)
        .select()
        .single();

      if (error) {
        console.error('Error creating series:', error);
        continue;
      }

      // Add a few chapters
      for (let i = 1; i <= 5; i++) {
        await supabase
          .from('chapters')
          .insert({
            series_id: data.id,
            chapter_number: i,
            title: `Chapter ${i}`,
            pages: JSON.stringify([
              { page_number: 1, image_url: `https://picsum.photos/seed/ch${i}-1/800/1200` },
              { page_number: 2, image_url: `https://picsum.photos/seed/ch${i}-2/800/1200` }
            ]),
            page_count: 2,
            sort_order: i,
            is_locked: false
          });
      }
    }

    console.log('✅ Quick reset complete!');
    return true;
  } catch (error) {
    console.error('❌ Quick reset failed:', error);
    return false;
  }
};

// Make it available globally for console access
if (typeof window !== 'undefined') {
  (window as any).quickDatabaseReset = quickDatabaseReset;
  console.log('🔧 Quick reset tool available: run quickDatabaseReset() in console');
}
import { supabase } from '@/integrations/supabase/client';

export const updateChapterWithTenPages = async (seriesId: string, chapterNumber: number) => {
  try {
    console.log(`🔧 Updating chapter ${chapterNumber} for series ${seriesId} with 10 pages...`);

    // Create 10 different manga page images
    const pages = [
      'https://picsum.photos/seed/manga-page-1/800/1200',
      'https://picsum.photos/seed/manga-page-2/800/1200', 
      'https://picsum.photos/seed/manga-page-3/800/1200',
      'https://picsum.photos/seed/manga-page-4/800/1200',
      'https://picsum.photos/seed/manga-page-5/800/1200',
      'https://picsum.photos/seed/manga-page-6/800/1200',
      'https://picsum.photos/seed/manga-page-7/800/1200',
      'https://picsum.photos/seed/manga-page-8/800/1200',
      'https://picsum.photos/seed/manga-page-9/800/1200',
      'https://picsum.photos/seed/manga-page-10/800/1200'
    ];

    // Update the chapter
    const { data, error } = await supabase
      .from('chapters')
      .update({
        pages: pages,
        page_count: 10
      })
      .eq('series_id', seriesId)
      .eq('chapter_number', chapterNumber)
      .select();

    if (error) {
      console.error('❌ Error updating chapter:', error);
      return { success: false, error };
    }

    console.log('✅ Successfully updated chapter with 10 pages:', data);
    return { success: true, data };

  } catch (error) {
    console.error('❌ Error updating chapter pages:', error);
    return { success: false, error };
  }
};

export const updateAllChaptersWithTenPages = async () => {
  try {
    console.log('🔧 Updating ALL chapters with 10 pages...');

    // First, get all chapters from the database
    const { data: chapters, error: fetchError } = await supabase
      .from('chapters')
      .select('id, series_id, chapter_number');

    if (fetchError) {
      console.error('❌ Error fetching chapters:', fetchError);
      return { success: false, error: fetchError };
    }

    if (!chapters || chapters.length === 0) {
      console.log('⚠️ No chapters found to update');
      return { success: true, message: 'No chapters found' };
    }

    console.log(`📚 Found ${chapters.length} chapters to update`);

    // Create 10 different manga page images with unique seeds for each chapter
    let successCount = 0;
    let errorCount = 0;

    for (const chapter of chapters) {
      try {
        // Create unique pages for each chapter using chapter ID as seed
        const pages = Array.from({ length: 10 }, (_, i) => 
          `https://picsum.photos/seed/manga-${chapter.id}-page-${i + 1}/800/1200`
        );

        const { error } = await supabase
          .from('chapters')
          .update({
            pages: pages,
            page_count: 10
          })
          .eq('id', chapter.id);

        if (error) {
          console.error(`❌ Error updating chapter ${chapter.chapter_number}:`, error);
          errorCount++;
        } else {
          console.log(`✅ Updated chapter ${chapter.chapter_number} with 10 unique pages`);
          successCount++;
        }
      } catch (chapterError) {
        console.error(`❌ Error processing chapter ${chapter.chapter_number}:`, chapterError);
        errorCount++;
      }
    }

    console.log(`🎉 Update complete! Success: ${successCount}, Errors: ${errorCount}`);
    
    return { 
      success: errorCount === 0, 
      successCount, 
      errorCount,
      totalChapters: chapters.length
    };

  } catch (error) {
    console.error('❌ Error updating all chapters:', error);
    return { success: false, error };
  }
};
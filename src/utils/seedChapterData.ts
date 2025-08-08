import { supabase } from '@/integrations/supabase/client';

export const seedChapterData = async () => {
  try {
    // First, get existing series
    const { data: series } = await supabase
      .from('manga_meta')
      .select('id, title')
      .limit(5);

    if (!series || series.length === 0) {
      console.log('No series found to add chapters to');
      return;
    }

    // Delete existing chapters to avoid duplicates
    await supabase.from('chapters').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    const chapterData = [];
    
    for (const s of series) {
      // Create 12 chapters for each series with different statuses
      for (let i = 1; i <= 12; i++) {
        const releaseDate = new Date();
        releaseDate.setDate(releaseDate.getDate() - (12 - i) * 3); // Stagger releases

        let isLocked = false;
        let unlockCost = 0;

        // Make every 3rd chapter locked and require coins
        if (i % 3 === 0 && i > 3) {
          isLocked = true;
          unlockCost = Math.floor(Math.random() * 20) + 5; // 5-25 coins
        }

        chapterData.push({
          id: crypto.randomUUID(),
          series_id: s.id,
          title: `${getChapterTitle(i)}`,
          chapter_number: i,
          page_count: Math.floor(Math.random() * 25) + 15, // 15-40 pages
          release_date: releaseDate.toISOString(),
          view_count: Math.floor(Math.random() * 1000) + 50,
          is_locked: isLocked,
          unlock_cost: unlockCost,
          thumbnail_url: `/lovable-uploads/537fec86-cd2c-4480-809c-038fd0e611e2.png`,
          pages: JSON.stringify(generatePages(Math.floor(Math.random() * 25) + 15))
        });
      }
    }

    const { error } = await supabase
      .from('chapters')
      .insert(chapterData);

    if (error) throw error;

    console.log(`Successfully seeded ${chapterData.length} chapters!`);
    return chapterData;
    
  } catch (error) {
    console.error('Error seeding chapter data:', error);
    throw error;
  }
};

const getChapterTitle = (chapterNumber: number): string => {
  const titles = [
    'The Beginning',
    'First Encounter',
    'Hidden Powers',
    'The Challenge',
    'Unexpected Allies',
    'Dark Secrets',
    'Battle Royale',
    'The Revelation',
    'New Horizons',
    'Facing the Past',
    'Ultimate Showdown',
    'The Final Stand'
  ];
  
  return titles[chapterNumber - 1] || `Chapter ${chapterNumber}`;
};

const generatePages = (pageCount: number): string[] => {
  const pages = [];
  for (let i = 1; i <= pageCount; i++) {
    // Use the same placeholder image for all pages for now
    pages.push(`/lovable-uploads/537fec86-cd2c-4480-809c-038fd0e611e2.png`);
  }
  return pages;
};
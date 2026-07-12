import { supabase } from '@/integrations/supabase/client';

// Comprehensive production-quality data seeding
export const runComprehensiveProductionReset = async () => {
  try {
    console.log('🚀 Starting comprehensive production data reset...');

    const mangaTitles = [
      'Dragon Slayer Chronicles', 'Mystic Academy Secrets', 'Crimson Blade Legacy',
      'Shadow Ninja Academy', 'Elemental Magic School', 'Cyberpunk Detective',
      'Space Pirate Captain', 'Forest Spirit Guardian', 'Demon Hunter Chronicles',
      'Mecha Warriors United', 'Cherry Blossom Romance', 'Midnight Confessions',
      'Dragon\'s Legacy', 'Cafe Love Stories', 'Clumsy Chef Adventures',
      'Pet Shop Pandemonium', 'Time Traveler\'s Diary', 'Ocean Depths Explorer',
      'Sky Kingdom Wars', 'Ancient Artifact Hunter'
    ];

    const novelTitles = [
      'Reincarnated as a Villain', 'The System Awakens', 'Cultivation Master\'s Path',
      'Interstellar Merchant Guild', 'Academy of Forbidden Arts', 'Dimensional Gate Walker',
      'Beast Tamer\'s Journey', 'Necromancer\'s Redemption', 'Virtual Reality Legend',
      'Immortal Sword Saint'
    ];

    const genres = [
      'Action', 'Adventure', 'Romance', 'Fantasy', 'Sci-Fi', 'Mystery', 'Horror',
      'Comedy', 'Drama', 'Slice of Life', 'Supernatural', 'Martial Arts',
      'School Life', 'Isekai', 'Mecha', 'Historical', 'Military', 'Sports'
    ];

    const chapterTitleTemplates = [
      'The Beginning', 'First Encounter', 'Hidden Power', 'New Alliance', 'Dark Secrets',
      'Battle Royal', 'Unexpected Turn', 'Rising Storm', 'Final Showdown', 'New Journey',
      'Lost Memories', 'Ancient Prophecy', 'Forbidden Technique', 'Mysterious Stranger',
      'Ultimate Challenge', 'Secret Identity', 'Betrayal', 'Redemption', 'New Dawn'
    ];

    const statuses = ['ongoing', 'completed', 'hiatus'] as const;
    let seriesCreated = 0;
    let chaptersCreated = 0;

    // Create manga series
    for (let i = 0; i < 20; i++) {
      const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 3);
      const viewCount = Math.floor(Math.random() * 45000) + 5000;
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
      const chapterCount = Math.floor(Math.random() * 80) + 20;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const publicationYear = Math.floor(Math.random() * 5) + 2020;
      const publicationMonth = Math.floor(Math.random() * 12) + 1;
      const publicationDay = Math.floor(Math.random() * 28) + 1;
      
      const coverImageUrl = `https://picsum.photos/seed/manga-${i + 1}/400/600`;
      const thumbnailUrl = `https://picsum.photos/seed/manga-${i + 1}/300/450`;

      const descriptions = [
        `An epic tale of ${randomGenres[0].toLowerCase()} and ${randomGenres[1].toLowerCase()} following a young hero who discovers their hidden powers and must save the world from ancient evil. With stunning artwork and compelling characters, this series takes readers on an unforgettable journey through mystical realms and intense battles.`,
        `A thrilling ${randomGenres[0].toLowerCase()} story set in a world where magic and technology collide. Follow the protagonist as they navigate complex relationships, face powerful enemies, and uncover the truth about their mysterious past. Full of action, romance, and supernatural elements.`,
        `This captivating ${randomGenres[0].toLowerCase()} series combines elements of ${randomGenres[1].toLowerCase()} and ${randomGenres[2].toLowerCase()} to create an immersive reading experience. Watch as ordinary people become extraordinary heroes in a world filled with danger, mystery, and unexpected allies.`
      ];

      const series = await supabase
        .from('manga_meta')
        .insert({
          title: mangaTitles[i],
          description: descriptions[Math.floor(Math.random() * descriptions.length)],
          author: `Author ${i + 1}`,
          artist: `Artist ${i + 1}`,
          status,
          genres: randomGenres,
          content_type: 'manga',
          cover_image_url: coverImageUrl,
          thumbnail_url: thumbnailUrl,
          view_count: viewCount,
          rating_average: parseFloat(rating),
          rating_count: Math.floor(viewCount / 10),
          publication_date: `${publicationYear}-${publicationMonth.toString().padStart(2, '0')}-${publicationDay.toString().padStart(2, '0')}`,
          age_rating: 'T',
          language: 'en'
        })
        .select()
        .single();

      if (series.error) {
        console.error('Error creating manga series:', series.error);
        continue;
      }

      seriesCreated++;

      // Create chapters for this series
      const now = new Date();
      for (let chapterNum = 1; chapterNum <= chapterCount; chapterNum++) {
        const isLocked = Math.random() > 0.7; // 30% locked
        const coinCost = isLocked ? Math.floor(Math.random() * 20) + 5 : 0;
        const chapterViews = Math.floor(Math.random() * 5000) + 500;
        
        // Release dates spread 1-3 days apart
        const releaseDate = new Date(now.getTime() - (chapterCount - chapterNum) * (Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
        
        const templateTitle = chapterTitleTemplates[Math.floor(Math.random() * chapterTitleTemplates.length)];
        const chapterTitle = `Chapter ${chapterNum}: ${templateTitle}`;

        // Create chapter pages (10-20 pages)
        const pageCount = Math.floor(Math.random() * 10) + 10;
        const pages = [];
        for (let page = 1; page <= pageCount; page++) {
          pages.push({
            page_number: page,
            image_url: `https://picsum.photos/seed/page-${series.data.id}-${chapterNum}-${page}/800/1200`,
            alt_text: `Chapter ${chapterNum}, Page ${page}`
          });
        }

        // Create chapter with service role to bypass RLS
        const { data: chapter, error: chapterError } = await supabase
          .from('chapters')
          .insert({
            series_id: series.data.id,
            chapter_number: chapterNum,
            title: chapterTitle,
            pages: JSON.stringify(pages),
            page_count: pageCount,
            is_locked: isLocked,
            view_count: chapterViews,
            release_date: releaseDate.toISOString(),
            sort_order: chapterNum
          })
          .select()
          .single();

        if (chapterError) {
          console.error('Error creating chapter:', chapterError);
          continue;
        }

        // Add chapter pricing if locked
        if (isLocked && chapter) {
          await supabase
            .from('chapter_prices')
            .insert({
              chapter_id: chapter.id,
              coin_cost: coinCost,
              premium_only: false
            });
        }

        chaptersCreated++;
      }

      // Generate view logs (10% of total views)
      const viewLogsToCreate = Math.floor(viewCount * 0.1);
      const viewLogs = [];
      for (let v = 0; v < viewLogsToCreate; v++) {
        const viewDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        viewLogs.push({
          series_id: series.data.id,
          created_at: viewDate.toISOString(),
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }

      if (viewLogs.length > 0) {
        await supabase.from('series_views').insert(viewLogs);
      }
    }

    // Create novel series
    for (let i = 0; i < 10; i++) {
      const randomGenres = genres.sort(() => 0.5 - Math.random()).slice(0, Math.floor(Math.random() * 4) + 3);
      const viewCount = Math.floor(Math.random() * 45000) + 5000;
      const rating = (Math.random() * 1.5 + 3.5).toFixed(1);
      const chapterCount = Math.floor(Math.random() * 80) + 20;
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      
      const publicationYear = Math.floor(Math.random() * 5) + 2020;
      const publicationMonth = Math.floor(Math.random() * 12) + 1;
      const publicationDay = Math.floor(Math.random() * 28) + 1;
      
      const coverImageUrl = `https://picsum.photos/seed/novel-${i + 1}/400/600`;
      const thumbnailUrl = `https://picsum.photos/seed/novel-${i + 1}/300/450`;

      const novelDescriptions = [
        `A captivating ${randomGenres[0].toLowerCase()} novel that explores themes of ${randomGenres[1].toLowerCase()} and personal growth. Follow the protagonist's journey through a richly detailed world filled with complex characters, political intrigue, and magical systems that will keep you turning pages late into the night.`,
        `This immersive ${randomGenres[0].toLowerCase()} story combines traditional storytelling with modern themes, creating a unique reading experience. The narrative follows multiple character perspectives as they navigate a world where ${randomGenres[1].toLowerCase()} and ${randomGenres[2].toLowerCase()} collide in unexpected ways.`,
        `An outstanding work of ${randomGenres[0].toLowerCase()} fiction that has captivated readers worldwide. With its intricate plot, well-developed characters, and stunning world-building, this novel series offers both entertainment and profound insights into the human condition.`
      ];

      const series = await supabase
        .from('manga_meta')
        .insert({
          title: novelTitles[i],
          description: novelDescriptions[Math.floor(Math.random() * novelDescriptions.length)],
          author: `Novelist ${i + 1}`,
          status,
          genres: randomGenres,
          content_type: 'novel',
          cover_image_url: coverImageUrl,
          thumbnail_url: thumbnailUrl,
          view_count: viewCount,
          rating_average: parseFloat(rating),
          rating_count: Math.floor(viewCount / 10),
          publication_date: `${publicationYear}-${publicationMonth.toString().padStart(2, '0')}-${publicationDay.toString().padStart(2, '0')}`,
          age_rating: 'T',
          language: 'en'
        })
        .select()
        .single();

      if (series.error) {
        console.error('Error creating novel series:', series.error);
        continue;
      }

      seriesCreated++;

      // Create chapters for this novel
      const now = new Date();
      for (let chapterNum = 1; chapterNum <= chapterCount; chapterNum++) {
        const isLocked = Math.random() > 0.7; // 30% locked
        const coinCost = isLocked ? Math.floor(Math.random() * 20) + 5 : 0;
        const chapterViews = Math.floor(Math.random() * 5000) + 500;
        
        const releaseDate = new Date(now.getTime() - (chapterCount - chapterNum) * (Math.random() * 2 + 1) * 24 * 60 * 60 * 1000);
        const templateTitle = chapterTitleTemplates[Math.floor(Math.random() * chapterTitleTemplates.length)];
        const chapterTitle = `Chapter ${chapterNum}: ${templateTitle}`;

        // Generate novel text content (400-1200 words)
        const wordCount = Math.floor(Math.random() * 800) + 400;
        const textContent = generateNovelContent(wordCount, chapterTitle);

        // Create novel chapter with proper JSON formatting
        const { data: chapter, error: chapterError } = await supabase
          .from('chapters')
          .insert({
            series_id: series.data.id,
            chapter_number: chapterNum,
            title: chapterTitle,
            pages: JSON.stringify([{ page_number: 1, content: textContent, word_count: wordCount }]),
            page_count: 1,
            is_locked: isLocked,
            view_count: chapterViews,
            release_date: releaseDate.toISOString(),
            sort_order: chapterNum
          })
          .select()
          .single();

        if (chapterError) {
          console.error('Error creating novel chapter:', chapterError);
          continue;
        }

        // Add chapter pricing if locked
        if (isLocked && chapter) {
          await supabase
            .from('chapter_prices')
            .insert({
              chapter_id: chapter.id,
              coin_cost: coinCost,
              premium_only: false
            });
        }

        chaptersCreated++;
      }

      // Generate view logs for novels too
      const viewLogsToCreate = Math.floor(viewCount * 0.1);
      const viewLogs = [];
      for (let v = 0; v < viewLogsToCreate; v++) {
        const viewDate = new Date(now.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000);
        viewLogs.push({
          series_id: series.data.id,
          created_at: viewDate.toISOString(),
          ip_address: `192.168.1.${Math.floor(Math.random() * 255)}`
        });
      }

      if (viewLogs.length > 0) {
        await supabase.from('series_views').insert(viewLogs);
      }
    }

    console.log(`✅ Database reset complete!`);
    console.log(`📊 Created ${seriesCreated} series (20 manga + 10 novels)`);
    console.log(`📚 Created ${chaptersCreated} chapters with realistic pricing`);
    console.log(`🖼️ All images use consistent picsum.photos URLs`);

    return {
      success: true,
      stats: {
        seriesCount: seriesCreated,
        mangaCount: 20,
        novelCount: 10,
        chapterCount: chaptersCreated,
        viewCount: seriesCreated * 1000, // Approximate
        pageCount: chaptersCreated * 15, // Approximate average
      }
    };

  } catch (error) {
    console.error('❌ Error during database reset:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
};

// Generate realistic novel content
function generateNovelContent(wordCount: number, chapterTitle: string): string {
  const paragraphs = [
    `The morning sun cast long shadows across the ancient courtyard as ${chapterTitle.toLowerCase()} began to unfold. Our protagonist stood at the threshold of destiny, unaware that this day would change everything they thought they knew about their world.`,
    
    `In the distance, the sound of steel against steel echoed through the training grounds. Students moved with practiced precision, their movements a dance of combat that had been perfected over centuries. Yet beneath the surface of this ordered world, darker forces were stirring.`,
    
    `The academy's towering spires reached toward the heavens, their crystalline structures catching and refracting the light in mesmerizing patterns. Each building held secrets that even the eldest masters had forgotten, and within these walls, power beyond imagination lay dormant.`,
    
    `As the protagonist walked through the halls, whispers followed in their wake. Some spoke of prophecies and ancient bloodlines, while others murmured about the strange events that had been occurring with increasing frequency. The very air seemed charged with anticipation.`,
    
    `The library stretched endlessly in all directions, its shelves filled with tomes that contained the accumulated knowledge of ages. Here, among the dusty volumes and flickering candles, the truth waited to be discovered by those brave enough to seek it.`,
    
    `Night fell with unexpected swiftness, and with it came the manifestation of powers that were supposed to be legend. The boundaries between the possible and impossible began to blur as reality itself seemed to shift and change before their very eyes.`,
    
    `In the depths of the underground chambers, ancient mechanisms hummed with forgotten purpose. The technology of the ancients, thought lost forever, began to stir to life once more, responding to the presence of one whose bloodline carried the key to unlocking its mysteries.`,
    
    `The final confrontation approached with the inevitability of a gathering storm. Forces that had been building for generations were about to collide, and the outcome would determine not just the fate of individuals, but the very future of their world.`
  ];

  let content = '';
  let currentWordCount = 0;
  
  while (currentWordCount < wordCount) {
    const paragraph = paragraphs[Math.floor(Math.random() * paragraphs.length)];
    const words = paragraph.split(' ');
    
    if (currentWordCount + words.length <= wordCount) {
      content += paragraph + '\n\n';
      currentWordCount += words.length;
    } else {
      const remainingWords = wordCount - currentWordCount;
      content += words.slice(0, remainingWords).join(' ') + '...';
      break;
    }
  }

  return content;
}
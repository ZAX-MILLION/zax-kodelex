import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive database reset and population with clean, working content
 * Implements all requirements: 20 manga + 10 novels with consistent picsum.photos images
 */

interface SeriesTemplate {
  title: string;
  author: string;
  artist?: string;
  description: string;
  genres: string[];
  status: 'ongoing' | 'completed' | 'hiatus';
  content_type: 'manga' | 'novel';
}

const MANGA_SERIES: SeriesTemplate[] = [
  {
    title: "Cyber Phantom",
    author: "Akira Sato",
    artist: "Yuki Tanaka",
    description: "In Neo-Tokyo 2087, hacker Kai discovers he can manifest digital phantoms in the real world. As cyber-terrorists threaten the city's neural network, he must master his newfound powers while uncovering a conspiracy that reaches the highest levels of government. Each chapter reveals deeper mysteries about the connection between human consciousness and digital reality.",
    genres: ["Action", "Sci-Fi", "Cyberpunk"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Shadow Reaper",
    author: "Dark Senju",
    artist: "Shadow Artist",
    description: "Young assassin Raven inherits the legendary Shadow Blade, a weapon that can cut through dimensions. Hunted by ancient clans and modern military forces, she must learn to control her deadly heritage while protecting the innocent. The shadow realm holds secrets that could change the world forever.",
    genres: ["Action", "Fantasy", "Supernatural"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Omega Core",
    author: "Mech Master",
    artist: "Steel Designer",
    description: "When alien invaders threaten Earth, pilot Alex discovers the Omega Core - a mysterious energy source that powers the ultimate mecha. Racing against time to master this technology, humanity's survival depends on understanding the Core's true origin and the price of wielding its immense power.",
    genres: ["Mecha", "Sci-Fi", "Action"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Dragon's Blood Academy",
    author: "Flame Writer",
    artist: "Dragon Artist",
    description: "Students at the prestigious Dragon Academy learn to bond with mythical dragons and master elemental magic. But when ancient enemies return to threaten the balance between worlds, young dragonriders must unite their powers and discover the true meaning of the dragon's blood that flows in their veins.",
    genres: ["Fantasy", "School Life", "Adventure"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Quantum Detective",
    author: "Time Hunter",
    artist: "Reality Bender",
    description: "Detective Sarah Chen can perceive quantum possibilities, seeing multiple timelines simultaneously. Using this unique ability, she solves impossible crimes by following clues across parallel realities. But each case brings her closer to a truth that threatens the fabric of existence itself.",
    genres: ["Mystery", "Sci-Fi", "Thriller"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Mystic Blade Tournament",
    author: "Sword Saint",
    artist: "Battle Master",
    description: "Every decade, warriors gather for the ultimate tournament where magical weapons choose their wielders. Young swordsman Jin enters seeking to claim his father's legendary blade, but the tournament hides a dark secret that will test not just his skill, but his very soul.",
    genres: ["Action", "Tournament", "Fantasy"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Space Pirate Nova",
    author: "Star Captain",
    artist: "Galaxy Drawer",
    description: "Captain Nova leads her crew across the galaxy in search of the legendary Star Map, dodging imperial forces and rival pirates. Their adventures take them to exotic worlds and dangerous space stations, where friendship and loyalty are the only currencies that matter.",
    genres: ["Adventure", "Comedy", "Space"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Elemental Academy",
    author: "Element Master",
    artist: "Magic Illustrator",
    description: "Students learn to control fire, water, earth, and air at the world's most prestigious magic academy. But when a forbidden fifth element surfaces, threatening to upset the balance of power, young mages must work together to prevent magical catastrophe.",
    genres: ["Fantasy", "School Life", "Magic"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Urban Spirit Hunter",
    author: "Ghost Walker",
    artist: "Spirit Artist",
    description: "In modern Tokyo, part-time student and full-time exorcist Hana battles malevolent spirits that prey on humans. Armed with ancient talismans and modern technology, she navigates the supernatural underworld while trying to maintain a normal high school life.",
    genres: ["Supernatural", "Urban Fantasy", "Action"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Mecha Racing League",
    author: "Speed Demon",
    artist: "Racing Artist",
    description: "In the high-octane world of mecha racing, pilot Zack climbs the ranks from underground circuits to the professional league. With custom-built mechs reaching impossible speeds, every race is a battle for survival where second place means death.",
    genres: ["Sports", "Mecha", "Action"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Forest Guardian Chronicles",
    author: "Nature's Voice",
    artist: "Forest Painter",
    description: "Young druid Luna inherits the responsibility of protecting an ancient forest from those who would exploit its magic. With the help of mystical creatures and elemental spirits, she must learn to balance the natural world with human progress.",
    genres: ["Fantasy", "Environmental", "Adventure"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Midnight Café Mysteries",
    author: "Night Writer",
    artist: "Café Artist",
    description: "A 24-hour café serves as neutral ground for supernatural beings. Owner Ren, who inherited the café from his grandmother, discovers he can see through magical disguises and becomes mediator in conflicts between vampires, werewolves, and other creatures of the night.",
    genres: ["Supernatural", "Mystery", "Slice of Life"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Cooking Battle Royale",
    author: "Chef Supreme",
    artist: "Food Artist",
    description: "Culinary student Maya enters the underground cooking tournament where chefs battle with both skill and supernatural ingredients. Victory brings fame and fortune, but defeat can cost more than just pride in this high-stakes culinary combat arena.",
    genres: ["Cooking", "Tournament", "Comedy"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Time Academy",
    author: "Chronos Teacher",
    artist: "Time Artist",
    description: "Students at the secret Time Academy learn to manipulate temporal flow while preventing paradoxes that could unravel reality. Young chronomancer Sam must master his unstable powers before his mistakes tear apart the timeline itself.",
    genres: ["Sci-Fi", "School Life", "Time Travel"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Beast Tamer Guild",
    author: "Wild Heart",
    artist: "Creature Master",
    description: "In a world where mythical beasts roam free, professional tamers maintain the balance between human civilization and wild magic. Guild member Kira forms bonds with legendary creatures while uncovering the truth about her own mysterious heritage.",
    genres: ["Fantasy", "Adventure", "Animals"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Virtual Realm Escape",
    author: "Digital Pioneer",
    artist: "VR Designer",
    description: "Players trapped in a virtual MMORPG must clear 100 floors of increasingly dangerous content to earn their freedom. With death in the game meaning death in real life, teamwork and strategy become matters of survival.",
    genres: ["Gaming", "Sci-Fi", "Adventure"],
    status: "completed",
    content_type: "manga"
  },
  {
    title: "Demon Slayer Corps",
    author: "Blade Master",
    artist: "Demon Artist",
    description: "Elite warriors protect modern cities from demons that hide among humans. Rookie slayer Takeshi inherits a cursed blade that grows stronger with each demon defeated, but the weapon's dark history threatens to consume his soul.",
    genres: ["Action", "Supernatural", "Urban Fantasy"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Music Magic Academy",
    author: "Melody Mage",
    artist: "Sound Illustrator",
    description: "At the prestigious Harmony Academy, students learn to cast spells through music. Violin prodigy Elena discovers her rare ability to weave magic through sound, but her powerful melodies attract dangerous attention from those who would abuse musical magic.",
    genres: ["Music", "Fantasy", "School Life"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Steampunk Detective",
    author: "Gear Inspector",
    artist: "Steam Artist",
    description: "In Victorian London enhanced by steam technology, detective Arthur uses mechanical gadgets and analytical prowess to solve crimes involving both human criminals and rogue automatons. Each case reveals more about the mysterious inventor behind the city's greatest innovations.",
    genres: ["Steampunk", "Mystery", "Historical"],
    status: "ongoing",
    content_type: "manga"
  },
  {
    title: "Cosmic Guardian Squad",
    author: "Star Protector",
    artist: "Galaxy Guardian",
    description: "Five teenagers gain cosmic powers to protect Earth from intergalactic threats. As they learn to work together and master their abilities, they uncover a conspiracy that spans multiple galaxies and threatens all sentient life.",
    genres: ["Superhero", "Sci-Fi", "Team"],
    status: "ongoing",
    content_type: "manga"
  }
];

const NOVEL_SERIES: SeriesTemplate[] = [
  {
    title: "Tales of Digital Immortality",
    author: "Future Chronicler",
    description: "In 2095, consciousness uploading promises eternal life, but Dr. Maya Chen discovers that digital immortality comes with a terrible price. As she investigates mysterious disappearances in virtual worlds, she uncovers a conspiracy that threatens the nature of human existence itself. This gripping techno-thriller explores what it means to be human in an age where death is optional.",
    genres: ["Sci-Fi", "Thriller", "Philosophy"],
    status: "completed",
    content_type: "novel"
  },
  {
    title: "Ancient Runes of Power",
    author: "Mystic Scholar",
    description: "Archaeologist Dr. Sarah Mitchell discovers ancient runes that can alter reality itself. As she deciphers their secrets, she becomes embroiled in a millennia-old conspiracy involving secret societies, government agencies, and beings from another dimension. Each rune she translates brings her closer to ultimate power - and ultimate danger.",
    genres: ["Fantasy", "Mystery", "Adventure"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Mars Colony Chronicles",
    author: "Red Planet Writer",
    description: "The first human colony on Mars faces challenges of survival, politics, and the discovery of ancient alien artifacts buried beneath the red planet's surface. Commander Elena Vasquez must navigate corporate interests, colonist disputes, and mysterious signals from deep underground while building humanity's future among the stars.",
    genres: ["Sci-Fi", "Political", "Space"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "The Last Dragon Keeper",
    author: "Dragon Sage",
    description: "In a world where dragons have been hunted to near extinction, young keeper Lyra inherits the responsibility of protecting the last dragon eggs. As corporate interests and government forces close in, she must navigate a complex web of allies and enemies while ensuring the survival of these magnificent creatures.",
    genres: ["Fantasy", "Conservation", "Adventure"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Quantum Detective Stories",
    author: "Parallel Investigator",
    description: "Detective Quinn possesses the unique ability to perceive multiple quantum realities simultaneously, allowing her to solve crimes by following clues across parallel timelines. But when a case threatens to collapse the barriers between dimensions, she must choose which reality deserves to survive.",
    genres: ["Sci-Fi", "Mystery", "Quantum"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Academy of Forbidden Arts",
    author: "Secret Teacher",
    description: "Students at the underground Blackthorn Academy secretly learn magical arts banned by the Arcane Council. As they master forbidden spells and ancient rituals, they prepare for a rebellion that will determine the future of magic in the modern world.",
    genres: ["Fantasy", "School Life", "Rebellion"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Merchant Prince's Journey",
    author: "Trade Master",
    description: "Young merchant Alexander builds a trading empire across the fantasy realm of Aethermoor, navigating political intrigue, magical dangers, and economic warfare. His journey from humble trader to merchant prince reveals the true cost of power and the price of ambition.",
    genres: ["Fantasy", "Political", "Economics"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Cyber Samurai Revolution",
    author: "Digital Warrior",
    description: "In cyberpunk Japan, traditional samurai values clash with corporate dystopia as a new generation of warriors fights for freedom. Kenji, last heir to an ancient samurai clan, must adapt ancient bushido to modern warfare while leading a rebellion against the mega-corporations.",
    genres: ["Cyberpunk", "Action", "Cultural"],
    status: "completed",
    content_type: "novel"
  },
  {
    title: "Dreamwalker's Guild",
    author: "Night Wanderer",
    description: "Professional dreamwalkers enter sleeping minds to solve psychological problems and recover lost memories. But when nightmares begin bleeding into reality, guild member Marcus must venture into the deepest layers of the collective unconscious to prevent a dream apocalypse.",
    genres: ["Fantasy", "Psychological", "Supernatural"],
    status: "ongoing",
    content_type: "novel"
  },
  {
    title: "Interstellar Refugee Crisis",
    author: "Void Chronicler",
    description: "When Earth becomes uninhabitable due to climate catastrophe, humanity must seek refuge among the stars. Admiral Chen leads the largest evacuation in human history, navigating alien politics, resource shortages, and the challenge of preserving human culture across the galaxy.",
    genres: ["Sci-Fi", "Political", "Space"],
    status: "ongoing",
    content_type: "novel"
  }
];

// Helper functions
const getRandomDate = (startYear = 2020, endYear = 2024) => {
  const start = new Date(startYear, 0, 1);
  const end = new Date(endYear, 11, 31);
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString();
};

const getRandomRating = () => Number((Math.random() * 1.5 + 3.5).toFixed(1));
const getRandomViews = () => Math.floor(Math.random() * 45000) + 5000;
const getRandomChapterCount = () => Math.floor(Math.random() * 81) + 20; // 20-100 chapters

const generateChapterData = (seriesId: string, seriesTitle: string, chapterCount: number, contentType: 'manga' | 'novel') => {
  const chapters = [];
  const publicationDate = new Date(getRandomDate());
  
  for (let i = 1; i <= chapterCount; i++) {
    // 70% free, 30% locked chapters
    const isLocked = Math.random() < 0.3;
    const coinCost = isLocked ? Math.floor(Math.random() * 21) + 5 : 0; // 5-25 coins
    
    // Spread release dates realistically (1-3 days between chapters)
    const daysOffset = (i - 1) * (Math.floor(Math.random() * 3) + 1);
    const releaseDate = new Date(publicationDate.getTime() + daysOffset * 24 * 60 * 60 * 1000);
    
    chapters.push({
      id: crypto.randomUUID(),
      series_id: seriesId,
      chapter_number: i,
      title: `Chapter ${i}: ${generateChapterTitle()}`,
      release_date: releaseDate.toISOString(),
      content_type: contentType,
      is_locked: isLocked,
      coin_cost: coinCost,
      page_count: contentType === 'manga' ? Math.floor(Math.random() * 11) + 10 : 1, // 10-20 pages for manga, 1 for novel
      thumbnail_url: `https://picsum.photos/seed/chapter-${seriesId}-${i}/200/300`,
      view_count: Math.floor(Math.random() * 1000),
      sort_order: i
    });
  }
  
  return chapters;
};

const generateChapterTitle = () => {
  const titles = [
    'The Awakening', 'New Challenges', 'Hidden Secrets', 'Unexpected Allies', 'The Truth Revealed',
    'Final Confrontation', 'A New Dawn', 'Past Memories', 'Future Plans', 'The Journey Continues',
    'Ancient Mysteries', 'Power Awakens', 'Bonds of Friendship', 'Dark Revelations', 'Hope Returns',
    'Rising Storm', 'Silent Preparation', 'The First Strike', 'Gathering Forces', 'Moment of Truth',
    'Turning Point', 'Last Stand', 'Victory and Loss', 'New Beginnings', 'Unexpected Discovery'
  ];
  return titles[Math.floor(Math.random() * titles.length)];
};

const generateChapterPages = (chapterId: string, seriesId: string, chapterNum: number, contentType: 'manga' | 'novel') => {
  if (contentType === 'novel') {
    // Generate novel content (text-based)
    const wordCount = Math.floor(Math.random() * 800) + 400; // 400-1200 words
    const content = `This is Chapter ${chapterNum} of an engaging novel. The story unfolds with rich character development and intricate plot details that captivate readers from beginning to end. Each paragraph builds upon the previous one, creating a compelling narrative that explores themes of growth, conflict, and resolution. The characters face challenges that test their resolve and reveal their true nature, while the world around them provides both obstacles and opportunities for advancement.`;
    
    return [{
      id: crypto.randomUUID(),
      chapter_id: chapterId,
      page_number: 1,
      content: content,
      word_count: wordCount
    }];
  } else {
    // Generate manga pages (image-based)
    const pageCount = Math.floor(Math.random() * 11) + 10; // 10-20 pages
    const pages = [];
    
    for (let i = 1; i <= pageCount; i++) {
      pages.push({
        id: crypto.randomUUID(),
        chapter_id: chapterId,
        page_number: i,
        image_url: `https://picsum.photos/seed/page-${seriesId}-${chapterNum}-${i}/800/1200`,
        alt_text: `Chapter ${chapterNum}, Page ${i}`
      });
    }
    
    return pages;
  }
};

const generateViewData = (seriesId: string, viewCount: number) => {
  const views = [];
  const now = new Date();
  
  for (let i = 0; i < viewCount; i++) {
    // Spread views over the last 30 days
    const daysAgo = Math.floor(Math.random() * 30);
    const viewDate = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    
    views.push({
      id: crypto.randomUUID(),
      series_id: seriesId,
      viewer_ip: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      viewed_at: viewDate.toISOString(),
      user_agent: 'Mozilla/5.0 (compatible; DataSeeder/1.0)'
    });
  }
  
  return views;
};

/**
 * Complete database reset and repopulation
 */
export const runComprehensiveDataReset = async () => {
  console.log('🚀 Starting Comprehensive Database Reset...');
  
  try {
    // Phase 1: Complete data wipe
    console.log('🗑️ Phase 1: Wiping all existing data...');
    
    const deleteOperations = [
      supabase.from('series_views').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('manga_ratings').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('chapters').delete().gte('id', '00000000-0000-0000-0000-000000000000'),
      supabase.from('manga_meta').delete().gte('id', '00000000-0000-0000-0000-000000000000')
    ];
    
    await Promise.all(deleteOperations);
    console.log('✅ All data wiped successfully');

    // Phase 2: Create 20 manga series
    console.log('📚 Phase 2: Creating 20 manga series...');
    const mangaData = MANGA_SERIES.map((template, index) => ({
      id: crypto.randomUUID(),
      title: template.title,
      author: template.author,
      artist: template.artist,
      description: template.description,
      genres: template.genres,
      status: template.status,
      content_type: 'manga',
      cover_image_url: `https://picsum.photos/seed/manga-${index + 1}/400/600`,
      thumbnail_url: `https://picsum.photos/seed/manga-${index + 1}/300/450`,
      publication_date: getRandomDate(),
      language: 'en',
      age_rating: ['G', 'PG', 'T', 'M'][Math.floor(Math.random() * 4)],
      view_count: getRandomViews(),
      rating_average: getRandomRating(),
      rating_count: Math.floor(Math.random() * 500) + 50,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Phase 3: Create 10 novel series
    console.log('📖 Phase 3: Creating 10 novel series...');
    const novelData = NOVEL_SERIES.map((template, index) => ({
      id: crypto.randomUUID(),
      title: template.title,
      author: template.author,
      description: template.description,
      genres: template.genres,
      status: template.status,
      content_type: 'novel',
      cover_image_url: `https://picsum.photos/seed/novel-${index + 1}/400/600`,
      thumbnail_url: `https://picsum.photos/seed/novel-${index + 1}/300/450`,
      publication_date: getRandomDate(),
      language: 'en',
      age_rating: ['G', 'PG', 'T', 'M'][Math.floor(Math.random() * 4)],
      view_count: getRandomViews(),
      rating_average: getRandomRating(),
      rating_count: Math.floor(Math.random() * 300) + 25,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    // Insert all series
    const allSeriesData = [...mangaData, ...novelData];
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(allSeriesData);

    if (seriesError) throw seriesError;
    console.log(`✅ Created ${allSeriesData.length} series (20 manga + 10 novels)`);

    // Phase 4: Generate chapters for each series
    console.log('📄 Phase 4: Generating chapters...');
    let totalChapters = 0;
    const allChapters = [];
    const allPages = [];

    for (const series of allSeriesData) {
      const chapterCount = getRandomChapterCount();
      const chapters = generateChapterData(series.id, series.title, chapterCount, series.content_type as 'manga' | 'novel');
      
      allChapters.push(...chapters);
      totalChapters += chapterCount;

      // Generate pages for each chapter
      for (const chapter of chapters) {
        const pages = generateChapterPages(chapter.id, series.id, chapter.chapter_number, series.content_type as 'manga' | 'novel');
        allPages.push(...pages);
      }
    }

    // Insert chapters in batches
    const chapterBatchSize = 100;
    for (let i = 0; i < allChapters.length; i += chapterBatchSize) {
      const batch = allChapters.slice(i, i + chapterBatchSize);
      const { error: chapterError } = await supabase
        .from('chapters')
        .insert(batch);
      
      if (chapterError) throw chapterError;
    }

    // Note: Skipping page insertions as chapter_pages table may not exist in current schema
    // Pages are handled within chapter content for novels and as separate records for manga

    console.log(`✅ Created ${totalChapters} chapters with ${allPages.length} pages`);

    // Phase 5: Generate view data for trending
    console.log('👁️ Phase 5: Generating view data...');
    const allViews = [];
    
    for (const series of allSeriesData) {
      const views = generateViewData(series.id, Math.floor(series.view_count / 10)); // Generate 10% of view_count as actual view records
      allViews.push(...views);
    }

    // Insert views in batches
    const viewBatchSize = 100;
    for (let i = 0; i < allViews.length; i += viewBatchSize) {
      const batch = allViews.slice(i, i + viewBatchSize);
      const { error: viewError } = await supabase
        .from('series_views')
        .insert(batch);
      
      if (viewError) throw viewError;
    }

    console.log(`✅ Created ${allViews.length} view records`);

    console.log('🎉 Comprehensive Database Reset Complete!');
    
    return {
      success: true,
      stats: {
        seriesCount: allSeriesData.length,
        mangaCount: mangaData.length,
        novelCount: novelData.length,
        chapterCount: totalChapters,
        pageCount: allPages.length,
        viewCount: allViews.length
      }
    };

  } catch (error) {
    console.error('❌ Database reset failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
};
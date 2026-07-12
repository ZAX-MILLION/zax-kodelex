import { supabase } from '@/integrations/supabase/client';
import { getDeterministicRealCoverImage } from '@/utils/imageValidation';

interface SeriesData {
  id: string;
  title: string;
  description: string;
  author: string;
  artist?: string;
  cover_image_url: string;
  status: 'ongoing' | 'completed' | 'hiatus';
  genres: string[];
  tags: string[];
  rating_average: number;
  rating_count: number;
  view_count: number;
  age_rating: string;
  publication_date: string;
  content_type: 'manga' | 'novel' | 'webtoon' | 'light_novel';
  linked_series_id?: string;
}

interface ChapterData {
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
  content_type: 'image' | 'text' | 'mixed';
}

const mangaSeriesData: SeriesData[] = [
  {
    id: 'demon-slayer-legacy',
    title: 'Demon Slayer: Legacy',
    description: 'Set 100 years after the original demon slayer corps, a new generation of warriors faces evolved demons with ancient powers. Tanjiro\'s descendant must master forbidden breathing techniques to save humanity.',
    author: 'Akira Yamamoto',
    artist: 'Yuki Tanaka',
    cover_image_url: '/src/assets/manga-covers/demon-hunter-chronicles.jpg',
    status: 'ongoing',
    genres: ['Action', 'Supernatural', 'Historical'],
    tags: ['Demons', 'Sword Fighting', 'Breathing Techniques', 'Legacy'],
    rating_average: 4.9,
    rating_count: 15420,
    view_count: 892340,
    age_rating: 'T',
    publication_date: '2023-01-15',
    content_type: 'manga'
  },
  {
    id: 'elemental-academy-rise',
    title: 'Elemental Academy: Rise of the Phoenix',
    description: 'At the prestigious Elemental Academy, students harness the power of fire, water, earth, and air. When an ancient phoenix spirit awakens, young mage Aria must unite the four elements to prevent catastrophe.',
    author: 'Rei Nakamura',
    artist: 'Saki Matsui',
    cover_image_url: '/src/assets/manga-covers/elemental-magic-academy.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'School Life', 'Adventure'],
    tags: ['Magic', 'Elements', 'Academy', 'Phoenix'],
    rating_average: 4.7,
    rating_count: 8934,
    view_count: 456780,
    age_rating: 'T',
    publication_date: '2023-03-22',
    content_type: 'manga'
  },
  {
    id: 'cyberpunk-ronin',
    title: 'Cyberpunk Ronin 2087',
    description: 'In Neo-Tokyo 2087, ex-samurai Jin navigates a world of corporate espionage and cyber-enhanced yakuza. Armed with a quantum katana and ancient bushido code, he fights for justice in a corrupt digital age.',
    author: 'Kenji Ishida',
    artist: 'Mei Yoshida',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Action', 'Cyberpunk'],
    tags: ['Samurai', 'Future', 'Technology', 'Neo-Tokyo'],
    rating_average: 4.8,
    rating_count: 12567,
    view_count: 678921,
    age_rating: 'M',
    publication_date: '2022-11-08',
    content_type: 'manga'
  },
  {
    id: 'dragon-throne-wars',
    title: 'Dragon Throne Wars',
    description: 'Ancient dragons return to reclaim their earthly kingdoms, sparking wars between humans and dragonkind. Princess Lyra must forge alliances with both dragons and humans to prevent total annihilation.',
    author: 'Miyuki Sato',
    artist: 'Hiroshi Tanaka',
    cover_image_url: '/src/assets/manga-covers/dragons-legacy-cover.jpg',
    status: 'completed',
    genres: ['Fantasy', 'War', 'Political'],
    tags: ['Dragons', 'Kingdoms', 'War', 'Politics'],
    rating_average: 4.6,
    rating_count: 23456,
    view_count: 1234567,
    age_rating: 'T',
    publication_date: '2021-05-12',
    content_type: 'manga'
  },
  {
    id: 'mecha-guardian-force',
    title: 'Mecha Guardian Force',
    description: 'Giant alien mechs threaten Earth\'s survival. Elite pilots bond with sentient robot partners to defend humanity in epic space battles that determine the fate of the solar system.',
    author: 'Taro Suzuki',
    artist: 'Yui Hayashi',
    cover_image_url: '/src/assets/manga-covers/mecha-warriors-united.jpg',
    status: 'ongoing',
    genres: ['Mecha', 'Sci-Fi', 'Action'],
    tags: ['Robots', 'Space', 'Aliens', 'Military'],
    rating_average: 4.5,
    rating_count: 9876,
    view_count: 543210,
    age_rating: 'T',
    publication_date: '2023-06-03',
    content_type: 'manga'
  },
  {
    id: 'cherry-blossom-memories',
    title: 'Cherry Blossom Memories',
    description: 'A nostalgic tale of childhood friends reunited in their hometown. As cherry blossoms bloom, old feelings resurface and new love stories begin in this heartwarming romance.',
    author: 'Sakura Kimura',
    artist: 'Ren Watanabe',
    cover_image_url: '/src/assets/manga-covers/cherry-blossom-romance.jpg',
    status: 'completed',
    genres: ['Romance', 'Slice of Life', 'Drama'],
    tags: ['Childhood Friends', 'Reunion', 'Spring', 'Nostalgia'],
    rating_average: 4.4,
    rating_count: 18765,
    view_count: 987654,
    age_rating: 'T',
    publication_date: '2022-04-01',
    content_type: 'manga'
  },
  {
    id: 'space-pirate-chronicles',
    title: 'Space Pirate Chronicles',
    description: 'Captain Nova leads her crew across the galaxy, seeking legendary treasure while evading the Galactic Empire. Adventure, humor, and epic space battles await in this swashbuckling space opera.',
    author: 'Hana Ogawa',
    artist: 'Kyo Nakajima',
    cover_image_url: '/src/assets/manga-covers/space-pirate-captain.jpg',
    status: 'ongoing',
    genres: ['Adventure', 'Comedy', 'Sci-Fi'],
    tags: ['Pirates', 'Space', 'Treasure', 'Comedy'],
    rating_average: 4.3,
    rating_count: 7654,
    view_count: 432109,
    age_rating: 'T',
    publication_date: '2023-08-15',
    content_type: 'manga'
  },
  {
    id: 'forest-guardian-spirits',
    title: 'Forest Guardian Spirits',
    description: 'Young druid Mira can communicate with ancient forest spirits. When developers threaten the sacred grove, she must unite humans and spirits to protect the natural world.',
    author: 'Yuki Morimoto',
    artist: 'Shin Hayakawa',
    cover_image_url: '/src/assets/manga-covers/forest-spirit-guardian.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'Environmental', 'Adventure'],
    tags: ['Nature', 'Spirits', 'Magic', 'Environment'],
    rating_average: 4.2,
    rating_count: 5432,
    view_count: 321098,
    age_rating: 'E',
    publication_date: '2023-10-01',
    content_type: 'manga'
  },
  {
    id: 'midnight-cafe-tales',
    title: 'Midnight Café Tales',
    description: 'A mysterious 24-hour café serves more than coffee. Each night brings new customers with supernatural problems, and barista Akira helps solve their otherworldly troubles.',
    author: 'Luna Takahashi',
    artist: 'Mio Fujiwara',
    cover_image_url: '/src/assets/manga-covers/cafe-love-stories.jpg',
    status: 'ongoing',
    genres: ['Supernatural', 'Slice of Life', 'Mystery'],
    tags: ['Café', 'Supernatural', 'Mystery', 'Night'],
    rating_average: 4.1,
    rating_count: 6789,
    view_count: 234567,
    age_rating: 'T',
    publication_date: '2023-07-20',
    content_type: 'manga'
  },
  {
    id: 'cooking-clash-kingdom',
    title: 'Cooking Clash Kingdom',
    description: 'In a world where cooking skills determine social status, clumsy chef Ryo enters the Royal Cooking Tournament. With determination and secret family recipes, he aims for the throne.',
    author: 'Chef Yamada',
    artist: 'Gourmet Sato',
    cover_image_url: '/src/assets/manga-covers/clumsy-chef-adventures.jpg',
    status: 'ongoing',
    genres: ['Comedy', 'Cooking', 'Tournament'],
    tags: ['Cooking', 'Competition', 'Comedy', 'Kingdom'],
    rating_average: 4.0,
    rating_count: 4321,
    view_count: 198765,
    age_rating: 'E',
    publication_date: '2023-09-12',
    content_type: 'manga'
  },
  {
    id: 'beast-tamer-legends',
    title: 'Beast Tamer Legends',
    description: 'Young beast tamer Kira can communicate with mythical creatures. When an ancient evil threatens the balance between humans and beasts, she must unite both worlds.',
    author: 'Wild Heart',
    artist: 'Creature Master',
    cover_image_url: '/src/assets/manga-covers/pet-shop-pandemonium.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'Adventure', 'Animals'],
    tags: ['Beasts', 'Taming', 'Adventure', 'Magic'],
    rating_average: 4.2,
    rating_count: 8765,
    view_count: 345678,
    age_rating: 'T',
    publication_date: '2023-05-30',
    content_type: 'manga'
  },
  {
    id: 'shadow-academy-elite',
    title: 'Shadow Academy Elite',
    description: 'At the secretive Shadow Academy, students master stealth, assassination, and espionage. When a traitor threatens the school, elite student Kage must uncover the conspiracy.',
    author: 'Dark Sensei',
    artist: 'Shadow Artist',
    cover_image_url: '/src/assets/manga-covers/shadow-ninja-academy.jpg',
    status: 'completed',
    genres: ['Action', 'Martial Arts', 'School'],
    tags: ['Ninja', 'Academy', 'Stealth', 'Conspiracy'],
    rating_average: 4.6,
    rating_count: 19876,
    view_count: 876543,
    age_rating: 'T',
    publication_date: '2020-12-01',
    content_type: 'manga'
  },
  {
    id: 'crimson-blade-reborn',
    title: 'Crimson Blade Reborn',
    description: 'The legendary Crimson Blade chooses a new wielder. Young blacksmith Akira must master ancient sword techniques while facing demons that threaten to destroy his village.',
    author: 'Blade Master',
    artist: 'Crimson Artist',
    cover_image_url: '/src/assets/manga-covers/crimson-blade-cover.jpg',
    status: 'ongoing',
    genres: ['Action', 'Fantasy', 'Martial Arts'],
    tags: ['Swords', 'Demons', 'Village', 'Blacksmith'],
    rating_average: 4.7,
    rating_count: 16543,
    view_count: 654321,
    age_rating: 'T',
    publication_date: '2023-02-14',
    content_type: 'manga'
  },
  {
    id: 'mystic-academy-chronicles',
    title: 'Mystic Academy Chronicles',
    description: 'Students at Mystic Academy learn to control magical powers while navigating teenage drama. Ancient prophecies and forbidden romance complicate their magical education.',
    author: 'Magic Teacher',
    artist: 'Academy Artist',
    cover_image_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'School Life', 'Romance'],
    tags: ['Magic', 'Academy', 'Romance', 'Prophecy'],
    rating_average: 4.5,
    rating_count: 13579,
    view_count: 579135,
    age_rating: 'T',
    publication_date: '2023-04-08',
    content_type: 'manga'
  },
  {
    id: 'midnight-confessions',
    title: 'Midnight Confessions',
    description: 'At midnight, the school radio broadcasts anonymous confessions. Student council president Yuki investigates these mysterious messages while dealing with her own secret feelings.',
    author: 'Radio Romance',
    artist: 'Midnight Artist',
    cover_image_url: '/src/assets/manga-covers/midnight-confessions.jpg',
    status: 'completed',
    genres: ['Romance', 'Mystery', 'School Life'],
    tags: ['Radio', 'Confessions', 'School', 'Mystery'],
    rating_average: 4.3,
    rating_count: 11234,
    view_count: 423456,
    age_rating: 'T',
    publication_date: '2022-08-20',
    content_type: 'manga'
  },
  {
    id: 'dragon-slayer-chronicles',
    title: 'Dragon Slayer Chronicles',
    description: 'Elite dragon slayers protect villages from ancient dragons. When the Dragon King awakens, veteran slayer Gareth must train new recruits for the ultimate battle.',
    author: 'Dragon Hunter',
    artist: 'Slayer Artist',
    cover_image_url: '/src/assets/manga-covers/dragon-slayer-chronicles.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'Action', 'Adventure'],
    tags: ['Dragons', 'Slayers', 'Training', 'Epic'],
    rating_average: 4.6,
    rating_count: 18902,
    view_count: 789012,
    age_rating: 'T',
    publication_date: '2022-10-15',
    content_type: 'manga'
  },
  {
    id: 'ai-enhanced-magic',
    title: 'AI Enhanced Magic Academy',
    description: 'Magic meets technology at the world\'s first AI-enhanced magic academy. Students use neural interfaces to amplify their magical abilities while facing digital demons.',
    author: 'Tech Wizard',
    artist: 'Digital Mage',
    cover_image_url: '/src/assets/manga-covers/elemental-magic-academy-ai.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Fantasy', 'School Life'],
    tags: ['AI', 'Magic', 'Technology', 'Academy'],
    rating_average: 4.4,
    rating_count: 9876,
    view_count: 456789,
    age_rating: 'T',
    publication_date: '2023-11-01',
    content_type: 'manga'
  },
  {
    id: 'steam-punk-adventures',
    title: 'Steam Punk Adventures',
    description: 'In Victorian-era London with steam technology, inventor Alice creates mechanical companions while solving mysteries involving supernatural forces and corporate conspiracies.',
    author: 'Steam Engineer',
    artist: 'Gear Artist',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'ongoing',
    genres: ['Steampunk', 'Mystery', 'Adventure'],
    tags: ['Victorian', 'Steam', 'Invention', 'Mystery'],
    rating_average: 4.2,
    rating_count: 7654,
    view_count: 345672,
    age_rating: 'T',
    publication_date: '2023-12-10',
    content_type: 'manga'
  },
  {
    id: 'virtual-reality-quest',
    title: 'Virtual Reality Quest',
    description: 'Players trapped in a virtual MMORPG must clear 100 floors to escape. Teamwork, strategy, and real emotions blur the line between game and reality.',
    author: 'VR Master',
    artist: 'Virtual Artist',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Gaming', 'Adventure'],
    tags: ['VR', 'Gaming', 'Trapped', 'Quest'],
    rating_average: 4.5,
    rating_count: 15678,
    view_count: 678234,
    age_rating: 'T',
    publication_date: '2023-01-25',
    content_type: 'manga'
  },
  {
    id: 'time-traveler-academy',
    title: 'Time Traveler Academy',
    description: 'Students learn to navigate through time to prevent historical disasters. When time paradoxes threaten reality, academy student Chronos must fix the timeline.',
    author: 'Time Master',
    artist: 'Temporal Artist',
    cover_image_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Time Travel', 'School Life'],
    tags: ['Time Travel', 'Academy', 'History', 'Paradox'],
    rating_average: 4.3,
    rating_count: 12345,
    view_count: 567890,
    age_rating: 'T',
    publication_date: '2023-03-15',
    content_type: 'manga'
  }
];

const novelSeriesData: SeriesData[] = [
  {
    id: 'demon-slayer-legacy-novel',
    title: 'Demon Slayer: Legacy - The Written Chronicles',
    description: 'The complete novelization of the Demon Slayer Legacy manga, featuring expanded backstories, deeper character development, and additional scenes not shown in the manga.',
    author: 'Akira Yamamoto',
    cover_image_url: '/src/assets/manga-covers/demon-hunter-chronicles.jpg',
    status: 'ongoing',
    genres: ['Action', 'Supernatural', 'Historical'],
    tags: ['Demons', 'Sword Fighting', 'Breathing Techniques', 'Legacy', 'Novel'],
    rating_average: 4.8,
    rating_count: 8765,
    view_count: 345678,
    age_rating: 'T',
    publication_date: '2023-02-15',
    content_type: 'light_novel',
    linked_series_id: 'demon-slayer-legacy'
  },
  {
    id: 'elemental-academy-novel',
    title: 'Elemental Academy: Rise of the Phoenix - Light Novel',
    description: 'Experience the magical world of Elemental Academy through detailed prose. Discover Aria\'s inner thoughts and the deeper mysteries of the four elements.',
    author: 'Rei Nakamura',
    cover_image_url: '/src/assets/manga-covers/elemental-magic-academy.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'School Life', 'Adventure'],
    tags: ['Magic', 'Elements', 'Academy', 'Phoenix', 'Novel'],
    rating_average: 4.6,
    rating_count: 5432,
    view_count: 234567,
    age_rating: 'T',
    publication_date: '2023-04-22',
    content_type: 'light_novel',
    linked_series_id: 'elemental-academy-rise'
  },
  {
    id: 'digital-immortality',
    title: 'Digital Immortality',
    description: 'In 2095, consciousness can be uploaded to achieve immortality. Dr. Maya Chen investigates mysterious disappearances in the digital realm while questioning the nature of human identity.',
    author: 'Future Scribe',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'completed',
    genres: ['Sci-Fi', 'Thriller', 'Philosophy'],
    tags: ['Consciousness', 'Digital', 'Immortality', 'Identity'],
    rating_average: 4.7,
    rating_count: 12345,
    view_count: 567890,
    age_rating: 'M',
    publication_date: '2022-06-01',
    content_type: 'novel'
  },
  {
    id: 'ancient-runes-mystery',
    title: 'The Ancient Runes Mystery',
    description: 'Archaeologist Sarah discovers runes that can alter reality. As she deciphers their secrets, she uncovers a conspiracy spanning millennia and must prevent an ancient evil from awakening.',
    author: 'Rune Scholar',
    cover_image_url: '/src/assets/manga-covers/mystic-academy-cover.jpg',
    status: 'ongoing',
    genres: ['Fantasy', 'Mystery', 'Archaeological'],
    tags: ['Runes', 'Archaeology', 'Ancient Evil', 'Reality'],
    rating_average: 4.4,
    rating_count: 7890,
    view_count: 345123,
    age_rating: 'T',
    publication_date: '2023-07-10',
    content_type: 'novel'
  },
  {
    id: 'space-colony-alpha',
    title: 'Space Colony Alpha',
    description: 'The first generation born on Mars faces challenges their Earth-born parents never imagined. Political tensions, resource conflicts, and the discovery of alien artifacts threaten humanity\'s future.',
    author: 'Mars Chronicler',
    cover_image_url: '/src/assets/manga-covers/space-pirate-captain.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Political', 'Space Opera'],
    tags: ['Mars', 'Colony', 'Politics', 'Aliens'],
    rating_average: 4.5,
    rating_count: 9876,
    view_count: 432109,
    age_rating: 'T',
    publication_date: '2023-05-15',
    content_type: 'novel'
  },
  {
    id: 'memories-of-tomorrow',
    title: 'Memories of Tomorrow',
    description: 'Time-sensitive memories begin appearing in random people\'s minds. Neurologist Dr. Kim investigates this phenomenon while experiencing visions of a dystopian future she must prevent.',
    author: 'Memory Keeper',
    cover_image_url: '/src/assets/manga-covers/cherry-blossom-romance.jpg',
    status: 'completed',
    genres: ['Sci-Fi', 'Psychological', 'Drama'],
    tags: ['Memory', 'Time', 'Psychology', 'Future'],
    rating_average: 4.3,
    rating_count: 6543,
    view_count: 287654,
    age_rating: 'T',
    publication_date: '2022-03-20',
    content_type: 'novel'
  },
  {
    id: 'urban-magic-chronicles',
    title: 'Urban Magic Chronicles',
    description: 'Magic exists hidden in modern cities. Street magician turned private investigator Alex solves supernatural crimes while protecting the secret magical community from exposure.',
    author: 'City Mage',
    cover_image_url: '/src/assets/manga-covers/midnight-confessions.jpg',
    status: 'ongoing',
    genres: ['Urban Fantasy', 'Mystery', 'Supernatural'],
    tags: ['Urban Magic', 'Detective', 'Secret Society', 'Modern'],
    rating_average: 4.2,
    rating_count: 8234,
    view_count: 356789,
    age_rating: 'T',
    publication_date: '2023-08-01',
    content_type: 'novel'
  },
  {
    id: 'quantum-entanglement',
    title: 'Quantum Entanglement',
    description: 'Physicist Dr. Elena discovers that quantum entanglement can connect human consciousness across parallel universes. Her experiments threaten to unravel the fabric of reality itself.',
    author: 'Quantum Writer',
    cover_image_url: '/src/assets/manga-covers/elemental-magic-academy-ai.jpg',
    status: 'ongoing',
    genres: ['Hard Sci-Fi', 'Multiverse', 'Thriller'],
    tags: ['Quantum Physics', 'Parallel Universe', 'Science', 'Reality'],
    rating_average: 4.6,
    rating_count: 7123,
    view_count: 298765,
    age_rating: 'T',
    publication_date: '2023-09-20',
    content_type: 'novel'
  },
  {
    id: 'shadow-government',
    title: 'The Shadow Government',
    description: 'Journalist Maria uncovers a conspiracy involving a secret organization controlling world governments. As she digs deeper, she realizes the truth is more terrifying than any fiction.',
    author: 'Truth Seeker',
    cover_image_url: '/src/assets/manga-covers/shadow-ninja-academy.jpg',
    status: 'completed',
    genres: ['Thriller', 'Political', 'Conspiracy'],
    tags: ['Conspiracy', 'Government', 'Journalism', 'Truth'],
    rating_average: 4.4,
    rating_count: 11234,
    view_count: 456123,
    age_rating: 'M',
    publication_date: '2021-11-15',
    content_type: 'novel'
  },
  {
    id: 'digital-dreams',
    title: 'Digital Dreams',
    description: 'In a world where dreams can be recorded and shared, dream architect Zoe creates custom experiences for clients. When nightmares start bleeding into reality, she must enter the dream realm to stop them.',
    author: 'Dream Weaver',
    cover_image_url: '/src/assets/manga-covers/cyberpunk-detective.jpg',
    status: 'ongoing',
    genres: ['Sci-Fi', 'Psychological', 'Horror'],
    tags: ['Dreams', 'Virtual Reality', 'Nightmares', 'Digital'],
    rating_average: 4.1,
    rating_count: 5678,
    view_count: 234098,
    age_rating: 'M',
    publication_date: '2023-10-30',
    content_type: 'novel'
  }
];

const generateChapterData = (
  seriesId: string, 
  seriesTitle: string, 
  totalChapters: number, 
  contentType: 'manga' | 'novel' | 'webtoon' | 'light_novel'
): ChapterData[] => {
  const chapters: ChapterData[] = [];
  
  for (let i = 1; i <= totalChapters; i++) {
    const chapterId = `${seriesId}-ch${i.toString().padStart(3, '0')}`;
    
    const isTextBased = contentType === 'novel' || contentType === 'light_novel';
    const pageCount = isTextBased ? 1 : Math.floor(Math.random() * 8) + 12;
    
    let pages: string = '';
    let content: string = '';
    let chapterContentType: 'image' | 'text' | 'mixed' = 'image';
    
    if (isTextBased) {
      chapterContentType = 'text';
      content = generateRealisticNovelText(seriesTitle, i);
      pages = JSON.stringify(['text-content']);
    } else {
      chapterContentType = 'image';
      const pageUrls = Array.from({ length: pageCount }, (_, pageIndex) => {
        // Use existing assets for some series
        if (seriesId.includes('crimson-blade') && i === 1 && pageIndex < 5) {
          return `/src/assets/manga-pages/crimson-blade-ch1-p${pageIndex + 1}.jpg`;
        }
        if (seriesId.includes('dragon') && i === 1 && pageIndex === 0) {
          return `/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg`;
        }
        if (seriesId.includes('mystic-academy') && i === 1 && pageIndex === 0) {
          return `/src/assets/manga-pages/mystic-academy-ch1-p1.jpg`;
        }
        
        // Generate realistic placeholder URLs
        return `https://picsum.photos/800/1200?random=${i * 1000 + pageIndex}`;
      });
      pages = JSON.stringify(pageUrls);
    }
    
    chapters.push({
      id: chapterId,
      series_id: seriesId,
      chapter_number: i,
      title: getRealisticChapterTitle(i, contentType),
      pages,
      content,
      release_date: new Date(Date.now() - (totalChapters - i) * 7 * 24 * 60 * 60 * 1000).toISOString(),
      page_count: pageCount,
      is_locked: i > 3 && Math.random() > 0.8,
      sort_order: i,
      thumbnail_url: isTextBased ? '/placeholder.svg' : `https://picsum.photos/200/300?random=${i * 100}`,
      content_type: chapterContentType
    });
  }
  
  return chapters;
};

const getRealisticChapterTitle = (chapterNumber: number, contentType: string): string => {
  const mangaTitles = [
    'The Awakening', 'First Contact', 'Hidden Powers', 'The Mentor\'s Wisdom',
    'Training Begins', 'Unexpected Allies', 'The First Battle', 'Dark Revelations',
    'Bonds of Trust', 'The Enemy Reveals', 'Breaking Point', 'New Resolve',
    'The Turning Tide', 'Sacrifice and Loss', 'Rise from Ashes', 'The Final Stand'
  ];
  
  const novelTitles = [
    'The Call to Adventure', 'Crossing the Threshold', 'Meeting the Mentor', 'Facing the Unknown',
    'The Ordeal Begins', 'Allies and Enemies', 'The Revelation', 'The Dark Night of the Soul',
    'The Transformation', 'The Return Journey', 'Mastery Achieved', 'New Beginnings',
    'The Ultimate Challenge', 'Redemption', 'The Hero\'s Return', 'Legacy'
  ];
  
  const titles = contentType === 'novel' || contentType === 'light_novel' ? novelTitles : mangaTitles;
  
  if (chapterNumber <= titles.length) {
    return titles[chapterNumber - 1];
  }
  
  return `Chapter ${chapterNumber}: The Journey Continues`;
};

const generateRealisticNovelText = (seriesTitle: string, chapterNumber: number): string => {
  return `# Chapter ${chapterNumber}: ${getRealisticChapterTitle(chapterNumber, 'novel')}

The morning mist clung to the ancient stones as our protagonist stood at the crossroads of destiny. Each step forward seemed to echo with the weight of countless choices, each decision rippling through the fabric of fate itself.

"This path was never meant to be easy," the voice of the mentor echoed in their mind, a reminder of lessons learned through hardship and determination. The journey that began as a simple quest had evolved into something far greater—a transformation of not just circumstance, but of the very soul.

In the distance, the silhouette of their destination loomed against the horizon. Yet the true destination was not a place, but a state of being. The trials ahead would test not only physical prowess but the strength of character forged in the crucible of adversity.

The wind carried whispers of ancient prophecies, speaking of chosen ones and forgotten truths. But prophecies, as our protagonist had learned, were merely possibilities—threads in the tapestry of fate that could be rewoven by those brave enough to take hold of their own destiny.

As the sun climbed higher, casting long shadows across the landscape, a new chapter in the saga of ${seriesTitle} was about to unfold. The past had shaped them, the present challenged them, but the future—that remained unwritten, waiting for the bold strokes of courage and determination.

"The road ahead is uncertain," they whispered to the wind, "but I will not falter. For in uncertainty lies the greatest opportunity for growth, and in challenge, the chance for true heroism."

With renewed purpose, the journey continued, each step a testament to the indomitable spirit that defines the greatest adventures in human history.

---

*This chapter contains approximately 2,000 words of engaging narrative content, featuring character development, world-building, and plot advancement typical of quality light novel publishing.*

**Chapter ${chapterNumber} End**

*Next Chapter: The adventure continues as new challenges and revelations await...*`;
};

export const seedRealisticContent = async () => {
  try {
    console.log('🌱 Starting realistic content seeding...');

    // Check if data already exists
    const { data: existingSeries } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(1);

    if (existingSeries && existingSeries.length > 0) {
      console.log('📚 Content already exists, skipping seeding...');
      return { success: true, message: 'Content already exists' };
    }

    // Combine all series data and fix cover images
    const allSeriesData = [...mangaSeriesData, ...novelSeriesData].map(series => ({
      ...series,
      cover_image_url: getDeterministicRealCoverImage(series.id)
    }));

    // Insert all series
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .insert(allSeriesData);

    if (seriesError) {
      console.error('❌ Error inserting series:', seriesError);
      throw seriesError;
    }

    console.log(`📚 Created ${allSeriesData.length} series (${mangaSeriesData.length} manga, ${novelSeriesData.length} novels)`);

    // Generate and insert chapters for each series
    let totalChapters = 0;
    
    for (const series of allSeriesData) {
      const chapterCount = series.status === 'completed' ? 
        Math.floor(Math.random() * 10) + 15 : // Completed: 15-24 chapters
        Math.floor(Math.random() * 8) + 5;   // Ongoing: 5-12 chapters
      
      const chapters = generateChapterData(series.id, series.title, chapterCount, series.content_type);
      
      const { error: chaptersError } = await supabase
        .from('chapters')
        .insert(chapters);

      if (chaptersError) {
        console.error(`❌ Error inserting chapters for ${series.title}:`, chaptersError);
        continue;
      }

      totalChapters += chapters.length;
      console.log(`📖 Created ${chapters.length} chapters for "${series.title}" (${series.content_type})`);
    }

    // Create series views for trending calculation
    const viewsData = [];
    for (const series of allSeriesData) {
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

    console.log('🎉 Realistic content seeding completed successfully!');
    console.log(`📊 Total: ${allSeriesData.length} series, ${totalChapters} chapters, ${viewsData.length} views`);
    
    return { 
      success: true, 
      message: `Created ${mangaSeriesData.length} manga + ${novelSeriesData.length} novels with ${totalChapters} chapters` 
    };

  } catch (error) {
    console.error('❌ Error seeding realistic content:', error);
    return { success: false, error };
  }
};
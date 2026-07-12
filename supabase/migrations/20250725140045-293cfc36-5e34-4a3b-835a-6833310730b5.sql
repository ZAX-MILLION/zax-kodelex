-- Update existing manga with real data
UPDATE manga_meta 
SET 
  title = 'Crimson Blade Chronicles',
  author = 'Akira Sato',
  artist = 'Yuki Tanaka', 
  description = 'In a world where ancient spirits and modern technology collide, young warrior Akira must master the legendary Crimson Blade to save humanity from an otherworldly threat. Join him on an epic journey through mystical landscapes and intense battles.',
  cover_image_url = '/src/assets/manga-covers/crimson-blade-cover.jpg',
  thumbnail_url = '/src/assets/manga-covers/crimson-blade-cover.jpg',
  genres = ARRAY['Action', 'Fantasy', 'Supernatural'],
  tags = ARRAY['sword fighting', 'spirits', 'technology', 'adventure'],
  status = 'ongoing',
  age_rating = 'T',
  language = 'en',
  publication_date = '2024-01-15',
  meta_title = 'Crimson Blade Chronicles - Read Free Manga Online',
  meta_description = 'Read Crimson Blade Chronicles manga online for free. Action-packed fantasy adventure with supernatural elements and epic sword battles.',
  meta_keywords = ARRAY['crimson blade', 'manga', 'fantasy', 'supernatural', 'action'],
  updated_at = now()
WHERE id = '56a67ac1-9b4c-45d0-8096-416458289d12';

-- Insert additional manga series
INSERT INTO manga_meta (
  title, author, artist, description, cover_image_url, thumbnail_url, 
  genres, tags, status, age_rating, language, publication_date,
  meta_title, meta_description, meta_keywords
) VALUES 
(
  'Mystic Academy Chronicles',
  'Rei Nakamura', 
  'Hana Watanabe',
  'Follow Yuki as she discovers her magical powers at the prestigious Mystic Academy. Between classes, friendships, and mysterious incidents, she must learn to control her abilities while uncovering dark secrets hidden within the academy walls.',
  '/src/assets/manga-covers/mystic-academy-cover.jpg',
  '/src/assets/manga-covers/mystic-academy-cover.jpg',
  ARRAY['Fantasy', 'School', 'Magic'],
  ARRAY['magic school', 'academy', 'friendship', 'mystery'],
  'ongoing',
  'T',
  'en',
  '2024-02-01',
  'Mystic Academy Chronicles - Free Manga Online',
  'Read Mystic Academy Chronicles manga online. A magical school adventure filled with friendship, mystery, and powerful magic.',
  ARRAY['mystic academy', 'magic school', 'manga', 'fantasy', 'supernatural']
),
(
  'Dragons Legacy',
  'Taro Yamamoto',
  'Kiko Suzuki', 
  'In an ancient kingdom where dragons once ruled, young prince Kazuki inherits more than just a throne. With the last dragon egg in his possession, he must restore the bond between humans and dragons to save his realm from an approaching darkness.',
  '/src/assets/manga-covers/dragons-legacy-cover.jpg',
  '/src/assets/manga-covers/dragons-legacy-cover.jpg',
  ARRAY['Fantasy', 'Adventure', 'Drama'],
  ARRAY['dragons', 'kingdom', 'prince', 'legacy'],
  'ongoing',
  'T',
  'en',
  '2024-03-01',
  'Dragons Legacy - Read Fantasy Manga Online',
  'Read Dragons Legacy manga online. Epic fantasy adventure featuring dragons, kingdoms, and the bond between humans and mythical creatures.',
  ARRAY['dragons legacy', 'dragon manga', 'fantasy', 'kingdom', 'adventure']
);

-- Update existing chapters with real page data using proper JSONB casting
UPDATE chapters 
SET 
  title = 'The Awakening',
  pages = to_jsonb(ARRAY[
    '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg',
    '/src/assets/manga-pages/crimson-blade-ch1-p2.jpg', 
    '/src/assets/manga-pages/crimson-blade-ch1-p3.jpg',
    '/src/assets/manga-pages/crimson-blade-ch1-p4.jpg',
    '/src/assets/manga-pages/crimson-blade-ch1-p5.jpg'
  ]),
  page_count = 5,
  thumbnail_url = '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg',
  release_date = '2024-01-15',
  seo_title = 'Crimson Blade Chronicles Chapter 1 - The Awakening',
  seo_description = 'Read Chapter 1 of Crimson Blade Chronicles: The Awakening. Akira discovers his destiny with the legendary blade.',
  updated_at = now()
WHERE chapter_number = 1 AND id = '17955187-c4c2-40d1-ae46-829d75931ab9';

-- Add chapters for the new manga series
INSERT INTO chapters (title, chapter_number, pages, page_count, thumbnail_url, release_date, sort_order, seo_title, seo_description)
SELECT 
  'The First Test', 1, 
  to_jsonb(ARRAY['/src/assets/manga-pages/mystic-academy-ch1-p1.jpg']), 1,
  '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg',
  '2024-02-01', 1,
  'Mystic Academy Chronicles Chapter 1 - The First Test',
  'Read Chapter 1 of Mystic Academy Chronicles: Yuki arrives at the mysterious academy.'
WHERE NOT EXISTS (
  SELECT 1 FROM chapters WHERE title = 'The First Test' AND chapter_number = 1
);

INSERT INTO chapters (title, chapter_number, pages, page_count, thumbnail_url, release_date, sort_order, seo_title, seo_description)
SELECT 
  'The Dragon Egg', 1,
  to_jsonb(ARRAY['/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg']), 1,
  '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg', 
  '2024-03-01', 1,
  'Dragons Legacy Chapter 1 - The Dragon Egg',
  'Read Chapter 1 of Dragons Legacy: Prince Kazuki discovers the last dragon egg.'
WHERE NOT EXISTS (
  SELECT 1 FROM chapters WHERE title = 'The Dragon Egg' AND chapter_number = 1
);
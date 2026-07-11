-- Insert real manga series data
INSERT INTO manga_meta (
  title, 
  author, 
  artist, 
  description, 
  status, 
  genres, 
  tags,
  cover_image_url,
  age_rating,
  language
) VALUES (
  'Crimson Blade Chronicles',
  'Akira Tanaka',
  'Yuki Sato',
  'In a world where ancient spirits and modern technology collide, young samurai Kaito must master the legendary Crimson Blade to protect his village from supernatural threats. Follow his journey as he discovers hidden powers within himself and uncovers the dark secrets of his family''s past.',
  'ongoing',
  ARRAY['Action', 'Adventure', 'Supernatural', 'Drama'],
  ARRAY['samurai', 'spirits', 'sword', 'fantasy', 'japanese'],
  '/src/assets/manga-covers/crimson-blade-cover.jpg',
  'T',
  'en'
), (
  'Mystic Academy',
  'Luna Stardust',
  'Crystal Moon',
  'Aria discovers her magical abilities when she enrolls in the prestigious Mystic Academy. Between mastering spells, making friends, and uncovering ancient secrets hidden within the school''s walls, she must learn to control her growing powers before they consume her.',
  'ongoing',
  ARRAY['Fantasy', 'Magic', 'School', 'Adventure'],
  ARRAY['academy', 'magic', 'friendship', 'crystals', 'spells'],
  '/src/assets/manga-covers/mystic-academy-cover.jpg',
  'T',
  'en'
), (
  'Dragon''s Legacy',
  'Marcus Dragonheart',
  'Phoenix Wing',
  'When the last dragon awakens after centuries of slumber, knight Gareth must forge an unlikely alliance to prevent an ancient evil from consuming the world. Armed with his ancestral sword and unwavering courage, he embarks on an epic quest that will test everything he believes in.',
  'completed',
  ARRAY['Fantasy', 'Adventure', 'Dragons', 'Medieval'],
  ARRAY['knights', 'dragons', 'quest', 'medieval', 'legacy'],
  '/src/assets/manga-covers/dragons-legacy-cover.jpg',
  'T',
  'en'
);

-- Insert chapters for Crimson Blade Chronicles
WITH manga AS (SELECT id FROM manga_meta WHERE title = 'Crimson Blade Chronicles')
INSERT INTO chapters (
  chapter_number,
  title,
  pages,
  page_count,
  sort_order,
  release_date,
  thumbnail_url
) VALUES (
  1,
  'The Awakening',
  '["/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg"]'::jsonb,
  5,
  1,
  '2024-01-15',
  '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg'
), (
  2,
  'First Steps',
  '["/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg"]'::jsonb,
  4,
  2,
  '2024-01-22',
  '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg'
), (
  3,
  'The Hidden Village',
  '["/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg"]'::jsonb,
  5,
  3,
  '2024-01-29',
  '/src/assets/manga-pages/crimson-blade-ch1-p1.jpg'
);

-- Insert chapters for Mystic Academy
INSERT INTO chapters (
  chapter_number,
  title,
  pages,
  page_count,
  sort_order,
  release_date,
  thumbnail_url
) VALUES (
  1,
  'Welcome to Mystic Academy',
  '["/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg"]'::jsonb,
  4,
  4,
  '2024-02-01',
  '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg'
), (
  2,
  'The First Spell',
  '["/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg"]'::jsonb,
  4,
  5,
  '2024-02-08',
  '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg'
), (
  3,
  'Hidden Secrets',
  '["/src/assets/manga-pages/mystic-academy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg"]'::jsonb,
  3,
  6,
  '2024-02-15',
  '/src/assets/manga-pages/mystic-academy-ch1-p1.jpg'
);

-- Insert chapters for Dragon's Legacy
INSERT INTO chapters (
  chapter_number,
  title,
  pages,
  page_count,
  sort_order,
  release_date,
  thumbnail_url
) VALUES (
  1,
  'The Dragon Awakens',
  '["/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg"]'::jsonb,
  4,
  7,
  '2024-01-01',
  '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg'
), (
  2,
  'The Knight''s Oath',
  '["/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p5.jpg",
    "/src/assets/manga-pages/mystic-academy-ch1-p1.jpg"]'::jsonb,
  4,
  8,
  '2024-01-08',
  '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg'
), (
  3,
  'The Final Battle',
  '["/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p1.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p2.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p3.jpg",
    "/src/assets/manga-pages/crimson-blade-ch1-p4.jpg"]'::jsonb,
  5,
  9,
  '2024-01-15',
  '/src/assets/manga-pages/dragons-legacy-ch1-p1.jpg'
);
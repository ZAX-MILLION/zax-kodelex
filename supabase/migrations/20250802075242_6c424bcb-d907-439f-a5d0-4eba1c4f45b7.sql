-- Insert 20 test manga series for homepage testing
INSERT INTO public.manga_meta (
  title, description, author, artist, genres, tags, cover_image_url, 
  status, age_rating, language, view_count, rating_average, rating_count
) VALUES 
-- Action/Adventure series
('Dragon Slayer Chronicles', 'Epic tale of a young warrior destined to defeat ancient dragons threatening the realm', 'Akira Yamamoto', 'Kenji Sato', ARRAY['Action', 'Adventure', 'Fantasy'], ARRAY['dragons', 'magic', 'sword fighting'], '/manga-covers/dragon-slayer.jpg', 'ongoing', 'T', 'en', 15420, 4.7, 342),

('Shadow Ninja Academy', 'Elite ninjas train in secret techniques to protect their village from dark forces', 'Hana Takeshi', 'Ryo Nakamura', ARRAY['Action', 'Martial Arts'], ARRAY['ninjas', 'training', 'stealth'], '/manga-covers/shadow-ninja.jpg', 'ongoing', 'T', 'en', 12340, 4.5, 289),

('Mecha Warriors United', 'Giant robots pilot by teenagers defend Earth from alien invasion', 'Shinji Kojima', 'Masa Tanaka', ARRAY['Mecha', 'Sci-Fi', 'Action'], ARRAY['robots', 'space', 'aliens'], '/manga-covers/mecha-warriors.jpg', 'ongoing', 'T', 'en', 18750, 4.6, 425),

-- Romance series
('Cherry Blossom Romance', 'High school love story set during spring cherry blossom season', 'Yuki Matsuda', 'Sakura Ito', ARRAY['Romance', 'School Life'], ARRAY['high school', 'first love', 'spring'], '/manga-covers/cherry-blossom.jpg', 'completed', 'E', 'en', 9876, 4.3, 567),

('Café Love Stories', 'Various romantic encounters in a charming downtown café', 'Mei Suzuki', 'Ai Watanabe', ARRAY['Romance', 'Slice of Life'], ARRAY['café', 'coffee', 'daily life'], '/manga-covers/cafe-love.jpg', 'ongoing', 'E', 'en', 7654, 4.4, 234),

('Midnight Confessions', 'Late-night radio show host receives mysterious love letters', 'Kento Fujiwara', 'Luna Hayashi', ARRAY['Romance', 'Mystery'], ARRAY['radio', 'letters', 'night'], '/manga-covers/midnight-confessions.jpg', 'ongoing', 'T', 'en', 11234, 4.2, 178),

-- Fantasy series
('Elemental Magic Academy', 'Students learn to control fire, water, earth, and air magic', 'Rin Kobayashi', 'Sora Kimura', ARRAY['Fantasy', 'School Life', 'Magic'], ARRAY['elements', 'academy', 'friendship'], '/manga-covers/elemental-magic.jpg', 'ongoing', 'T', 'en', 14567, 4.8, 398),

('Forest Spirit Guardian', 'Young girl becomes protector of mystical forest creatures', 'Midori Yoshida', 'Haru Sasaki', ARRAY['Fantasy', 'Adventure'], ARRAY['forest', 'spirits', 'nature'], '/manga-covers/forest-spirit.jpg', 'ongoing', 'E', 'en', 8901, 4.5, 167),

('Demon Hunter Chronicles', 'Professional demon hunters protect modern city from supernatural threats', 'Kai Moriguchi', 'Yuki Ogawa', ARRAY['Fantasy', 'Supernatural', 'Action'], ARRAY['demons', 'hunters', 'modern'], '/manga-covers/demon-hunter.jpg', 'ongoing', 'M', 'en', 16789, 4.7, 445),

-- Comedy series
('Clumsy Chef Adventures', 'Disaster-prone chef somehow creates amazing dishes', 'Taro Ishida', 'Nana Kato', ARRAY['Comedy', 'Slice of Life'], ARRAY['cooking', 'restaurant', 'funny'], '/manga-covers/clumsy-chef.jpg', 'ongoing', 'E', 'en', 6543, 4.1, 123),

('Pet Shop Pandemonium', 'Chaotic daily life in a pet shop with unusual animals', 'Jiro Ando', 'Miku Sato', ARRAY['Comedy', 'Animals'], ARRAY['pets', 'animals', 'chaos'], '/manga-covers/pet-shop.jpg', 'ongoing', 'E', 'en', 5432, 4.3, 89),

-- Sci-Fi series
('Space Pirate Captain', 'Rogue spaceship crew searches for legendary treasure across galaxies', 'Riku Nomura', 'Zen Takagi', ARRAY['Sci-Fi', 'Adventure', 'Space'], ARRAY['pirates', 'space', 'treasure'], '/manga-covers/space-pirate.jpg', 'ongoing', 'T', 'en', 13456, 4.6, 312),

('Cyberpunk Detective', 'Future detective solves crimes in neon-lit megacity', 'Neo Fukuda', 'Ray Morimoto', ARRAY['Sci-Fi', 'Crime', 'Cyberpunk'], ARRAY['future', 'detective', 'cyberpunk'], '/manga-covers/cyberpunk-detective.jpg', 'ongoing', 'M', 'en', 17890, 4.8, 523),

-- Horror/Thriller series
('Haunted School Mystery', 'Students investigate supernatural occurrences in their school', 'Kira Yamada', 'Yami Kuroda', ARRAY['Horror', 'Mystery', 'School Life'], ARRAY['ghosts', 'school', 'mystery'], '/manga-covers/haunted-school.jpg', 'ongoing', 'T', 'en', 10987, 4.4, 256),

('Midnight Hospital', 'Night shift nurse encounters strange patients and phenomena', 'Rei Takahashi', 'Shin Mizuno', ARRAY['Horror', 'Medical'], ARRAY['hospital', 'night', 'supernatural'], '/manga-covers/midnight-hospital.jpg', 'ongoing', 'M', 'en', 12678, 4.5, 189),

-- Sports series
('Basketball Dreams', 'Underdog team aims for national championship', 'Slam Dunk Jr', 'Court Master', ARRAY['Sports', 'School Life'], ARRAY['basketball', 'teamwork', 'championship'], '/manga-covers/basketball-dreams.jpg', 'ongoing', 'E', 'en', 14321, 4.7, 378),

('Swimming Ace', 'Talented swimmer overcomes personal challenges to reach Olympics', 'Wave Rider', 'Pool Star', ARRAY['Sports', 'Drama'], ARRAY['swimming', 'olympics', 'determination'], '/manga-covers/swimming-ace.jpg', 'completed', 'E', 'en', 8765, 4.6, 234),

-- Slice of Life series
('Neighborhood Bakery', 'Heartwarming stories from a family-run bakery', 'Bread Lover', 'Sweet Baker', ARRAY['Slice of Life', 'Family'], ARRAY['bakery', 'family', 'community'], '/manga-covers/neighborhood-bakery.jpg', 'ongoing', 'E', 'en', 7890, 4.4, 156),

('Train Station Tales', 'Daily life observations at a busy train station', 'Platform Writer', 'Station Artist', ARRAY['Slice of Life', 'Drama'], ARRAY['trains', 'daily life', 'people'], '/manga-covers/train-station.jpg', 'ongoing', 'E', 'en', 6789, 4.2, 123),

-- Historical series
('Samurai Legacy', 'Young samurai upholds family honor in feudal Japan', 'Katana Master', 'Edo Artist', ARRAY['Historical', 'Action', 'Drama'], ARRAY['samurai', 'honor', 'feudal japan'], '/manga-covers/samurai-legacy.jpg', 'completed', 'T', 'en', 19876, 4.9, 678);
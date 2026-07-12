-- Update manga covers with real images
UPDATE public.manga_meta 
SET cover_image_url = CASE 
  WHEN title = 'Dragon Slayer Chronicles' THEN '/src/assets/manga-covers/dragon-slayer-chronicles.jpg'
  WHEN title = 'Shadow Ninja Academy' THEN '/src/assets/manga-covers/shadow-ninja-academy.jpg'
  WHEN title = 'Mecha Warriors United' THEN '/src/assets/manga-covers/mecha-warriors-united.jpg'
  WHEN title = 'Cherry Blossom Romance' THEN '/src/assets/manga-covers/cherry-blossom-romance.jpg'
  WHEN title = 'Café Love Stories' THEN '/src/assets/manga-covers/cafe-love-stories.jpg'
  WHEN title = 'Midnight Confessions' THEN '/src/assets/manga-covers/midnight-confessions.jpg'
  WHEN title = 'Elemental Magic Academy' THEN '/src/assets/manga-covers/elemental-magic-academy.jpg'
  WHEN title = 'Forest Spirit Guardian' THEN '/src/assets/manga-covers/forest-spirit-guardian.jpg'
  WHEN title = 'Demon Hunter Chronicles' THEN '/src/assets/manga-covers/demon-hunter-chronicles.jpg'
  WHEN title = 'Clumsy Chef Adventures' THEN '/src/assets/manga-covers/clumsy-chef-adventures.jpg'
  WHEN title = 'Pet Shop Pandemonium' THEN '/src/assets/manga-covers/pet-shop-pandemonium.jpg'
  WHEN title = 'Space Pirate Captain' THEN '/src/assets/manga-covers/space-pirate-captain.jpg'
  WHEN title = 'Cyberpunk Detective' THEN '/src/assets/manga-covers/cyberpunk-detective.jpg'
  ELSE cover_image_url
END;
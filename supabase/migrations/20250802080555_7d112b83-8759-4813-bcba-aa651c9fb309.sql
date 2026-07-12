-- Add chapters for existing manga (10-20 chapters per series)
INSERT INTO public.chapters (series_id, chapter_number, title, pages, page_count, sort_order, is_locked, thumbnail_url)
SELECT 
  m.id as series_id,
  generate_series(1, 15) as chapter_number,
  'Chapter ' || generate_series(1, 15) as title,
  jsonb_build_array(
    jsonb_build_object('url', '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-p1.jpg', 'page_number', 1),
    jsonb_build_object('url', '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-p2.jpg', 'page_number', 2),
    jsonb_build_object('url', '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-p3.jpg', 'page_number', 3),
    jsonb_build_object('url', '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-p4.jpg', 'page_number', 4),
    jsonb_build_object('url', '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-p5.jpg', 'page_number', 5)
  ) as pages,
  5 as page_count,
  generate_series(1, 15) as sort_order,
  false as is_locked,
  '/manga-pages/' || replace(lower(m.title), ' ', '-') || '-ch' || generate_series(1, 15) || '-thumb.jpg' as thumbnail_url
FROM public.manga_meta m
WHERE m.id IN (SELECT id FROM public.manga_meta LIMIT 10);

-- Lock the latest chapter (chapter 15) for each series and set pricing
INSERT INTO public.chapter_prices (chapter_id, coin_cost, premium_only)
SELECT 
  c.id,
  10 as coin_cost,
  false as premium_only
FROM public.chapters c
WHERE c.chapter_number = 15;

-- Update the latest chapter to be locked
UPDATE public.chapters 
SET is_locked = true 
WHERE chapter_number = 15;
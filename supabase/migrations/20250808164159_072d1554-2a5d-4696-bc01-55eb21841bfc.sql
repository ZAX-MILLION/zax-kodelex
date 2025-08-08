-- Show locked chapters in homepage feed for guests
-- Create a function that returns latest chapters including locked state and unlock cost
CREATE OR REPLACE FUNCTION public.get_latest_chapters_feed_all(days_back integer DEFAULT 30, limit_count integer DEFAULT 10)
RETURNS TABLE(
  chapter_id uuid,
  chapter_title text,
  chapter_number integer,
  series_id uuid,
  series_title text,
  cover_image_url text,
  created_at timestamp with time zone,
  is_locked boolean,
  unlock_cost integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
  SELECT 
    c.id as chapter_id,
    c.title as chapter_title,
    c.chapter_number,
    c.series_id,
    m.title as series_title,
    m.cover_image_url,
    c.created_at,
    c.is_locked,
    COALESCE(cp.coin_cost, 0) as unlock_cost
  FROM public.chapters c
  JOIN public.manga_meta m ON c.series_id = m.id
  LEFT JOIN public.chapter_prices cp ON cp.chapter_id = c.id
  WHERE c.created_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
  ORDER BY c.created_at DESC
  LIMIT limit_count;
$function$;

-- Allow anon/authenticated to execute
GRANT EXECUTE ON FUNCTION public.get_latest_chapters_feed_all(integer, integer) TO anon, authenticated;
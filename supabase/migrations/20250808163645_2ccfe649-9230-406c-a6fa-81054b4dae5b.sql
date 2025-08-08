-- Function: Expose all chapters for a series (including locked) to guests safely
CREATE OR REPLACE FUNCTION public.get_series_chapter_listings(series_id_param uuid)
RETURNS TABLE(
  id uuid,
  title text,
  chapter_number integer,
  page_count integer,
  release_date timestamptz,
  view_count integer,
  is_locked boolean,
  thumbnail_url text,
  unlock_cost integer
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    c.id,
    c.title,
    c.chapter_number,
    c.page_count,
    c.release_date,
    c.view_count,
    c.is_locked,
    c.thumbnail_url,
    COALESCE(cp.coin_cost, 0) AS unlock_cost
  FROM public.chapters c
  LEFT JOIN public.chapter_prices cp ON cp.chapter_id = c.id
  WHERE c.series_id = series_id_param
  ORDER BY c.chapter_number DESC, c.created_at DESC;
$$;

-- Ensure anon/authenticated can execute the function
GRANT EXECUTE ON FUNCTION public.get_series_chapter_listings(uuid) TO anon, authenticated;

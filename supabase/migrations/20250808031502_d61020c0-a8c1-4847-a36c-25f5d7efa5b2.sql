-- First, let's check if content_type and linked_series_id fields exist in manga_meta
-- and add them if they don't exist

-- Add content_type column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'manga_meta' AND column_name = 'content_type') THEN
        ALTER TABLE public.manga_meta ADD COLUMN content_type TEXT DEFAULT 'manga';
    END IF;
END $$;

-- Add linked_series_id column if it doesn't exist  
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'manga_meta' AND column_name = 'linked_series_id') THEN
        ALTER TABLE public.manga_meta ADD COLUMN linked_series_id UUID REFERENCES public.manga_meta(id);
    END IF;
END $$;

-- Add performance indexes
CREATE INDEX IF NOT EXISTS idx_manga_meta_view_count ON public.manga_meta(view_count DESC);
CREATE INDEX IF NOT EXISTS idx_manga_meta_status ON public.manga_meta(status);
CREATE INDEX IF NOT EXISTS idx_manga_meta_content_type ON public.manga_meta(content_type);
CREATE INDEX IF NOT EXISTS idx_chapters_series_id_number ON public.chapters(series_id, chapter_number);
CREATE INDEX IF NOT EXISTS idx_series_views_created_at ON public.series_views(created_at DESC);

-- Wipe all existing data as requested
DELETE FROM public.chapter_prices;
DELETE FROM public.series_views;
DELETE FROM public.manga_ratings;
DELETE FROM public.chapters;
DELETE FROM public.manga_meta;

-- Reset sequences if they exist
SELECT setval(pg_get_serial_sequence('manga_meta', 'id'), 1, false);
SELECT setval(pg_get_serial_sequence('chapters', 'id'), 1, false);
-- Add missing columns for content type and series linking
ALTER TABLE public.manga_meta 
ADD COLUMN IF NOT EXISTS content_type TEXT DEFAULT 'manga' CHECK (content_type IN ('manga', 'novel')),
ADD COLUMN IF NOT EXISTS linked_series_id UUID REFERENCES public.manga_meta(id);

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_manga_meta_content_type ON public.manga_meta(content_type);
CREATE INDEX IF NOT EXISTS idx_manga_meta_linked_series ON public.manga_meta(linked_series_id);
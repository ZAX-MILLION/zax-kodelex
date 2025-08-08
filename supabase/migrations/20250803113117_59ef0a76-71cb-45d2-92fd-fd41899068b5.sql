-- Add alt_names field to manga_meta table
ALTER TABLE public.manga_meta 
ADD COLUMN alt_names text[] DEFAULT '{}';

-- Add simple index for better search performance on alt_names
CREATE INDEX idx_manga_meta_alt_names ON public.manga_meta USING GIN (alt_names);
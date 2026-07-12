-- Add alt_names field to manga_meta table
ALTER TABLE public.manga_meta 
ADD COLUMN alt_names text[] DEFAULT '{}';

-- Add index for better search performance on alt_names
CREATE INDEX idx_manga_meta_alt_names ON public.manga_meta USING GIN (alt_names);

-- Add index for better text search performance on title and alt_names combined
CREATE INDEX idx_manga_meta_search ON public.manga_meta USING GIN (
  to_tsvector('english', coalesce(title, '') || ' ' || array_to_string(coalesce(alt_names, '{}'), ' '))
);
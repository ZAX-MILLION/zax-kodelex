-- Create blog_posts table
CREATE TABLE public.blog_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  excerpt TEXT,
  featured_image_url TEXT,
  slug TEXT UNIQUE NOT NULL,
  author_id UUID REFERENCES auth.users(id),
  status TEXT NOT NULL DEFAULT 'published',
  published_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  view_count INTEGER DEFAULT 0,
  seo_title TEXT,
  seo_description TEXT,
  tags TEXT[] DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create policies for blog posts
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (status = 'published');

CREATE POLICY "Admins can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (is_admin());

CREATE POLICY "Authors can manage their own blog posts" 
ON public.blog_posts 
FOR ALL 
USING (auth.uid() = author_id);

-- Add new columns to homepage_settings
ALTER TABLE public.homepage_settings 
ADD COLUMN feed_chapters_count INTEGER NOT NULL DEFAULT 10,
ADD COLUMN blog_posts_count INTEGER NOT NULL DEFAULT 6;

-- Create index for better performance
CREATE INDEX idx_blog_posts_published_at ON public.blog_posts(published_at DESC) WHERE status = 'published';
CREATE INDEX idx_chapters_recent ON public.chapters(created_at DESC);

-- Create function to get latest chapters feed
CREATE OR REPLACE FUNCTION public.get_latest_chapters_feed(days_back INTEGER DEFAULT 30, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  chapter_id UUID,
  chapter_title TEXT,
  chapter_number INTEGER,
  series_id UUID,
  series_title TEXT,
  cover_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    c.id as chapter_id,
    c.title as chapter_title,
    c.chapter_number,
    c.series_id,
    m.title as series_title,
    m.cover_image_url,
    c.created_at
  FROM public.chapters c
  JOIN public.manga_meta m ON c.series_id = m.id
  WHERE c.created_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
  AND NOT c.is_locked
  ORDER BY c.created_at DESC
  LIMIT limit_count;
$$;
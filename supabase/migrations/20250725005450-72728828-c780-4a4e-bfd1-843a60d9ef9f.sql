-- Create comments table for chapter discussions
CREATE TABLE public.comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  chapter_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Create policies for comments
CREATE POLICY "Anyone can view comments" 
ON public.comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own comments" 
ON public.comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Users can update their own comments" 
ON public.comments 
FOR UPDATE 
USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Users can delete their own comments" 
ON public.comments 
FOR DELETE 
USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Admins can manage all comments" 
ON public.comments 
FOR ALL 
USING (is_admin());

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_comments_updated_at
BEFORE UPDATE ON public.comments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add indexes for performance
CREATE INDEX idx_comments_chapter_id ON public.comments(chapter_id);
CREATE INDEX idx_comments_user_id ON public.comments(user_id);
CREATE INDEX idx_comments_created_at ON public.comments(created_at DESC);

-- Add indexes for reading_progress performance
CREATE INDEX idx_reading_progress_user_chapter ON public.reading_progress(user_id, chapter_id);
CREATE INDEX idx_reading_progress_updated_at ON public.reading_progress(updated_at DESC);

-- Add indexes for bookmarks performance  
CREATE INDEX idx_bookmarks_user_chapter ON public.bookmarks(user_id, chapter_id);
CREATE INDEX idx_bookmarks_created_at ON public.bookmarks(created_at DESC);

-- Insert sample data for testing
INSERT INTO public.manga_meta (
  title, 
  description, 
  author, 
  artist, 
  status,
  genres,
  tags,
  cover_image_url,
  meta_title,
  meta_description
) VALUES (
  'Epic Fantasy Manga',
  'An incredible journey through magical realms filled with adventure, friendship, and epic battles against ancient evils.',
  'Akira Toriyama',
  'Akira Toriyama', 
  'ongoing',
  ARRAY['Fantasy', 'Adventure', 'Action'],
  ARRAY['Magic', 'Dragons', 'Heroes', 'Epic'],
  '/placeholder.svg',
  'Epic Fantasy Manga - Read Online',
  'Read Epic Fantasy Manga online. An incredible journey through magical realms with adventure and epic battles.'
);

-- Insert sample chapters
INSERT INTO public.chapters (
  chapter_number,
  title,
  pages,
  page_count,
  sort_order,
  release_date,
  thumbnail_url
) VALUES 
(1, 'The Beginning', '[]'::jsonb, 0, 1, now() - interval '7 days', '/placeholder.svg'),
(2, 'First Challenge', '[]'::jsonb, 0, 2, now() - interval '5 days', '/placeholder.svg'),
(3, 'New Allies', '[]'::jsonb, 0, 3, now() - interval '3 days', '/placeholder.svg'),
(4, 'The Dark Forest', '[]'::jsonb, 0, 4, now() - interval '1 day', '/placeholder.svg');

-- Enable realtime for comments
ALTER TABLE public.comments REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.comments;
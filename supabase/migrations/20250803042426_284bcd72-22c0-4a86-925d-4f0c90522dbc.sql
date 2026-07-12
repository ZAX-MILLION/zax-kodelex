-- Create series-level comments table for general discussions about a series
CREATE TABLE IF NOT EXISTS public.series_comments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  user_id UUID NOT NULL,
  series_id UUID NOT NULL REFERENCES public.manga_meta(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  parent_id UUID REFERENCES public.series_comments(id) ON DELETE CASCADE,
  is_edited BOOLEAN DEFAULT false,
  edit_deadline TIMESTAMP WITH TIME ZONE,
  like_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  is_flagged BOOLEAN DEFAULT false,
  flag_count INTEGER DEFAULT 0,
  markdown_content TEXT,
  status TEXT DEFAULT 'active'
);

-- Enable RLS on series_comments
ALTER TABLE public.series_comments ENABLE ROW LEVEL SECURITY;

-- Create policies for series_comments
CREATE POLICY "Anyone can view series comments" 
ON public.series_comments 
FOR SELECT 
USING (true);

CREATE POLICY "Users can create their own series comments" 
ON public.series_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Users can update their own series comments" 
ON public.series_comments 
FOR UPDATE 
USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Users can delete their own series comments" 
ON public.series_comments 
FOR DELETE 
USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Admins can manage all series comments" 
ON public.series_comments 
FOR ALL 
USING (is_admin());

-- Create series comment likes table
CREATE TABLE IF NOT EXISTS public.series_comment_likes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  comment_id UUID NOT NULL REFERENCES public.series_comments(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, comment_id)
);

-- Enable RLS on series_comment_likes
ALTER TABLE public.series_comment_likes ENABLE ROW LEVEL SECURITY;

-- Create policies for series_comment_likes
CREATE POLICY "Anyone can view like counts" 
ON public.series_comment_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own likes" 
ON public.series_comment_likes 
FOR ALL 
USING (auth.uid() = user_id AND NOT is_user_banned());

-- Create triggers for series comment likes
CREATE OR REPLACE FUNCTION public.update_series_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.series_comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.series_comments 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER update_series_comment_like_count_trigger
  AFTER INSERT OR DELETE ON public.series_comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.update_series_comment_like_count();

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_series_comments_series_id ON public.series_comments(series_id);
CREATE INDEX IF NOT EXISTS idx_series_comments_created_at ON public.series_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_series_comments_parent_id ON public.series_comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_chapters_series_id ON public.chapters(series_id);
CREATE INDEX IF NOT EXISTS idx_chapters_release_date ON public.chapters(release_date DESC);

-- Add trigger to update series updated_at when comments are added
CREATE OR REPLACE FUNCTION public.update_series_on_comment_change()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    UPDATE public.manga_meta 
    SET updated_at = now() 
    WHERE id = NEW.series_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.manga_meta 
    SET updated_at = now() 
    WHERE id = OLD.series_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_series_on_series_comment_change
  AFTER INSERT OR UPDATE OR DELETE ON public.series_comments
  FOR EACH ROW EXECUTE FUNCTION public.update_series_on_comment_change();
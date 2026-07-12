-- Create series_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.series_comments (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    user_id UUID NOT NULL,
    series_id UUID NOT NULL,
    parent_id UUID NULL,
    like_count INTEGER NOT NULL DEFAULT 0,
    is_pinned BOOLEAN NOT NULL DEFAULT false,
    is_flagged BOOLEAN NOT NULL DEFAULT false,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create series_comment_likes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.series_comment_likes (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    comment_id UUID NOT NULL,
    user_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE(comment_id, user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.series_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_comment_likes ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Anyone can view active series comments" ON public.series_comments;
DROP POLICY IF EXISTS "Users can create their own series comments" ON public.series_comments;
DROP POLICY IF EXISTS "Users can update their own series comments" ON public.series_comments;
DROP POLICY IF EXISTS "Users can delete their own series comments" ON public.series_comments;
DROP POLICY IF EXISTS "Admins can manage all series comments" ON public.series_comments;
DROP POLICY IF EXISTS "Anyone can view series comment likes" ON public.series_comment_likes;
DROP POLICY IF EXISTS "Users can manage their own series comment likes" ON public.series_comment_likes;

-- Create RLS policies for series_comments
CREATE POLICY "Anyone can view active series comments" 
ON public.series_comments 
FOR SELECT 
USING (status = 'active');

CREATE POLICY "Users can create their own series comments" 
ON public.series_comments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own series comments" 
ON public.series_comments 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own series comments" 
ON public.series_comments 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all series comments" 
ON public.series_comments 
FOR ALL 
USING (is_admin());

-- Create RLS policies for series_comment_likes
CREATE POLICY "Anyone can view series comment likes" 
ON public.series_comment_likes 
FOR SELECT 
USING (true);

CREATE POLICY "Users can manage their own series comment likes" 
ON public.series_comment_likes 
FOR ALL 
USING (auth.uid() = user_id);
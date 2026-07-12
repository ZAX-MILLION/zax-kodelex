-- Add chapter layout preference to profiles table
ALTER TABLE public.profiles 
ADD COLUMN chapter_layout_preference integer DEFAULT 1 CHECK (chapter_layout_preference IN (1, 2, 3));
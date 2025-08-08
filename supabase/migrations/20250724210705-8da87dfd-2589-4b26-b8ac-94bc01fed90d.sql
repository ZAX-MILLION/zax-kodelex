-- Create enum types for better data consistency
CREATE TYPE public.manga_status AS ENUM ('ongoing', 'completed', 'hiatus', 'cancelled');
CREATE TYPE public.user_role AS ENUM ('admin', 'user');

-- Create profiles table for additional user data
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  username TEXT,
  role user_role NOT NULL DEFAULT 'user',
  is_banned BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create manga_meta table for the single manga's information
CREATE TABLE public.manga_meta (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  author TEXT,
  artist TEXT,
  status manga_status NOT NULL DEFAULT 'ongoing',
  tags TEXT[],
  genres TEXT[],
  cover_image_url TEXT,
  thumbnail_url TEXT,
  -- SEO fields
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  noindex BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create chapters table
CREATE TABLE public.chapters (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  chapter_number INTEGER NOT NULL UNIQUE,
  title TEXT,
  thumbnail_url TEXT,
  page_count INTEGER NOT NULL DEFAULT 0,
  pages JSONB NOT NULL DEFAULT '[]', -- Array of page image URLs
  is_locked BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reading_progress table
CREATE TABLE public.reading_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  current_page INTEGER NOT NULL DEFAULT 1,
  total_pages INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id)
);

-- Create bookmarks table
CREATE TABLE public.bookmarks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES public.chapters(id) ON DELETE CASCADE,
  page_number INTEGER NOT NULL,
  note TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, chapter_id, page_number)
);

-- Create site_settings table
CREATE TABLE public.site_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  site_title TEXT NOT NULL DEFAULT 'Manga Reader',
  logo_url TEXT,
  theme_color TEXT NOT NULL DEFAULT '#dc2626',
  maintenance_mode BOOLEAN NOT NULL DEFAULT false,
  analytics_code TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manga_meta ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reading_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check admin role
CREATE OR REPLACE FUNCTION public.is_admin(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = $1 AND role = 'admin' AND NOT is_banned
  );
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- Create security definer function to check if user is banned
CREATE OR REPLACE FUNCTION public.is_user_banned(user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN AS $$
  SELECT COALESCE((
    SELECT is_banned FROM public.profiles 
    WHERE profiles.user_id = $1
  ), false);
$$ LANGUAGE SQL SECURITY DEFINER STABLE;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id AND NOT public.is_user_banned());

CREATE POLICY "Admins can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_admin());

CREATE POLICY "Admins can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_admin());

CREATE POLICY "Auto-create profile on signup" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for manga_meta (public read, admin write)
CREATE POLICY "Anyone can view manga meta" ON public.manga_meta
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage manga meta" ON public.manga_meta
  FOR ALL USING (public.is_admin());

-- RLS Policies for chapters (public read, admin write)
CREATE POLICY "Anyone can view unlocked chapters" ON public.chapters
  FOR SELECT USING (NOT is_locked OR public.is_admin());

CREATE POLICY "Admins can manage chapters" ON public.chapters
  FOR ALL USING (public.is_admin());

-- RLS Policies for reading_progress (user-specific)
CREATE POLICY "Users can view their own reading progress" ON public.reading_progress
  FOR SELECT USING (auth.uid() = user_id AND NOT public.is_user_banned());

CREATE POLICY "Users can manage their own reading progress" ON public.reading_progress
  FOR ALL USING (auth.uid() = user_id AND NOT public.is_user_banned());

CREATE POLICY "Admins can view all reading progress" ON public.reading_progress
  FOR SELECT USING (public.is_admin());

-- RLS Policies for bookmarks (user-specific)
CREATE POLICY "Users can view their own bookmarks" ON public.bookmarks
  FOR SELECT USING (auth.uid() = user_id AND NOT public.is_user_banned());

CREATE POLICY "Users can manage their own bookmarks" ON public.bookmarks
  FOR ALL USING (auth.uid() = user_id AND NOT public.is_user_banned());

CREATE POLICY "Admins can view all bookmarks" ON public.bookmarks
  FOR SELECT USING (public.is_admin());

-- RLS Policies for site_settings (public read, admin write)
CREATE POLICY "Anyone can view site settings" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage site settings" ON public.site_settings
  FOR ALL USING (public.is_admin());

-- Create indexes for better performance
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_chapters_sort_order ON public.chapters(sort_order);
CREATE INDEX idx_chapters_chapter_number ON public.chapters(chapter_number);
CREATE INDEX idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX idx_reading_progress_chapter_id ON public.reading_progress(chapter_id);
CREATE INDEX idx_bookmarks_user_id ON public.bookmarks(user_id);
CREATE INDEX idx_bookmarks_chapter_id ON public.bookmarks(chapter_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'admin@manga.com' THEN 'admin'::user_role ELSE 'user'::user_role END
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manga_meta_updated_at
  BEFORE UPDATE ON public.manga_meta
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_chapters_updated_at
  BEFORE UPDATE ON public.chapters
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_reading_progress_updated_at
  BEFORE UPDATE ON public.reading_progress
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_site_settings_updated_at
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('manga-covers', 'manga-covers', true),
  ('chapter-pages', 'chapter-pages', true),
  ('chapter-thumbnails', 'chapter-thumbnails', true),
  ('site-assets', 'site-assets', true);

-- Storage policies for manga covers
CREATE POLICY "Public can view manga covers" ON storage.objects
  FOR SELECT USING (bucket_id = 'manga-covers');

CREATE POLICY "Admins can upload manga covers" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'manga-covers' AND public.is_admin());

CREATE POLICY "Admins can update manga covers" ON storage.objects
  FOR UPDATE USING (bucket_id = 'manga-covers' AND public.is_admin());

CREATE POLICY "Admins can delete manga covers" ON storage.objects
  FOR DELETE USING (bucket_id = 'manga-covers' AND public.is_admin());

-- Storage policies for chapter pages
CREATE POLICY "Public can view chapter pages" ON storage.objects
  FOR SELECT USING (bucket_id = 'chapter-pages');

CREATE POLICY "Admins can upload chapter pages" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chapter-pages' AND public.is_admin());

CREATE POLICY "Admins can update chapter pages" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chapter-pages' AND public.is_admin());

CREATE POLICY "Admins can delete chapter pages" ON storage.objects
  FOR DELETE USING (bucket_id = 'chapter-pages' AND public.is_admin());

-- Storage policies for chapter thumbnails
CREATE POLICY "Public can view chapter thumbnails" ON storage.objects
  FOR SELECT USING (bucket_id = 'chapter-thumbnails');

CREATE POLICY "Admins can upload chapter thumbnails" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'chapter-thumbnails' AND public.is_admin());

CREATE POLICY "Admins can update chapter thumbnails" ON storage.objects
  FOR UPDATE USING (bucket_id = 'chapter-thumbnails' AND public.is_admin());

CREATE POLICY "Admins can delete chapter thumbnails" ON storage.objects
  FOR DELETE USING (bucket_id = 'chapter-thumbnails' AND public.is_admin());

-- Storage policies for site assets
CREATE POLICY "Public can view site assets" ON storage.objects
  FOR SELECT USING (bucket_id = 'site-assets');

CREATE POLICY "Admins can upload site assets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admins can update site assets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'site-assets' AND public.is_admin());

CREATE POLICY "Admins can delete site assets" ON storage.objects
  FOR DELETE USING (bucket_id = 'site-assets' AND public.is_admin());

-- Insert default manga metadata
INSERT INTO public.manga_meta (
  title,
  description,
  author,
  artist,
  status,
  tags,
  genres,
  meta_title,
  meta_description
) VALUES (
  'Crimson Blade Chronicles',
  'In a world where ancient spirits and modern technology collide, young warrior Akira must master the legendary Crimson Blade to save humanity from an otherworldly threat.',
  'Akira Tanaka',
  'Yuki Sato',
  'ongoing',
  ARRAY['action', 'supernatural', 'adventure'],
  ARRAY['Action', 'Fantasy', 'Supernatural'],
  'Crimson Blade Chronicles - Read Free Manga Online',
  'Read Crimson Blade Chronicles manga online for free. Action-packed fantasy adventure with supernatural elements.'
);

-- Insert default site settings
INSERT INTO public.site_settings (
  site_title,
  theme_color
) VALUES (
  'Crimson Blade Chronicles - Manga Reader',
  '#dc2626'
);
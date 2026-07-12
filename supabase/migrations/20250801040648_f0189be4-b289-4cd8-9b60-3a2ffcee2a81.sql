-- Create languages table
CREATE TABLE public.languages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE, -- e.g., 'en', 'ar', 'ru'
  name TEXT NOT NULL, -- e.g., 'English', 'العربية', 'Русский'
  native_name TEXT NOT NULL, -- Native language name
  direction TEXT NOT NULL DEFAULT 'ltr', -- 'ltr' or 'rtl'
  font_family TEXT, -- Optional font family for this language
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create translations table
CREATE TABLE public.translations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT NOT NULL, -- Translation key, e.g., 'header.navigation.home'
  language_code TEXT NOT NULL,
  value TEXT NOT NULL, -- The translated text
  context TEXT, -- Optional context for translators
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(key, language_code)
);

-- Create user language preferences table
CREATE TABLE public.user_language_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  language_code TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_language_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for languages
CREATE POLICY "Anyone can view active languages" 
ON public.languages 
FOR SELECT 
USING (is_active = true);

CREATE POLICY "Admins can manage languages" 
ON public.languages 
FOR ALL 
USING (is_admin());

-- RLS Policies for translations
CREATE POLICY "Anyone can view translations" 
ON public.translations 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage translations" 
ON public.translations 
FOR ALL 
USING (is_admin());

-- RLS Policies for user language preferences
CREATE POLICY "Users can view their own language preference" 
ON public.user_language_preferences 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own language preference" 
ON public.user_language_preferences 
FOR ALL 
USING (auth.uid() = user_id);

-- Insert default languages
INSERT INTO public.languages (code, name, native_name, direction, font_family, is_active, display_order) VALUES
('en', 'English', 'English', 'ltr', null, true, 1),
('ar', 'Arabic', 'العربية', 'rtl', 'Noto Sans Arabic', true, 2),
('ru', 'Russian', 'Русский', 'ltr', 'Noto Sans', true, 3);

-- Insert default English translations (base translations)
INSERT INTO public.translations (key, language_code, value, context) VALUES
-- Header
('header.home', 'en', 'Home', 'Main navigation'),
('header.browse', 'en', 'Browse', 'Main navigation'),
('header.series', 'en', 'Series', 'Main navigation'),
('header.categories', 'en', 'Categories', 'Main navigation'),
('header.login', 'en', 'Login', 'Auth button'),
('header.profile', 'en', 'Profile', 'User menu'),
('header.admin', 'en', 'Admin', 'Admin link'),
('header.logout', 'en', 'Logout', 'User menu'),

-- Common actions
('common.save', 'en', 'Save', 'Generic save button'),
('common.cancel', 'en', 'Cancel', 'Generic cancel button'),
('common.delete', 'en', 'Delete', 'Generic delete button'),
('common.edit', 'en', 'Edit', 'Generic edit button'),
('common.add', 'en', 'Add', 'Generic add button'),
('common.search', 'en', 'Search', 'Search placeholder'),
('common.loading', 'en', 'Loading...', 'Loading state'),
('common.error', 'en', 'Error', 'Error state'),
('common.success', 'en', 'Success', 'Success message'),

-- Homepage
('homepage.hero.title', 'en', 'Discover Amazing Stories', 'Homepage hero section'),
('homepage.hero.subtitle', 'en', 'Read manga and novels from talented creators', 'Homepage hero section'),
('homepage.trending', 'en', 'Trending Now', 'Trending section title'),
('homepage.latest', 'en', 'Latest Updates', 'Latest section title'),
('homepage.genres', 'en', 'Browse by Genre', 'Genres section title'),

-- Footer
('footer.about', 'en', 'About Us', 'Footer link'),
('footer.contact', 'en', 'Contact', 'Footer link'),
('footer.privacy', 'en', 'Privacy Policy', 'Footer link'),
('footer.terms', 'en', 'Terms of Service', 'Footer link'),
('footer.copyright', 'en', '© 2024 Manga Reader. All rights reserved.', 'Copyright text'),

-- Language switcher
('language.switch', 'en', 'Language', 'Language switcher label'),
('language.select', 'en', 'Select Language', 'Language selector prompt');

-- Create function to get default translation
CREATE OR REPLACE FUNCTION get_translation(
  translation_key TEXT,
  lang_code TEXT DEFAULT 'en'
) RETURNS TEXT AS $$
DECLARE
  translation_value TEXT;
BEGIN
  -- Try to get translation for requested language
  SELECT value INTO translation_value
  FROM translations
  WHERE key = translation_key AND language_code = lang_code;
  
  -- If not found, try English as fallback
  IF translation_value IS NULL THEN
    SELECT value INTO translation_value
    FROM translations
    WHERE key = translation_key AND language_code = 'en';
  END IF;
  
  -- If still not found, return the key itself
  RETURN COALESCE(translation_value, translation_key);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
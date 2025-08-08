-- Add profile customization fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS banner_image_url TEXT,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light',
ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS premium_effects_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS join_date DATE DEFAULT CURRENT_DATE,
ADD COLUMN IF NOT EXISTS is_profile_public BOOLEAN DEFAULT true;

-- Create user badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  badge_id TEXT NOT NULL UNIQUE,
  badge_name TEXT NOT NULL,
  badge_description TEXT,
  badge_icon_url TEXT,
  badge_color TEXT DEFAULT '#3B82F6',
  badge_rarity TEXT DEFAULT 'common',
  is_premium BOOLEAN DEFAULT false,
  coin_cost INTEGER DEFAULT 0,
  is_animated BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user badge assignments table
CREATE TABLE IF NOT EXISTS public.user_badge_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL,
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  assigned_by UUID REFERENCES auth.users(id),
  is_equipped BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  UNIQUE(user_id, badge_id)
);

-- Create profile themes table
CREATE TABLE IF NOT EXISTS public.profile_themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id TEXT NOT NULL UNIQUE,
  theme_name TEXT NOT NULL,
  theme_description TEXT,
  css_variables JSONB DEFAULT '{}',
  is_premium BOOLEAN DEFAULT false,
  coin_cost INTEGER DEFAULT 0,
  is_seasonal BOOLEAN DEFAULT false,
  available_from TIMESTAMP WITH TIME ZONE,
  available_until TIMESTAMP WITH TIME ZONE,
  preview_image_url TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user notes table (for admin/user notes on profiles)
CREATE TABLE IF NOT EXISTS public.user_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  target_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_author_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  note_content TEXT NOT NULL,
  note_type TEXT DEFAULT 'user',
  is_private BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create profile visits/views table
CREATE TABLE IF NOT EXISTS public.profile_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  profile_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  visitor_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  visitor_ip INET,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badge_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_visits ENABLE ROW LEVEL SECURITY;
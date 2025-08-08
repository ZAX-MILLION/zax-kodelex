-- Create badges table (main badge definitions)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6',
  rarity TEXT DEFAULT 'common', -- common, rare, epic, legendary
  is_hidden BOOLEAN NOT NULL DEFAULT false,
  is_premium BOOLEAN NOT NULL DEFAULT false,
  is_animated BOOLEAN NOT NULL DEFAULT false,
  category TEXT DEFAULT 'general', -- general, achievement, milestone, special
  sort_order INTEGER DEFAULT 0,
  requirements JSONB DEFAULT '{}', -- For future auto-grant logic
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on badges
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Update existing user_badge_assignments table to add missing columns
ALTER TABLE public.user_badge_assignments 
ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add reference to new badges table
ALTER TABLE public.user_badge_assignments 
ADD COLUMN IF NOT EXISTS new_badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE;

-- Create basic RLS policies for badges
CREATE POLICY "Anyone can view non-hidden badges" 
ON public.badges FOR SELECT 
USING (NOT is_hidden OR is_admin());

CREATE POLICY "Admins can manage badges" 
ON public.badges FOR ALL 
USING (is_admin());

-- Create basic RLS policies for user_badge_assignments
CREATE POLICY "Users can view their own user badges" 
ON public.user_badge_assignments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public user badges of others" 
ON public.user_badge_assignments FOR SELECT 
USING (visibility = 'public');

CREATE POLICY "Admins can view all user badges" 
ON public.user_badge_assignments FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage user badges" 
ON public.user_badge_assignments FOR ALL 
USING (is_admin());

-- Allow users to update their own badge display settings
CREATE POLICY "Users can update their badge display settings" 
ON public.user_badge_assignments FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function for badge management
CREATE OR REPLACE FUNCTION public.grant_badge_to_user(
  target_user_id UUID,
  target_badge_id UUID,
  granter_id UUID DEFAULT NULL,
  admin_notes TEXT DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user already has this badge
  IF EXISTS (
    SELECT 1 FROM public.user_badge_assignments 
    WHERE user_id = target_user_id AND new_badge_id = target_badge_id
  ) THEN
    RETURN false; -- Badge already assigned
  END IF;
  
  -- Grant the badge
  INSERT INTO public.user_badge_assignments (
    user_id, new_badge_id, granted_by, notes, granted_at
  ) VALUES (
    target_user_id, target_badge_id, granter_id, admin_notes, now()
  );
  
  RETURN true;
END;
$$;

-- Create function to revoke badge from user
CREATE OR REPLACE FUNCTION public.revoke_badge_from_user(
  target_user_id UUID,
  target_badge_id UUID
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.user_badge_assignments 
  WHERE user_id = target_user_id AND new_badge_id = target_badge_id;
  
  RETURN FOUND;
END;
$$;

-- Create triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_badge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW
EXECUTE FUNCTION public.update_badge_timestamp();

-- Insert default badges
INSERT INTO public.badges (name, description, icon_url, color, rarity, category, is_premium) VALUES
('Welcome', 'Joined the community', '/badges/welcome.svg', '#10B981', 'common', 'milestone', false),
('First Chapter', 'Read your first chapter', '/badges/first-read.svg', '#3B82F6', 'common', 'achievement', false),
('Bookworm', 'Read 100 chapters', '/badges/bookworm.svg', '#8B5CF6', 'rare', 'achievement', false),
('Loyal Reader', 'Daily login streak of 30 days', '/badges/loyal.svg', '#F59E0B', 'epic', 'achievement', true),
('VIP Member', 'Premium subscriber', '/badges/vip.svg', '#EF4444', 'legendary', 'special', true),
('Beta Tester', 'Helped test new features', '/badges/beta.svg', '#6B7280', 'rare', 'special', false),
('Community Helper', 'Active in discussions', '/badges/helper.svg', '#10B981', 'epic', 'achievement', false),
('Manga Master', 'Read 1000 chapters', '/badges/master.svg', '#7C3AED', 'legendary', 'achievement', true)
ON CONFLICT (name) DO NOTHING;
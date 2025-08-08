-- Create badges table
CREATE TABLE public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon_url TEXT,
  color TEXT DEFAULT '#3B82F6', -- Default blue color
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

-- Create user_badges table (renamed from user_badges to avoid conflicts)
CREATE TABLE public.user_badge_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  granted_by UUID REFERENCES auth.users(id), -- NULL for auto-granted
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  visibility TEXT NOT NULL DEFAULT 'public', -- public, private
  is_equipped BOOLEAN NOT NULL DEFAULT true, -- Whether user shows this badge
  display_order INTEGER DEFAULT 0, -- User's custom ordering
  notes TEXT, -- Admin notes for manual grants
  
  UNIQUE(user_id, badge_id) -- Prevent duplicate badge assignments
);

-- Create view for easy badge queries with user info
CREATE VIEW public.user_badges AS
SELECT 
  ub.id,
  ub.user_id,
  ub.badge_id,
  b.name as badge_name,
  b.description as badge_description,
  b.icon_url as badge_icon_url,
  b.color as badge_color,
  b.rarity as badge_rarity,
  b.is_premium,
  b.is_animated,
  b.is_hidden,
  b.category as badge_category,
  ub.granted_by,
  ub.granted_at,
  ub.visibility,
  ub.is_equipped,
  ub.display_order,
  ub.notes
FROM public.user_badge_assignments ub
JOIN public.badges b ON ub.badge_id = b.id;

-- Enable RLS
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badge_assignments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for badges
CREATE POLICY "Anyone can view non-hidden badges" 
ON public.badges FOR SELECT 
USING (NOT is_hidden OR is_admin());

CREATE POLICY "Admins can manage badges" 
ON public.badges FOR ALL 
USING (is_admin());

-- RLS Policies for user_badge_assignments
CREATE POLICY "Users can view their own badges" 
ON public.user_badge_assignments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can view public badges of others" 
ON public.user_badge_assignments FOR SELECT 
USING (
  visibility = 'public' AND 
  NOT EXISTS (
    SELECT 1 FROM public.badges b 
    WHERE b.id = badge_id AND b.is_hidden = true
  )
);

CREATE POLICY "Admins can view all badges" 
ON public.user_badge_assignments FOR SELECT 
USING (is_admin());

CREATE POLICY "Admins can manage user badges" 
ON public.user_badge_assignments FOR ALL 
USING (is_admin());

CREATE POLICY "Users can update their own badge settings" 
ON public.user_badge_assignments FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Users can only modify visibility, is_equipped, and display_order
  user_id = OLD.user_id AND
  badge_id = OLD.badge_id AND
  granted_by = OLD.granted_by AND
  granted_at = OLD.granted_at
);

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

-- Create function to grant badge to user
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
    WHERE user_id = target_user_id AND badge_id = target_badge_id
  ) THEN
    RETURN false; -- Badge already assigned
  END IF;
  
  -- Grant the badge
  INSERT INTO public.user_badge_assignments (
    user_id, badge_id, granted_by, notes
  ) VALUES (
    target_user_id, target_badge_id, granter_id, admin_notes
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
  WHERE user_id = target_user_id AND badge_id = target_badge_id;
  
  RETURN FOUND;
END;
$$;

-- Insert some default badges
INSERT INTO public.badges (name, description, icon_url, color, rarity, category, is_premium) VALUES
('Welcome', 'Joined the community', '/badges/welcome.svg', '#10B981', 'common', 'milestone', false),
('First Chapter', 'Read your first chapter', '/badges/first-read.svg', '#3B82F6', 'common', 'achievement', false),
('Bookworm', 'Read 100 chapters', '/badges/bookworm.svg', '#8B5CF6', 'rare', 'achievement', false),
('Loyal Reader', 'Daily login streak of 30 days', '/badges/loyal.svg', '#F59E0B', 'epic', 'achievement', true),
('VIP Member', 'Premium subscriber', '/badges/vip.svg', '#EF4444', 'legendary', 'special', true),
('Beta Tester', 'Helped test new features', '/badges/beta.svg', '#6B7280', 'rare', 'special', false),
('Community Helper', 'Active in discussions', '/badges/helper.svg', '#10B981', 'epic', 'achievement', false),
('Manga Master', 'Read 1000 chapters', '/badges/master.svg', '#7C3AED', 'legendary', 'achievement', true);
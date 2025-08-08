-- Create badges table (main badge definitions)
CREATE TABLE IF NOT EXISTS public.badges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
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

-- Enable RLS on badges if not already enabled
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;

-- Update existing user_badge_assignments table to match our needs
ALTER TABLE public.user_badge_assignments 
ADD COLUMN IF NOT EXISTS granted_by UUID REFERENCES auth.users(id),
ADD COLUMN IF NOT EXISTS granted_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
ADD COLUMN IF NOT EXISTS visibility TEXT DEFAULT 'public',
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Rename assigned_by to granted_by if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badge_assignments' AND column_name = 'assigned_by') THEN
    UPDATE public.user_badge_assignments SET granted_by = assigned_by WHERE granted_by IS NULL;
  END IF;
END $$;

-- Rename assigned_at to granted_at if it exists  
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_badge_assignments' AND column_name = 'assigned_at') THEN
    UPDATE public.user_badge_assignments SET granted_at = assigned_at WHERE granted_at IS NULL;
  END IF;
END $$;

-- Update badge_id to reference our new badges table (change from text to UUID)
ALTER TABLE public.user_badge_assignments 
ADD COLUMN IF NOT EXISTS new_badge_id UUID REFERENCES public.badges(id) ON DELETE CASCADE;

-- RLS Policies for badges
DO $$
BEGIN
  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Anyone can view non-hidden badges" ON public.badges;
  DROP POLICY IF EXISTS "Admins can manage badges" ON public.badges;
  
  -- Create new policies
  CREATE POLICY "Anyone can view non-hidden badges" 
  ON public.badges FOR SELECT 
  USING (NOT is_hidden OR is_admin());

  CREATE POLICY "Admins can manage badges" 
  ON public.badges FOR ALL 
  USING (is_admin());
END $$;

-- Enhanced RLS Policies for user_badge_assignments
DO $$
BEGIN
  -- Drop existing policies
  DROP POLICY IF EXISTS "Users can view their own badges" ON public.user_badge_assignments;
  DROP POLICY IF EXISTS "Users can view public badges of others" ON public.user_badge_assignments;
  DROP POLICY IF EXISTS "Admins can view all badges" ON public.user_badge_assignments;
  DROP POLICY IF EXISTS "Admins can manage user badges" ON public.user_badge_assignments;
  DROP POLICY IF EXISTS "Users can update their own badge settings" ON public.user_badge_assignments;
  
  -- Create enhanced policies
  CREATE POLICY "Users can view their own badges" 
  ON public.user_badge_assignments FOR SELECT 
  USING (auth.uid() = user_id);

  CREATE POLICY "Users can view public badges of others" 
  ON public.user_badge_assignments FOR SELECT 
  USING (
    visibility = 'public' AND 
    (new_badge_id IS NULL OR NOT EXISTS (
      SELECT 1 FROM public.badges b 
      WHERE b.id = new_badge_id AND b.is_hidden = true
    ))
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
    COALESCE(new_badge_id, badge_id::text) = COALESCE(OLD.new_badge_id, OLD.badge_id::text) AND
    granted_by = OLD.granted_by AND
    granted_at = OLD.granted_at
  );
END $$;

-- Create triggers for updated_at if they don't exist
CREATE OR REPLACE FUNCTION public.update_badge_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_badges_updated_at ON public.badges;
CREATE TRIGGER update_badges_updated_at
BEFORE UPDATE ON public.badges
FOR EACH ROW
EXECUTE FUNCTION public.update_badge_timestamp();

-- Insert some default badges
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
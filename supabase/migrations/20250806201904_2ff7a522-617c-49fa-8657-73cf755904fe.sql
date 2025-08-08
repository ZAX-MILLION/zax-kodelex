-- RLS Policies for user_badges
CREATE POLICY "Anyone can view active badges" ON public.user_badges
FOR SELECT USING (true);

CREATE POLICY "Admins can manage badges" ON public.user_badges
FOR ALL USING (is_admin());

-- RLS Policies for user_badge_assignments
CREATE POLICY "Users can view badge assignments" ON public.user_badge_assignments
FOR SELECT USING (true);

CREATE POLICY "Users can manage their own badge assignments" ON public.user_badge_assignments
FOR ALL USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Admins can manage all badge assignments" ON public.user_badge_assignments
FOR ALL USING (is_admin());

-- RLS Policies for profile_themes
CREATE POLICY "Anyone can view active themes" ON public.profile_themes
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage themes" ON public.profile_themes
FOR ALL USING (is_admin());

-- RLS Policies for user_notes
CREATE POLICY "Users can view notes about them" ON public.user_notes
FOR SELECT USING (
  target_user_id = auth.uid() OR 
  note_author_id = auth.uid() OR 
  is_admin()
);

CREATE POLICY "Users can create notes" ON public.user_notes
FOR INSERT WITH CHECK (
  note_author_id = auth.uid() AND 
  NOT is_user_banned()
);

CREATE POLICY "Note authors can update their notes" ON public.user_notes
FOR UPDATE USING (
  note_author_id = auth.uid() OR 
  is_admin()
);

CREATE POLICY "Admins can manage all notes" ON public.user_notes
FOR ALL USING (is_admin());

-- RLS Policies for profile_visits
CREATE POLICY "Users can view visits to their profile" ON public.profile_visits
FOR SELECT USING (profile_user_id = auth.uid() OR is_admin());

CREATE POLICY "Anyone can record profile visits" ON public.profile_visits
FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_badge_assignments_user_id ON public.user_badge_assignments(user_id);
CREATE INDEX IF NOT EXISTS idx_user_badge_assignments_equipped ON public.user_badge_assignments(user_id, is_equipped) WHERE is_equipped = true;
CREATE INDEX IF NOT EXISTS idx_user_notes_target_user ON public.user_notes(target_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_visits_profile_user ON public.profile_visits(profile_user_id);
CREATE INDEX IF NOT EXISTS idx_profile_visits_visited_at ON public.profile_visits(visited_at);

-- Insert some default badges
INSERT INTO public.user_badges (badge_id, badge_name, badge_description, badge_icon_url, badge_color, badge_rarity) VALUES
('founder', 'Founder', 'One of the original members', '/badges/founder.svg', '#FFD700', 'legendary'),
('sama', 'SAMA', 'Respected community member', '/badges/sama.svg', '#9333EA', 'epic'),
('25xx', '25XX', 'Future tech enthusiast', '/badges/25xx.svg', '#06B6D4', 'rare'),
('admin', 'Administrator', 'Site administrator', '/badges/admin.svg', '#DC2626', 'legendary'),
('moderator', 'Moderator', 'Community moderator', '/badges/moderator.svg', '#059669', 'epic'),
('premium', 'Premium Member', 'Premium subscriber', '/badges/premium.svg', '#F59E0B', 'rare'),
('verified', 'Verified', 'Verified user', '/badges/verified.svg', '#3B82F6', 'uncommon'),
('early_adopter', 'Early Adopter', 'Joined in the early days', '/badges/early.svg', '#8B5CF6', 'rare')
ON CONFLICT (badge_id) DO NOTHING;

-- Insert some default themes
INSERT INTO public.profile_themes (theme_id, theme_name, theme_description, css_variables, is_premium, coin_cost) VALUES
('light', 'Light Theme', 'Clean and bright theme', '{"bg": "#ffffff", "text": "#000000"}', false, 0),
('dark', 'Dark Theme', 'Sleek dark theme', '{"bg": "#1a1a1a", "text": "#ffffff"}', false, 0),
('neon', 'Neon Glow', 'Futuristic neon effects', '{"bg": "#000011", "text": "#00ff88", "glow": "0 0 10px #00ff88"}', true, 100),
('sakura', 'Cherry Blossom', 'Beautiful pink sakura theme', '{"bg": "#fef7f7", "text": "#be185d", "accent": "#f9a8d4"}', true, 150),
('cyberpunk', 'Cyberpunk', 'High-tech low-life aesthetic', '{"bg": "#0a0a0a", "text": "#00ff00", "accent": "#ff00ff"}', true, 200)
ON CONFLICT (theme_id) DO NOTHING;

-- Create functions for profile management
CREATE OR REPLACE FUNCTION public.get_user_profile_data(target_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  profile_data JSONB;
  user_badges JSONB;
BEGIN
  -- Get profile data
  SELECT to_jsonb(p.*) INTO profile_data
  FROM public.profiles p
  WHERE p.user_id = target_user_id;
  
  -- Get user badges
  SELECT jsonb_agg(
    jsonb_build_object(
      'badge_id', ub.badge_id,
      'badge_name', ub.badge_name,
      'badge_description', ub.badge_description,
      'badge_icon_url', ub.badge_icon_url,
      'badge_color', ub.badge_color,
      'badge_rarity', ub.badge_rarity,
      'is_premium', ub.is_premium,
      'is_animated', ub.is_animated,
      'is_equipped', uba.is_equipped,
      'display_order', uba.display_order
    ) ORDER BY uba.display_order, uba.assigned_at
  ) INTO user_badges
  FROM public.user_badge_assignments uba
  JOIN public.user_badges ub ON uba.badge_id = ub.badge_id
  WHERE uba.user_id = target_user_id;
  
  -- Combine data
  profile_data = profile_data || jsonb_build_object('badges', COALESCE(user_badges, '[]'::jsonb));
  
  RETURN profile_data;
END;
$$;

-- Function to record profile visit
CREATE OR REPLACE FUNCTION public.record_profile_visit(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_visits (profile_user_id, visitor_user_id, visitor_ip)
  VALUES (
    target_user_id,
    auth.uid(),
    inet_client_addr()
  );
EXCEPTION
  WHEN OTHERS THEN
    -- Silently ignore errors (e.g., if visitor is the same as profile owner)
    NULL;
END;
$$;
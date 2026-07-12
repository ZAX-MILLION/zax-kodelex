-- Create new tables for admin dashboard

-- Admin actions logging table
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_type TEXT, -- 'chapter', 'user', 'series', etc.
  target_id UUID,
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- SEO settings table
CREATE TABLE IF NOT EXISTS public.seo_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  page_type TEXT NOT NULL, -- 'home', 'chapter', 'series', etc.
  target_id UUID, -- for specific chapters/series
  meta_title TEXT,
  meta_description TEXT,
  meta_keywords TEXT,
  og_title TEXT,
  og_description TEXT,
  og_image_url TEXT,
  canonical_url TEXT,
  robots_directives TEXT DEFAULT 'index, follow',
  structured_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Analytics configuration table
CREATE TABLE IF NOT EXISTS public.analytics_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  provider TEXT NOT NULL, -- 'google_analytics', 'custom', etc.
  tracking_id TEXT,
  config_data JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Feature toggles table
CREATE TABLE IF NOT EXISTS public.feature_toggles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feature_name TEXT NOT NULL UNIQUE,
  is_enabled BOOLEAN DEFAULT false,
  description TEXT,
  config_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- User activity logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  activity_type TEXT NOT NULL, -- 'page_view', 'chapter_read', 'comment', etc.
  page_url TEXT,
  chapter_id UUID,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Ad zones table for future monetization
CREATE TABLE IF NOT EXISTS public.ad_zones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zone_name TEXT NOT NULL,
  position TEXT NOT NULL, -- 'header', 'sidebar', 'between_pages', etc.
  size_specs TEXT, -- '300x250', '728x90', etc.
  ad_code TEXT,
  is_active BOOLEAN DEFAULT false,
  priority INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Extend site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS maintenance_message TEXT,
ADD COLUMN IF NOT EXISTS custom_css TEXT,
ADD COLUMN IF NOT EXISTS custom_js TEXT;

-- Extend profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS login_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS activity_score INTEGER DEFAULT 0;

-- Extend chapters table
ALTER TABLE public.chapters 
ADD COLUMN IF NOT EXISTS view_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS download_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS seo_title TEXT,
ADD COLUMN IF NOT EXISTS seo_description TEXT;

-- Extend manga_meta table
ALTER TABLE public.manga_meta 
ADD COLUMN IF NOT EXISTS age_rating TEXT DEFAULT 'T',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'en',
ADD COLUMN IF NOT EXISTS publication_date DATE;

-- Enable RLS on new tables
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seo_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_toggles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ad_zones ENABLE ROW LEVEL SECURITY;

-- RLS Policies for admin_actions
CREATE POLICY "Admins can view all admin actions" ON public.admin_actions FOR SELECT USING (is_admin());
CREATE POLICY "Admins can insert admin actions" ON public.admin_actions FOR INSERT WITH CHECK (is_admin());

-- RLS Policies for seo_settings
CREATE POLICY "Admins can manage SEO settings" ON public.seo_settings FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view SEO settings" ON public.seo_settings FOR SELECT USING (true);

-- RLS Policies for analytics_config
CREATE POLICY "Admins can manage analytics config" ON public.analytics_config FOR ALL USING (is_admin());

-- RLS Policies for feature_toggles
CREATE POLICY "Admins can manage feature toggles" ON public.feature_toggles FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view active features" ON public.feature_toggles FOR SELECT USING (true);

-- RLS Policies for user_activity_logs
CREATE POLICY "Admins can view all activity logs" ON public.user_activity_logs FOR SELECT USING (is_admin());
CREATE POLICY "Users can view their own activity" ON public.user_activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert activity logs" ON public.user_activity_logs FOR INSERT WITH CHECK (true);

-- RLS Policies for ad_zones
CREATE POLICY "Admins can manage ad zones" ON public.ad_zones FOR ALL USING (is_admin());
CREATE POLICY "Anyone can view active ad zones" ON public.ad_zones FOR SELECT USING (is_active);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_seo_settings_page_type ON public.seo_settings(page_type);

-- Create triggers for updated_at columns
CREATE TRIGGER update_seo_settings_updated_at
  BEFORE UPDATE ON public.seo_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_analytics_config_updated_at
  BEFORE UPDATE ON public.analytics_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_feature_toggles_updated_at
  BEFORE UPDATE ON public.feature_toggles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ad_zones_updated_at
  BEFORE UPDATE ON public.ad_zones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
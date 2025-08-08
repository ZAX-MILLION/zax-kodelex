-- First, let's enhance the user roles and permissions system
-- Add new role types for the dashboard features
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'uploader';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'seo_manager';

-- Create table for role-specific dashboard configurations  
CREATE TABLE IF NOT EXISTS public.role_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name user_role NOT NULL,
  dashboard_config JSONB NOT NULL DEFAULT '{}',
  menu_items JSONB NOT NULL DEFAULT '[]',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create help content table for role-specific help
CREATE TABLE IF NOT EXISTS public.help_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_target user_role NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'markdown',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for tracking cover uploads and bulk operations
CREATE TABLE IF NOT EXISTS public.series_covers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES manga_meta(id) ON DELETE CASCADE,
  cover_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  dimensions JSONB,
  uploaded_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for bulk upload tracking
CREATE TABLE IF NOT EXISTS public.bulk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES manga_meta(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL, -- 'zip_chapters', 'images', 'covers'
  file_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chapter ordering preferences
CREATE TABLE IF NOT EXISTS public.user_reading_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_sort_order TEXT DEFAULT 'newest_first', -- 'newest_first', 'oldest_first'
  show_locked_chapters BOOLEAN DEFAULT true,
  reading_mode TEXT DEFAULT 'single_page',
  auto_progress BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.role_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_covers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for role_dashboards
CREATE POLICY "Admins can manage role dashboards" ON public.role_dashboards
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view their role dashboard" ON public.role_dashboards
  FOR SELECT USING (
    role_name = (SELECT role FROM profiles WHERE user_id = auth.uid())
  );

-- RLS Policies for help_content
CREATE POLICY "Admins can manage help content" ON public.help_content
  FOR ALL USING (is_admin());

CREATE POLICY "Users can view help for their role" ON public.help_content
  FOR SELECT USING (
    is_active = true AND (
      role_target = (SELECT role FROM profiles WHERE user_id = auth.uid()) OR
      role_target = 'member' -- General help available to all
    )
  );

-- RLS Policies for series_covers
CREATE POLICY "Admins can manage all series covers" ON public.series_covers
  FOR ALL USING (is_admin());

CREATE POLICY "Uploaders can manage series covers" ON public.series_covers
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('uploader', 'admin', 'author'))
  );

CREATE POLICY "Anyone can view active covers" ON public.series_covers
  FOR SELECT USING (is_active = true);

-- RLS Policies for bulk_uploads
CREATE POLICY "Admins can view all bulk uploads" ON public.bulk_uploads
  FOR SELECT USING (is_admin());

CREATE POLICY "Users can view their own uploads" ON public.bulk_uploads
  FOR SELECT USING (uploaded_by = auth.uid());

CREATE POLICY "Uploaders can create bulk uploads" ON public.bulk_uploads
  FOR INSERT WITH CHECK (
    uploaded_by = auth.uid() AND
    EXISTS (SELECT 1 FROM profiles WHERE user_id = auth.uid() AND role IN ('uploader', 'admin', 'author'))
  );

-- RLS Policies for user_reading_preferences
CREATE POLICY "Users can manage their own reading preferences" ON public.user_reading_preferences
  FOR ALL USING (user_id = auth.uid());

-- Add triggers for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_role_dashboards_updated_at
  BEFORE UPDATE ON public.role_dashboards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_help_content_updated_at
  BEFORE UPDATE ON public.help_content
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bulk_uploads_updated_at
  BEFORE UPDATE ON public.bulk_uploads
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_reading_preferences_updated_at
  BEFORE UPDATE ON public.user_reading_preferences
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default dashboard configurations
INSERT INTO public.role_dashboards (role_name, dashboard_config, menu_items, permissions) VALUES
('admin', 
 '{"theme": "admin", "layout": "full"}',
 '[{"title": "Overview", "path": "/admin", "icon": "LayoutDashboard"}, {"title": "Series Manager", "path": "/admin/series", "icon": "BookOpen"}, {"title": "Chapter Manager", "path": "/admin/chapters", "icon": "FileText"}, {"title": "User Management", "path": "/admin/users", "icon": "Users"}, {"title": "Analytics", "path": "/admin/analytics", "icon": "BarChart"}, {"title": "Settings", "path": "/admin/settings", "icon": "Settings"}]',
 '{"manage_all": true, "upload": true, "delete": true, "modify_roles": true, "view_analytics": true}'),
('uploader',
 '{"theme": "uploader", "layout": "focused"}', 
 '[{"title": "My Uploads", "path": "/dashboard/uploads", "icon": "Upload"}, {"title": "Series Manager", "path": "/dashboard/series", "icon": "BookOpen"}, {"title": "Chapter Upload", "path": "/dashboard/chapters", "icon": "FileText"}, {"title": "Upload History", "path": "/dashboard/history", "icon": "History"}]',
 '{"upload": true, "manage_own_content": true, "view_upload_stats": true}'),
('seo_manager',
 '{"theme": "seo", "layout": "data-focused"}',
 '[{"title": "SEO Dashboard", "path": "/dashboard/seo", "icon": "Search"}, {"title": "Content Optimization", "path": "/dashboard/seo/content", "icon": "Edit"}, {"title": "Analytics", "path": "/dashboard/seo/analytics", "icon": "TrendingUp"}, {"title": "Meta Management", "path": "/dashboard/seo/meta", "icon": "Settings"}]',
 '{"edit_seo": true, "view_analytics": true, "manage_meta": true}'),
('author',
 '{"theme": "author", "layout": "creative"}',
 '[{"title": "Dashboard", "path": "/author", "icon": "LayoutDashboard"}, {"title": "My Series", "path": "/author/series", "icon": "BookOpen"}, {"title": "Chapters", "path": "/author/chapters", "icon": "FileText"}, {"title": "Analytics", "path": "/author/analytics", "icon": "BarChart"}]',
 '{"upload": true, "manage_own_content": true, "view_own_analytics": true}'),
('member',
 '{"theme": "user", "layout": "simple"}',
 '[{"title": "Profile", "path": "/profile", "icon": "User"}, {"title": "Reading List", "path": "/profile/reading", "icon": "BookOpen"}, {"title": "Preferences", "path": "/profile/settings", "icon": "Settings"}]',
 '{"read": true, "comment": true, "rate": true}');

-- Insert default help content
INSERT INTO public.help_content (role_target, category, title, content, order_index) VALUES
('admin', 'getting_started', 'Admin Dashboard Overview', '# Admin Dashboard Guide\n\nWelcome to the admin dashboard! Here you can manage all aspects of your manga platform.\n\n## Key Features\n- **Series Management**: Add, edit, and organize manga series\n- **Chapter Upload**: Bulk upload chapters and manage content\n- **User Management**: Control user roles and permissions\n- **Analytics**: View detailed platform statistics\n\n[Learn more about admin features](/help/admin/features)', 1),
('uploader', 'getting_started', 'Uploader Guide', '# Content Upload Guide\n\nAs an uploader, you can add new series and chapters to the platform.\n\n## Upload Process\n1. Navigate to Series Manager\n2. Create or select a series\n3. Upload chapter images or ZIP files\n4. Add metadata and descriptions\n\n## Supported Formats\n- Images: JPG, PNG, WEBP\n- Archives: ZIP files with images\n\n[View upload tutorial](/help/uploader/tutorial)', 1),
('seo_manager', 'getting_started', 'SEO Management Guide', '# SEO Optimization Guide\n\nHelp improve the platform''s search engine visibility.\n\n## Your Responsibilities\n- Optimize meta titles and descriptions\n- Manage keyword strategies\n- Monitor search performance\n- Update content for SEO best practices\n\n## Tools Available\n- SEO Analytics Dashboard\n- Meta Tag Editor\n- Keyword Research Tools\n\n[SEO Best Practices](/help/seo/best-practices)', 1),
('member', 'getting_started', 'User Guide', '# Welcome to the Platform\n\nEnjoy reading manga with our premium features!\n\n## Features\n- **Reading Lists**: Save your favorite series\n- **Progress Tracking**: Never lose your place\n- **Comments**: Discuss with the community\n- **Ratings**: Rate series you''ve read\n\n## Reading Tips\n- Use bookmarks to save specific pages\n- Adjust reading preferences in settings\n- Join discussions in chapter comments\n\n[Reading Features Guide](/help/user/reading)', 1);
-- Fourth migration: Insert default configurations and help content
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
 '{"read": true, "comment": true, "rate": true}')
ON CONFLICT (role_name) DO NOTHING;

-- Insert default help content
INSERT INTO public.help_content (role_target, category, title, content, order_index) VALUES
('admin', 'getting_started', 'Admin Dashboard Overview', '# Admin Dashboard Guide

Welcome to the admin dashboard! Here you can manage all aspects of your manga platform.

## Key Features
- **Series Management**: Add, edit, and organize manga series
- **Chapter Upload**: Bulk upload chapters and manage content
- **User Management**: Control user roles and permissions
- **Analytics**: View detailed platform statistics

[Learn more about admin features](/help/admin/features)', 1),
('uploader', 'getting_started', 'Uploader Guide', '# Content Upload Guide

As an uploader, you can add new series and chapters to the platform.

## Upload Process
1. Navigate to Series Manager
2. Create or select a series
3. Upload chapter images or ZIP files
4. Add metadata and descriptions

## Supported Formats
- Images: JPG, PNG, WEBP
- Archives: ZIP files with images

[View upload tutorial](/help/uploader/tutorial)', 1),
('seo_manager', 'getting_started', 'SEO Management Guide', '# SEO Optimization Guide

Help improve the platform search engine visibility.

## Your Responsibilities
- Optimize meta titles and descriptions
- Manage keyword strategies
- Monitor search performance
- Update content for SEO best practices

## Tools Available
- SEO Analytics Dashboard
- Meta Tag Editor
- Keyword Research Tools

[SEO Best Practices](/help/seo/best-practices)', 1),
('member', 'getting_started', 'User Guide', '# Welcome to the Platform

Enjoy reading manga with our premium features!

## Features
- **Reading Lists**: Save your favorite series
- **Progress Tracking**: Never lose your place
- **Comments**: Discuss with the community
- **Ratings**: Rate series you have read

## Reading Tips
- Use bookmarks to save specific pages
- Adjust reading preferences in settings
- Join discussions in chapter comments

[Reading Features Guide](/help/user/reading)', 1)
ON CONFLICT (role_target, category, title) DO NOTHING;
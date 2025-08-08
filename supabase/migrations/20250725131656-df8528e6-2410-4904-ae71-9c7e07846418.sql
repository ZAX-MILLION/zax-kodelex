-- Add cursor customization fields to site_settings table
ALTER TABLE public.site_settings 
ADD COLUMN cursor_type TEXT DEFAULT 'default',
ADD COLUMN cursor_size INTEGER DEFAULT 16,
ADD COLUMN cursor_trail BOOLEAN DEFAULT false,
ADD COLUMN cursor_glow BOOLEAN DEFAULT false,
ADD COLUMN custom_cursor_url TEXT;
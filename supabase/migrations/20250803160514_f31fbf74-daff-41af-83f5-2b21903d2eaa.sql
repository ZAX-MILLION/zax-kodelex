-- Create social media settings table for the support widget
CREATE TABLE public.social_media_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  platform_name TEXT NOT NULL,
  platform_url TEXT NOT NULL,
  icon_type TEXT NOT NULL DEFAULT 'lucide', -- 'lucide' or 'custom'
  custom_icon_url TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  platform_color TEXT DEFAULT NULL, -- hex color for the platform
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.social_media_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Admins can manage social media settings" 
ON public.social_media_settings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view enabled social media settings" 
ON public.social_media_settings 
FOR SELECT 
USING (is_enabled = true);

-- Insert default social media platforms
INSERT INTO public.social_media_settings (platform_name, platform_url, icon_type, platform_color, display_order) VALUES
('Patreon', 'https://patreon.com/kodelex', 'lucide', '#ff424d', 1),
('Discord', 'https://discord.gg/kodelex', 'lucide', '#5865f2', 2),
('PayPal', 'https://paypal.me/kodelex', 'lucide', '#0070ba', 3),
('Ko-fi', 'https://ko-fi.com/kodelex', 'lucide', '#ff5f5f', 4);

-- Create trigger for updated_at
CREATE TRIGGER update_social_media_settings_updated_at
BEFORE UPDATE ON public.social_media_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
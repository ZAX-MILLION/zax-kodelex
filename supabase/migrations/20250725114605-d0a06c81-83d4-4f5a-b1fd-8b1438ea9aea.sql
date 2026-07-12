-- Create global_notifications table
CREATE TABLE public.global_notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'info',
  is_active BOOLEAN NOT NULL DEFAULT true,
  show_on_all_pages BOOLEAN NOT NULL DEFAULT false,
  expire_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on global_notifications
ALTER TABLE public.global_notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for global_notifications
CREATE POLICY "Admins can manage global notifications" 
ON public.global_notifications 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view active notifications" 
ON public.global_notifications 
FOR SELECT 
USING (is_active AND (expire_at IS NULL OR expire_at > now()));

-- Add theme-related columns to site_settings
ALTER TABLE public.site_settings 
ADD COLUMN hero_bg_url TEXT,
ADD COLUMN hero_height TEXT DEFAULT '70vh',
ADD COLUMN secondary_color TEXT DEFAULT '#f59e0b',
ADD COLUMN button_style TEXT DEFAULT 'rounded',
ADD COLUMN font_size TEXT DEFAULT 'medium',
ADD COLUMN typography_style TEXT DEFAULT 'modern',
ADD COLUMN layout_mode TEXT DEFAULT 'spacious',
ADD COLUMN enable_animations BOOLEAN DEFAULT true;

-- Create trigger for global_notifications updated_at
CREATE TRIGGER update_global_notifications_updated_at
BEFORE UPDATE ON public.global_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
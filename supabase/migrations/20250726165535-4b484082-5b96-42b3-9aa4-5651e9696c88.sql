-- Add child_themes table for managing alternate visual designs
CREATE TABLE IF NOT EXISTS public.child_themes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  version text NOT NULL DEFAULT '1.0.0',
  author text,
  is_active boolean NOT NULL DEFAULT false,
  is_default boolean NOT NULL DEFAULT false,
  theme_config jsonb NOT NULL DEFAULT '{}'::jsonb,
  custom_css text,
  homepage_component text,
  layout_overrides jsonb DEFAULT '{}'::jsonb,
  preview_image_url text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.child_themes ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Anyone can view active themes" 
ON public.child_themes 
FOR SELECT 
USING (is_active = true OR is_default = true);

CREATE POLICY "Admins can manage all themes" 
ON public.child_themes 
FOR ALL 
USING (is_admin());

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_child_themes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_child_themes_updated_at
  BEFORE UPDATE ON public.child_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_child_themes_updated_at();

-- Create function to ensure only one active theme
CREATE OR REPLACE FUNCTION public.ensure_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a theme as active, deactivate all others
  IF NEW.is_active = true AND (OLD IS NULL OR OLD.is_active = false) THEN
    UPDATE public.child_themes 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to ensure only one active theme
CREATE TRIGGER ensure_single_active_theme_trigger
  BEFORE INSERT OR UPDATE ON public.child_themes
  FOR EACH ROW
  EXECUTE FUNCTION public.ensure_single_active_theme();

-- Insert default theme
INSERT INTO public.child_themes (
  name, 
  display_name, 
  description, 
  author,
  is_default,
  theme_config
) VALUES (
  'default',
  'Zax Million Default',
  'The original dark theme with warm amber accents',
  'Zax Million',
  true,
  '{
    "colors": {
      "primary": "35 85% 65%",
      "secondary": "230 15% 16%",
      "accent": "230 15% 17%",
      "background": "230 15% 9%",
      "foreground": "35 20% 92%",
      "manga_red": "0 60% 58%",
      "manga_gold": "35 85% 65%",
      "manga_blue": "210 70% 65%"
    },
    "fonts": {
      "heading": "Inter",
      "body": "Inter"
    },
    "spacing": {
      "scale": 1.0
    },
    "borderRadius": "0.75rem",
    "animations": {
      "enabled": true,
      "duration": "300ms"
    }
  }'::jsonb
) ON CONFLICT (name) DO NOTHING;
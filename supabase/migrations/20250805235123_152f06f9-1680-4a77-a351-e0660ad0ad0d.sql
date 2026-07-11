-- Create theme_settings table for comprehensive theme configuration
CREATE TABLE public.theme_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  author TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  is_active BOOLEAN NOT NULL DEFAULT false,
  is_default BOOLEAN NOT NULL DEFAULT false,
  
  -- Theme configuration as JSON
  slider_settings JSONB NOT NULL DEFAULT '{
    "autoSlideInterval": 5000,
    "slidesCount": 10,
    "showFilters": true,
    "animationType": "fade"
  }'::jsonb,
  
  widget_settings JSONB NOT NULL DEFAULT '{
    "enableTrendingSidebar": true,
    "enableBlogSection": true,
    "enableSupportWidget": true,
    "feedChaptersCount": 10
  }'::jsonb,
  
  color_settings JSONB NOT NULL DEFAULT '{
    "primary": "hsl(35, 85%, 65%)",
    "secondary": "hsl(230, 15%, 16%)",
    "background": "hsl(230, 15%, 9%)",
    "foreground": "hsl(35, 20%, 92%)",
    "accent": "hsl(230, 15%, 17%)",
    "mangaRed": "hsl(0, 60%, 58%)",
    "mangaBlue": "hsl(210, 70%, 65%)",
    "mangaGold": "hsl(35, 85%, 65%)"
  }'::jsonb,
  
  layout_settings JSONB NOT NULL DEFAULT '{
    "headerType": "modern",
    "sidebarPosition": "left",
    "footerStyle": "minimal",
    "containerMaxWidth": "1400px",
    "spacing": "normal"
  }'::jsonb,
  
  -- Additional theme configuration
  custom_css TEXT,
  custom_js TEXT,
  typography_settings JSONB DEFAULT '{
    "fontFamily": "Inter",
    "headingFont": "Inter",
    "fontSize": "16px",
    "lineHeight": "1.5"
  }'::jsonb,
  
  component_overrides JSONB DEFAULT '{}'::jsonb,
  
  -- SEO and metadata
  preview_image_url TEXT,
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT 'general',
  license_type TEXT DEFAULT 'free',
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT valid_version CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  CONSTRAINT valid_category CHECK (category IN ('general', 'dark', 'light', 'anime', 'manga', 'minimal', 'modern'))
);

-- Create theme_metadata table for version management and rollback
CREATE TABLE public.theme_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES public.theme_settings(id) ON DELETE CASCADE,
  version TEXT NOT NULL,
  changelog TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  
  -- Backup data for rollback
  backup_data JSONB NOT NULL,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  rollback_to_version TEXT,
  is_major_update BOOLEAN DEFAULT false,
  breaking_changes TEXT[],
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  applied_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_status CHECK (status IN ('draft', 'testing', 'active', 'rolled_back', 'deprecated')),
  CONSTRAINT valid_version_format CHECK (version ~ '^[0-9]+\.[0-9]+\.[0-9]+$'),
  CONSTRAINT unique_theme_version UNIQUE(theme_id, version)
);

-- Create theme_cache table for performance optimization
CREATE TABLE public.theme_cache (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL REFERENCES public.theme_settings(id) ON DELETE CASCADE,
  cache_key TEXT NOT NULL UNIQUE,
  cached_data JSONB NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Constraints
  CONSTRAINT future_expiry CHECK (expires_at > created_at)
);

-- Create indexes for performance
CREATE INDEX idx_theme_settings_active ON public.theme_settings(is_active) WHERE is_active = true;
CREATE INDEX idx_theme_settings_default ON public.theme_settings(is_default) WHERE is_default = true;
CREATE INDEX idx_theme_settings_name ON public.theme_settings(theme_name);
CREATE INDEX idx_theme_metadata_theme_id ON public.theme_metadata(theme_id);
CREATE INDEX idx_theme_metadata_status ON public.theme_metadata(status);
CREATE INDEX idx_theme_cache_expires ON public.theme_cache(expires_at);
CREATE INDEX idx_theme_cache_theme_id ON public.theme_cache(theme_id);

-- Create RLS policies
ALTER TABLE public.theme_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.theme_cache ENABLE ROW LEVEL SECURITY;

-- Theme settings policies
CREATE POLICY "Anyone can view active themes" ON public.theme_settings
  FOR SELECT USING (is_active = true OR is_default = true);

CREATE POLICY "Admins can manage all themes" ON public.theme_settings
  FOR ALL USING (is_admin());

-- Theme metadata policies  
CREATE POLICY "Anyone can view applied metadata" ON public.theme_metadata
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can manage all metadata" ON public.theme_metadata
  FOR ALL USING (is_admin());

-- Theme cache policies
CREATE POLICY "Anyone can read active theme cache" ON public.theme_cache
  FOR SELECT USING (expires_at > now());

CREATE POLICY "System can manage cache" ON public.theme_cache
  FOR ALL USING (true);

-- Create triggers for automatic timestamps
CREATE OR REPLACE FUNCTION update_theme_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_theme_settings_timestamp
  BEFORE UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION update_theme_timestamp();

-- Create trigger to ensure only one active theme
CREATE OR REPLACE FUNCTION ensure_single_active_theme()
RETURNS TRIGGER AS $$
BEGIN
  -- If setting a theme as active, deactivate all others
  IF NEW.is_active = true AND (OLD IS NULL OR OLD.is_active = false) THEN
    UPDATE public.theme_settings 
    SET is_active = false 
    WHERE id != NEW.id AND is_active = true;
  END IF;
  
  -- Ensure at least one default theme exists
  IF NEW.is_default = true AND (OLD IS NULL OR OLD.is_default = false) THEN
    UPDATE public.theme_settings 
    SET is_default = false 
    WHERE id != NEW.id AND is_default = true;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER ensure_single_active_theme_trigger
  AFTER INSERT OR UPDATE ON public.theme_settings
  FOR EACH ROW EXECUTE FUNCTION ensure_single_active_theme();

-- Create function to get active theme with caching
CREATE OR REPLACE FUNCTION get_active_theme_cached()
RETURNS JSONB
LANGUAGE plpgsql
STABLE SECURITY DEFINER
AS $$
DECLARE
  cached_theme JSONB;
  theme_data JSONB;
  cache_key TEXT := 'active_theme';
BEGIN
  -- Try to get from cache first
  SELECT cached_data INTO cached_theme
  FROM public.theme_cache
  WHERE cache_key = 'active_theme' 
  AND expires_at > now()
  LIMIT 1;
  
  IF cached_theme IS NOT NULL THEN
    RETURN cached_theme;
  END IF;
  
  -- Get active theme from database
  SELECT row_to_json(ts.*) INTO theme_data
  FROM public.theme_settings ts
  WHERE ts.is_active = true
  LIMIT 1;
  
  -- If no active theme, get default
  IF theme_data IS NULL THEN
    SELECT row_to_json(ts.*) INTO theme_data
    FROM public.theme_settings ts
    WHERE ts.is_default = true
    LIMIT 1;
  END IF;
  
  -- Cache the result for 1 hour
  IF theme_data IS NOT NULL THEN
    INSERT INTO public.theme_cache (cache_key, cached_data, theme_id, expires_at)
    VALUES (
      'active_theme', 
      theme_data, 
      (theme_data->>'id')::uuid,
      now() + INTERVAL '1 hour'
    )
    ON CONFLICT (cache_key) DO UPDATE SET
      cached_data = EXCLUDED.cached_data,
      expires_at = EXCLUDED.expires_at,
      created_at = now();
  END IF;
  
  RETURN theme_data;
END;
$$;

-- Insert default theme
INSERT INTO public.theme_settings (
  theme_name,
  display_name,
  description,
  author,
  is_active,
  is_default,
  category
) VALUES (
  'zaxmillion-default',
  'Zax Million Default Dark',
  'The original dark theme with warm amber accents and modern design',
  'Zax Million Team',
  true,
  true,
  'dark'
) ON CONFLICT (theme_name) DO NOTHING;
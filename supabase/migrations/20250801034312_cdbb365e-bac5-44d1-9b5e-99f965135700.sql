-- Create widgets table for homepage widget management
CREATE TABLE public.homepage_widgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  widget_type TEXT NOT NULL, -- 'popular_this_week', 'genres_list', 'top_authors', 'recent_updates', etc.
  widget_name TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  settings JSONB NOT NULL DEFAULT '{}', -- items_count, title, etc.
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for ordering widgets
CREATE INDEX idx_homepage_widgets_order ON public.homepage_widgets(display_order);

-- Enable RLS
ALTER TABLE public.homepage_widgets ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage widgets
CREATE POLICY "Admins can manage widgets" 
ON public.homepage_widgets 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view enabled widgets" 
ON public.homepage_widgets 
FOR SELECT 
USING (is_enabled = true);

-- Create function to update widget timestamps
CREATE OR REPLACE FUNCTION public.update_homepage_widgets_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_homepage_widgets_updated_at
BEFORE UPDATE ON public.homepage_widgets
FOR EACH ROW
EXECUTE FUNCTION public.update_homepage_widgets_updated_at();

-- Insert default widgets
INSERT INTO public.homepage_widgets (widget_type, widget_name, display_order, settings) VALUES
('popular_this_week', 'Popular This Week', 1, '{"items_count": 5, "title": "Popular This Week"}'),
('genres_list', 'Browse by Genre', 2, '{"items_count": 10, "title": "Browse by Genre"}'),
('top_authors', 'Top Authors', 3, '{"items_count": 8, "title": "Top Authors"}'),
('recent_comments', 'Recent Comments', 4, '{"items_count": 5, "title": "Recent Comments"}');

-- Create homepage settings table for global homepage configuration
CREATE TABLE public.homepage_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  hero_slides_count INTEGER NOT NULL DEFAULT 10,
  latest_comics_count INTEGER NOT NULL DEFAULT 16,
  trending_count INTEGER NOT NULL DEFAULT 12,
  auto_slide_interval INTEGER NOT NULL DEFAULT 5000, -- milliseconds
  show_content_type_filter BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.homepage_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for homepage settings
CREATE POLICY "Admins can manage homepage settings" 
ON public.homepage_settings 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view homepage settings" 
ON public.homepage_settings 
FOR SELECT 
USING (true);

-- Create trigger for homepage settings timestamps
CREATE TRIGGER update_homepage_settings_updated_at
BEFORE UPDATE ON public.homepage_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default homepage settings
INSERT INTO public.homepage_settings (hero_slides_count, latest_comics_count, trending_count) 
VALUES (10, 16, 12);

-- Add view tracking for trending algorithm
CREATE TABLE public.series_views (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  series_id UUID NOT NULL,
  user_id UUID, -- null for anonymous views
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.series_views ENABLE ROW LEVEL SECURITY;

-- Create policies for series views
CREATE POLICY "Anyone can record views" 
ON public.series_views 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Admins can view all series views" 
ON public.series_views 
FOR SELECT 
USING (is_admin());

-- Create indexes for performance
CREATE INDEX idx_series_views_series_id ON public.series_views(series_id);
CREATE INDEX idx_series_views_created_at ON public.series_views(created_at);
CREATE INDEX idx_series_views_series_date ON public.series_views(series_id, created_at);

-- Function to get trending series based on views
CREATE OR REPLACE FUNCTION public.get_trending_series(
  days_back INTEGER DEFAULT 7,
  limit_count INTEGER DEFAULT 12
)
RETURNS TABLE(
  series_id UUID,
  view_count BIGINT,
  unique_viewers BIGINT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
AS $$
  SELECT 
    sv.series_id,
    COUNT(*) as view_count,
    COUNT(DISTINCT COALESCE(sv.user_id::text, sv.ip_address::text)) as unique_viewers
  FROM public.series_views sv
  WHERE sv.created_at >= (CURRENT_DATE - INTERVAL '1 day' * days_back)
  GROUP BY sv.series_id
  ORDER BY view_count DESC, unique_viewers DESC
  LIMIT limit_count;
$$;
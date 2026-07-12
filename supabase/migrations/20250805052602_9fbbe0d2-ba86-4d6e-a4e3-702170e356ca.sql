-- Create themes table with MySQL/Supabase compatibility
CREATE TABLE public.themes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(255) NOT NULL UNIQUE,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  version VARCHAR(50) NOT NULL DEFAULT '1.0.0',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for performance
CREATE INDEX idx_themes_active ON public.themes(is_active);
CREATE INDEX idx_themes_name ON public.themes(name);

-- Enable Row Level Security
ALTER TABLE public.themes ENABLE ROW LEVEL SECURITY;

-- Create policies for theme access
CREATE POLICY "Themes are viewable by everyone" 
ON public.themes 
FOR SELECT 
USING (true);

CREATE POLICY "Only admins can manage themes" 
ON public.themes 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_themes_updated_at
BEFORE UPDATE ON public.themes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage buckets for theme assets
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('theme-css', 'theme-css', true),
  ('theme-images', 'theme-images', true);

-- Create storage policies for theme assets
CREATE POLICY "Theme CSS files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'theme-css');

CREATE POLICY "Theme images are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'theme-images');

CREATE POLICY "Admins can upload theme CSS" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'theme-css' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can upload theme images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'theme-images' AND 
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can update theme assets" 
ON storage.objects 
FOR UPDATE 
USING (
  (bucket_id = 'theme-css' OR bucket_id = 'theme-images') AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

CREATE POLICY "Admins can delete theme assets" 
ON storage.objects 
FOR DELETE 
USING (
  (bucket_id = 'theme-css' OR bucket_id = 'theme-images') AND
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE auth.users.id = auth.uid() 
    AND auth.users.raw_user_meta_data->>'role' = 'admin'
  )
);

-- Insert sample "Default Dark Theme" record
INSERT INTO public.themes (name, description, is_active, version) 
VALUES (
  'Default Dark Theme',
  'The default dark theme with modern styling and optimal readability',
  true,
  '1.0.0'
);
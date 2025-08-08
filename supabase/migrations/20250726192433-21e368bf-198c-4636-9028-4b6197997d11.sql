-- Create storage bucket for theme preview screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('theme-screenshots', 'theme-screenshots', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for theme screenshots
DO $$ 
BEGIN
  -- Check if policy exists before creating
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Anyone can view theme screenshots') THEN
    CREATE POLICY "Anyone can view theme screenshots" 
    ON storage.objects 
    FOR SELECT 
    USING (bucket_id = 'theme-screenshots');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admins can upload theme screenshots') THEN
    CREATE POLICY "Admins can upload theme screenshots" 
    ON storage.objects 
    FOR INSERT 
    WITH CHECK (bucket_id = 'theme-screenshots' AND is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admins can update theme screenshots') THEN
    CREATE POLICY "Admins can update theme screenshots" 
    ON storage.objects 
    FOR UPDATE 
    USING (bucket_id = 'theme-screenshots' AND is_admin(auth.uid()));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'objects' AND policyname = 'Admins can delete theme screenshots') THEN
    CREATE POLICY "Admins can delete theme screenshots" 
    ON storage.objects 
    FOR DELETE 
    USING (bucket_id = 'theme-screenshots' AND is_admin(auth.uid()));
  END IF;
END $$;

-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.is_admin(uuid) SET search_path = public;
ALTER FUNCTION public.is_user_banned(uuid) SET search_path = public;
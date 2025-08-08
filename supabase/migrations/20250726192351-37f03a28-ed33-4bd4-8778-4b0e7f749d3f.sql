-- Create storage bucket for theme preview screenshots
INSERT INTO storage.buckets (id, name, public) VALUES ('theme-screenshots', 'theme-screenshots', true);

-- Create storage policies for theme screenshots
CREATE POLICY "Anyone can view theme screenshots" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'theme-screenshots');

CREATE POLICY "Admins can upload theme screenshots" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'theme-screenshots' AND is_admin());

CREATE POLICY "Admins can update theme screenshots" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'theme-screenshots' AND is_admin());

CREATE POLICY "Admins can delete theme screenshots" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'theme-screenshots' AND is_admin());

-- Fix search_path security warnings for existing functions
ALTER FUNCTION public.is_admin() SET search_path = public;
ALTER FUNCTION public.is_user_banned() SET search_path = public;
-- Create RLS policies for child_themes table to allow public read access
-- and authenticated admin insert/update access

-- Enable RLS on child_themes table (if not already enabled)
ALTER TABLE public.child_themes ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read themes (for theme selection)
CREATE POLICY "Allow public read access to child_themes" 
ON public.child_themes 
FOR SELECT 
USING (true);

-- Allow authenticated admin users to insert themes
CREATE POLICY "Allow admin insert on child_themes" 
ON public.child_themes 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow authenticated admin users to update themes
CREATE POLICY "Allow admin update on child_themes" 
ON public.child_themes 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Allow authenticated admin users to delete themes
CREATE POLICY "Allow admin delete on child_themes" 
ON public.child_themes 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'admin'
  )
);
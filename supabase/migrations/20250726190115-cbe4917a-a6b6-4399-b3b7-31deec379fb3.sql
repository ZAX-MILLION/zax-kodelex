-- Create missing tables for theme management

-- Create theme_changelog table
CREATE TABLE IF NOT EXISTS public.theme_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  theme_id UUID NOT NULL,
  version TEXT NOT NULL,
  changes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID,
  FOREIGN KEY (theme_id) REFERENCES public.child_themes(id) ON DELETE CASCADE
);

-- Create user_theme_preferences table
CREATE TABLE IF NOT EXISTS public.user_theme_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  theme_id UUID,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  FOREIGN KEY (theme_id) REFERENCES public.child_themes(id) ON DELETE SET NULL,
  UNIQUE(user_id)
);

-- Enable RLS on both tables
ALTER TABLE public.theme_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_theme_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for theme_changelog
CREATE POLICY "Admins can manage theme changelog" 
ON public.theme_changelog 
FOR ALL 
USING (is_admin());

CREATE POLICY "Everyone can view theme changelog" 
ON public.theme_changelog 
FOR SELECT 
USING (true);

-- Create policies for user_theme_preferences
CREATE POLICY "Users can manage their own theme preferences" 
ON public.user_theme_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all user theme preferences" 
ON public.user_theme_preferences 
FOR SELECT 
USING (is_admin());

-- Create updated_at trigger for user_theme_preferences
CREATE TRIGGER update_user_theme_preferences_updated_at
BEFORE UPDATE ON public.user_theme_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
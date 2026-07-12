-- Create feature flags table
CREATE TABLE public.feature_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  flag_key TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  description TEXT,
  is_enabled BOOLEAN NOT NULL DEFAULT false,
  visibility TEXT NOT NULL DEFAULT 'admin-only' CHECK (visibility IN ('public', 'admin-only')),
  allowed_roles TEXT[] DEFAULT ARRAY[]::TEXT[],
  usage_count INTEGER DEFAULT 0,
  last_toggled_at TIMESTAMP WITH TIME ZONE,
  last_toggled_by UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user flags override table
CREATE TABLE public.user_flags (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  flag_key TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL,
  granted_by UUID,
  reason TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, flag_key)
);

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_flags ENABLE ROW LEVEL SECURITY;

-- RLS Policies for feature_flags
CREATE POLICY "Admins can manage feature flags" 
ON public.feature_flags 
FOR ALL 
USING (is_admin());

CREATE POLICY "Public flags are viewable by everyone" 
ON public.feature_flags 
FOR SELECT 
USING (visibility = 'public' AND is_enabled = true);

CREATE POLICY "Admin-only flags viewable by admins" 
ON public.feature_flags 
FOR SELECT 
USING (visibility = 'admin-only' AND is_admin());

-- RLS Policies for user_flags
CREATE POLICY "Admins can manage all user flags" 
ON public.user_flags 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own flag overrides" 
ON public.user_flags 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create function to check feature flag access
CREATE OR REPLACE FUNCTION public.has_feature_flag(flag_key_param TEXT, user_id_param UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_override_enabled BOOLEAN;
  flag_enabled BOOLEAN;
  flag_visibility TEXT;
  flag_roles TEXT[];
  user_role TEXT;
BEGIN
  -- Check for user-specific override first
  SELECT is_enabled INTO user_override_enabled
  FROM public.user_flags 
  WHERE user_id = user_id_param 
  AND flag_key = flag_key_param
  AND (expires_at IS NULL OR expires_at > now());
  
  -- If user override exists, return that
  IF user_override_enabled IS NOT NULL THEN
    RETURN user_override_enabled;
  END IF;
  
  -- Get flag details
  SELECT is_enabled, visibility, allowed_roles 
  INTO flag_enabled, flag_visibility, flag_roles
  FROM public.feature_flags 
  WHERE flag_key = flag_key_param;
  
  -- If flag doesn't exist or is disabled, return false
  IF flag_enabled IS NULL OR flag_enabled = false THEN
    RETURN false;
  END IF;
  
  -- Check visibility and role permissions
  IF flag_visibility = 'admin-only' AND NOT is_admin(user_id_param) THEN
    RETURN false;
  END IF;
  
  -- Check role-based access
  IF array_length(flag_roles, 1) > 0 THEN
    SELECT role INTO user_role
    FROM public.profiles 
    WHERE user_id = user_id_param;
    
    IF user_role IS NULL OR NOT (user_role = ANY(flag_roles)) THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create trigger to update feature flags timestamp
CREATE OR REPLACE FUNCTION public.update_feature_flag_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  
  -- Update last_toggled info if is_enabled changed
  IF OLD.is_enabled IS DISTINCT FROM NEW.is_enabled THEN
    NEW.last_toggled_at = now();
    NEW.last_toggled_by = auth.uid();
    NEW.usage_count = COALESCE(OLD.usage_count, 0) + 1;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_feature_flags_timestamp
BEFORE UPDATE ON public.feature_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_feature_flag_timestamp();

-- Create trigger to update user flags timestamp
CREATE TRIGGER update_user_flags_timestamp
BEFORE UPDATE ON public.user_flags
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default feature flags
INSERT INTO public.feature_flags (flag_key, display_name, description, is_enabled, visibility, allowed_roles) VALUES
('premium_themes', 'Premium Themes', 'Access to premium theme collection', true, 'public', ARRAY['admin', 'member']),
('author_dashboard', 'Author Dashboard', 'Access to author content management', false, 'admin-only', ARRAY['admin', 'author']),
('upload_access', 'Upload Access', 'Ability to upload content', false, 'admin-only', ARRAY['admin', 'author']),
('advanced_analytics', 'Advanced Analytics', 'Access to detailed analytics', false, 'admin-only', ARRAY['admin']),
('beta_features', 'Beta Features', 'Access to experimental features', false, 'admin-only', ARRAY['admin']),
('comment_moderation', 'Comment Moderation', 'Ability to moderate comments', true, 'admin-only', ARRAY['admin', 'editor']),
('premium_reader_mode', 'Premium Reader Mode', 'Enhanced reading experience', false, 'public', ARRAY['admin', 'member']),
('multi_language', 'Multi Language Support', 'Support for multiple languages', false, 'public', ARRAY[]::TEXT[]);
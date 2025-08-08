-- Create the switch_active_theme function
CREATE OR REPLACE FUNCTION public.switch_active_theme(new_theme_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Deactivate all themes
  UPDATE public.theme_settings 
  SET is_active = false 
  WHERE is_active = true;
  
  -- Activate the new theme
  UPDATE public.theme_settings 
  SET is_active = true 
  WHERE id = new_theme_id;
  
  -- Clear theme cache
  DELETE FROM public.theme_cache 
  WHERE cache_key = 'active_theme';
END;
$function$;
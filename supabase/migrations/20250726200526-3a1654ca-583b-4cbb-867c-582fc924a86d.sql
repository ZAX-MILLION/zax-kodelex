-- Fix search_path for remaining functions to prevent security issues
ALTER FUNCTION public.generate_license_key() SET search_path = public;
ALTER FUNCTION public.update_child_themes_updated_at() SET search_path = public;
ALTER FUNCTION public.ensure_single_active_theme() SET search_path = public;
ALTER FUNCTION public.create_license_for_purchase() SET search_path = public;
ALTER FUNCTION public.handle_new_user() SET search_path = public;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
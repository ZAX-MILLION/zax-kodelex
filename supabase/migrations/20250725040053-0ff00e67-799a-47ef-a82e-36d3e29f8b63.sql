-- Update user_role enum to include new roles
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'editor';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'author';
ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'member';

-- Update the default role in profiles table to use 'member' instead of 'user'
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'member'::user_role;

-- Create index for better role queries
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles(user_id);

-- Create index for user activity analytics
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_activity_logs_activity_type ON public.user_activity_logs(activity_type);

-- Create index for reading progress analytics
CREATE INDEX IF NOT EXISTS idx_reading_progress_user_id ON public.reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_completed ON public.reading_progress(completed);
CREATE INDEX IF NOT EXISTS idx_reading_progress_last_read_at ON public.reading_progress(last_read_at);

-- Create index for admin actions
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_user_id ON public.admin_actions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_created_at ON public.admin_actions(created_at);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action_type ON public.admin_actions(action_type);

-- Update the handle_new_user function to use 'member' as default role
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (
    NEW.id,
    NEW.email,
    CASE WHEN NEW.email = 'admin@manga.com' THEN 'admin'::user_role ELSE 'member'::user_role END
  );
  RETURN NEW;
END;
$function$;
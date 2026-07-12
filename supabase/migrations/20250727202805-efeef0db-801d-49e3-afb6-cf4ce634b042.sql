-- Allow anonymous user tracking by making user_id nullable
ALTER TABLE public.user_activity_logs 
ALTER COLUMN user_id DROP NOT NULL;
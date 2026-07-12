-- Fix function search path security warnings

-- Update the update_comment_like_count function
CREATE OR REPLACE FUNCTION update_comment_like_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.comments 
    SET like_count = like_count + 1 
    WHERE id = NEW.comment_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.comments 
    SET like_count = GREATEST(like_count - 1, 0) 
    WHERE id = OLD.comment_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Update the auto_flag_content function
CREATE OR REPLACE FUNCTION auto_flag_content()
RETURNS TRIGGER AS $$
DECLARE
  threshold INTEGER;
  report_count INTEGER;
BEGIN
  -- Get the auto-flag threshold
  SELECT auto_flag_threshold INTO threshold 
  FROM public.community_settings 
  LIMIT 1;
  
  -- Count reports for this target
  SELECT COUNT(*) INTO report_count
  FROM public.reports 
  WHERE target_type = NEW.target_type 
  AND target_id = NEW.target_id 
  AND status = 'pending';
  
  -- Auto-flag if threshold reached
  IF report_count >= threshold THEN
    IF NEW.target_type = 'comment' THEN
      UPDATE public.comments 
      SET is_flagged = true, flag_count = report_count, status = 'pending_review'
      WHERE id = NEW.target_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public';

-- Update the set_comment_edit_deadline function
CREATE OR REPLACE FUNCTION set_comment_edit_deadline()
RETURNS TRIGGER AS $$
DECLARE
  edit_window INTEGER;
BEGIN
  -- Get edit window from settings
  SELECT edit_window_minutes INTO edit_window 
  FROM public.community_settings 
  LIMIT 1;
  
  NEW.edit_deadline := NEW.created_at + INTERVAL '1 minute' * edit_window;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path TO 'public';
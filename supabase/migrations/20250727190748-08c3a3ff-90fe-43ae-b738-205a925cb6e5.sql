-- Phase 10: Community & Reporting Tools Database Schema

-- Enhanced comments table with threading and moderation features
ALTER TABLE public.comments 
ADD COLUMN IF NOT EXISTS parent_id uuid REFERENCES public.comments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS is_edited boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS edit_deadline timestamp with time zone,
ADD COLUMN IF NOT EXISTS like_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS is_pinned boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS is_flagged boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS flag_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS markdown_content text,
ADD COLUMN IF NOT EXISTS status text DEFAULT 'active' CHECK (status IN ('active', 'hidden', 'deleted', 'pending_review'));

-- Create reports table for abuse reporting
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL,
  target_type text NOT NULL CHECK (target_type IN ('comment', 'chapter', 'series', 'user', 'profile')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('spam', 'harassment', 'inappropriate_content', 'copyright', 'misinformation', 'other')),
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed', 'resolved')),
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  resolution_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  
  -- Prevent duplicate reports from same user for same target
  UNIQUE(reporter_id, target_type, target_id)
);

-- Create moderation logs table
CREATE TABLE IF NOT EXISTS public.moderation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  moderator_id uuid NOT NULL,
  action_type text NOT NULL CHECK (action_type IN ('dismiss_report', 'remove_content', 'warn_user', 'ban_user', 'restore_content', 'pin_comment', 'unpin_comment')),
  target_type text NOT NULL CHECK (target_type IN ('comment', 'chapter', 'series', 'user', 'report')),
  target_id uuid NOT NULL,
  reason text,
  details jsonb DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now()
);

-- Create comment likes table
CREATE TABLE IF NOT EXISTS public.comment_likes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  comment_id uuid NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at timestamp with time zone DEFAULT now(),
  
  -- Prevent duplicate likes
  UNIQUE(user_id, comment_id)
);

-- Create notifications table for community interactions
CREATE TABLE IF NOT EXISTS public.user_notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  type text NOT NULL CHECK (type IN ('comment_reply', 'comment_like', 'content_reported', 'content_moderated', 'mention')),
  title text NOT NULL,
  message text NOT NULL,
  related_type text CHECK (related_type IN ('comment', 'chapter', 'series', 'user', 'report')),
  related_id uuid,
  is_read boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now()
);

-- Create community settings table
CREATE TABLE IF NOT EXISTS public.community_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  auto_flag_threshold integer DEFAULT 5,
  edit_window_minutes integer DEFAULT 15,
  max_comment_length integer DEFAULT 1000,
  enable_markdown boolean DEFAULT true,
  enable_threaded_comments boolean DEFAULT true,
  spam_detection_enabled boolean DEFAULT true,
  rate_limit_comments_per_minute integer DEFAULT 5,
  blacklisted_words text[] DEFAULT '{}',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Insert default community settings
INSERT INTO public.community_settings (id) 
VALUES (gen_random_uuid())
ON CONFLICT DO NOTHING;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON public.comments(parent_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON public.comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_flag_count ON public.comments(flag_count);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_target ON public.reports(target_type, target_id);
CREATE INDEX IF NOT EXISTS idx_moderation_logs_moderator ON public.moderation_logs(moderator_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON public.user_notifications(user_id, is_read);

-- Enable RLS on new tables
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for reports table
CREATE POLICY "Users can create reports" ON public.reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id AND NOT is_user_banned());

CREATE POLICY "Users can view their own reports" ON public.reports
  FOR SELECT USING (auth.uid() = reporter_id);

CREATE POLICY "Admins can manage all reports" ON public.reports
  FOR ALL USING (is_admin());

-- RLS Policies for moderation logs
CREATE POLICY "Admins can view moderation logs" ON public.moderation_logs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admins can create moderation logs" ON public.moderation_logs
  FOR INSERT WITH CHECK (is_admin());

-- RLS Policies for comment likes
CREATE POLICY "Users can manage their own likes" ON public.comment_likes
  FOR ALL USING (auth.uid() = user_id AND NOT is_user_banned());

CREATE POLICY "Anyone can view like counts" ON public.comment_likes
  FOR SELECT USING (true);

-- RLS Policies for notifications
CREATE POLICY "Users can view their own notifications" ON public.user_notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.user_notifications
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.user_notifications
  FOR INSERT WITH CHECK (true);

-- RLS Policies for community settings
CREATE POLICY "Anyone can view community settings" ON public.community_settings
  FOR SELECT USING (true);

CREATE POLICY "Admins can manage community settings" ON public.community_settings
  FOR ALL USING (is_admin());

-- Function to update comment like count
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for comment like count
DROP TRIGGER IF EXISTS trigger_update_comment_like_count ON public.comment_likes;
CREATE TRIGGER trigger_update_comment_like_count
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION update_comment_like_count();

-- Function to auto-flag content based on report threshold
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for auto-flagging
DROP TRIGGER IF EXISTS trigger_auto_flag_content ON public.reports;
CREATE TRIGGER trigger_auto_flag_content
  AFTER INSERT ON public.reports
  FOR EACH ROW EXECUTE FUNCTION auto_flag_content();

-- Function to set comment edit deadline
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
$$ LANGUAGE plpgsql;

-- Trigger for setting edit deadline
DROP TRIGGER IF EXISTS trigger_set_edit_deadline ON public.comments;
CREATE TRIGGER trigger_set_edit_deadline
  BEFORE INSERT ON public.comments
  FOR EACH ROW EXECUTE FUNCTION set_comment_edit_deadline();

-- Update existing comments with edit deadlines
UPDATE public.comments 
SET edit_deadline = created_at + INTERVAL '15 minutes'
WHERE edit_deadline IS NULL;
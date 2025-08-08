-- Fix function search path security issues
CREATE OR REPLACE FUNCTION public.get_daily_active_users(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE(created_at) = target_date
  AND user_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_active_users(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE_TRUNC('month', created_at) = target_month
  AND user_id IS NOT NULL;
$$;

CREATE OR REPLACE FUNCTION public.get_monthly_recurring_revenue(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS NUMERIC
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.user_subscriptions
  WHERE plan = 'premium'
  AND status = 'active'
  AND DATE_TRUNC('month', start_date) <= target_month
  AND (end_date IS NULL OR DATE_TRUNC('month', end_date) >= target_month);
$$;

CREATE OR REPLACE FUNCTION public.get_popular_content(content_type_filter TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  content_id UUID,
  content_type TEXT,
  view_count BIGINT,
  unique_users BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    content_id,
    content_type,
    COUNT(*) as view_count,
    COUNT(DISTINCT user_id) as unique_users
  FROM public.user_activity_logs
  WHERE activity_type IN ('page_view', 'chapter_read')
  AND content_id IS NOT NULL
  AND (content_type_filter IS NULL OR content_type = content_type_filter)
  AND created_at >= CURRENT_DATE - INTERVAL '30 days'
  GROUP BY content_id, content_type
  ORDER BY view_count DESC
  LIMIT limit_count;
$$;

CREATE OR REPLACE FUNCTION public.user_analytics_opt_out(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COALESCE(analytics_opt_out, false)
  FROM public.user_privacy_preferences
  WHERE user_id = check_user_id;
$$;
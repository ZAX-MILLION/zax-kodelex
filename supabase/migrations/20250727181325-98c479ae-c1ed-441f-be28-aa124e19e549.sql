-- Create enhanced user activity logs table
CREATE TABLE IF NOT EXISTS public.user_activity_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  session_id TEXT,
  activity_type TEXT NOT NULL,
  content_id UUID,
  content_type TEXT,
  page_url TEXT,
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  chapter_id UUID,
  duration_seconds INTEGER
);

-- Create analytics aggregation table for performance
CREATE TABLE IF NOT EXISTS public.analytics_aggregations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  metric_name TEXT NOT NULL,
  metric_value NUMERIC NOT NULL,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_date DATE NOT NULL,
  segment TEXT, -- 'premium', 'free', 'all'
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create user privacy preferences table
CREATE TABLE IF NOT EXISTS public.user_privacy_preferences (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  analytics_opt_out BOOLEAN NOT NULL DEFAULT false,
  marketing_opt_out BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_activity_logs
CREATE POLICY "Users can view their own activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all activity logs" 
ON public.user_activity_logs 
FOR SELECT 
USING (is_admin());

CREATE POLICY "System can insert activity logs" 
ON public.user_activity_logs 
FOR INSERT 
WITH CHECK (true);

-- RLS Policies for analytics_aggregations
CREATE POLICY "Admins can manage analytics aggregations" 
ON public.analytics_aggregations 
FOR ALL 
USING (is_admin());

-- RLS Policies for user_privacy_preferences
CREATE POLICY "Users can manage their own privacy preferences" 
ON public.user_privacy_preferences 
FOR ALL 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view privacy preferences" 
ON public.user_privacy_preferences 
FOR SELECT 
USING (is_admin());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_content_id ON public.user_activity_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_period ON public.analytics_aggregations(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_metric ON public.analytics_aggregations(metric_name);

-- Create function to get daily active users
CREATE OR REPLACE FUNCTION public.get_daily_active_users(target_date DATE DEFAULT CURRENT_DATE)
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE(created_at) = target_date
  AND user_id IS NOT NULL;
$$;

-- Create function to get monthly active users
CREATE OR REPLACE FUNCTION public.get_monthly_active_users(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS INTEGER
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COUNT(DISTINCT user_id)
  FROM public.user_activity_logs
  WHERE DATE_TRUNC('month', created_at) = target_month
  AND user_id IS NOT NULL;
$$;

-- Create function to get monthly recurring revenue
CREATE OR REPLACE FUNCTION public.get_monthly_recurring_revenue(target_month DATE DEFAULT DATE_TRUNC('month', CURRENT_DATE))
RETURNS NUMERIC
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(SUM(amount), 0)
  FROM public.user_subscriptions
  WHERE plan = 'premium'
  AND status = 'active'
  AND DATE_TRUNC('month', start_date) <= target_month
  AND (end_date IS NULL OR DATE_TRUNC('month', end_date) >= target_month);
$$;

-- Create function to get popular content
CREATE OR REPLACE FUNCTION public.get_popular_content(content_type_filter TEXT DEFAULT NULL, limit_count INTEGER DEFAULT 10)
RETURNS TABLE(
  content_id UUID,
  content_type TEXT,
  view_count BIGINT,
  unique_users BIGINT
)
LANGUAGE sql
STABLE SECURITY DEFINER
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

-- Create function to check if user has opted out of analytics
CREATE OR REPLACE FUNCTION public.user_analytics_opt_out(check_user_id UUID DEFAULT auth.uid())
RETURNS BOOLEAN
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(analytics_opt_out, false)
  FROM public.user_privacy_preferences
  WHERE user_id = check_user_id;
$$;

-- Create trigger to update analytics aggregations timestamp
CREATE TRIGGER update_analytics_aggregations_updated_at
BEFORE UPDATE ON public.analytics_aggregations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger to update privacy preferences timestamp
CREATE TRIGGER update_privacy_preferences_updated_at
BEFORE UPDATE ON public.user_privacy_preferences
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Check if user_activity_logs table exists, if not create it
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_activity_logs') THEN
    CREATE TABLE public.user_activity_logs (
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
    
    ALTER TABLE public.user_activity_logs ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

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

-- Enable RLS on new tables
ALTER TABLE public.analytics_aggregations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_privacy_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DO $$ 
BEGIN
  DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.user_activity_logs;
  DROP POLICY IF EXISTS "Admins can view all activity logs" ON public.user_activity_logs;
  DROP POLICY IF EXISTS "System can insert activity logs" ON public.user_activity_logs;
EXCEPTION
  WHEN OTHERS THEN NULL;
END $$;

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
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id_new ON public.user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at_new ON public.user_activity_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_activity_logs_activity_type_new ON public.user_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_logs_content_id_new ON public.user_activity_logs(content_id);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_period_new ON public.analytics_aggregations(period_type, period_date);
CREATE INDEX IF NOT EXISTS idx_analytics_aggregations_metric_new ON public.analytics_aggregations(metric_name);
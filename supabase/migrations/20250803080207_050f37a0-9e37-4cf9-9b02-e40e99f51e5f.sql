-- Second migration: Create the new tables and configurations
-- Create table for role-specific dashboard configurations  
CREATE TABLE IF NOT EXISTS public.role_dashboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_name user_role NOT NULL,
  dashboard_config JSONB NOT NULL DEFAULT '{}',
  menu_items JSONB NOT NULL DEFAULT '[]',
  permissions JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create help content table for role-specific help
CREATE TABLE IF NOT EXISTS public.help_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_target user_role NOT NULL,
  category TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  content_type TEXT DEFAULT 'markdown',
  order_index INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for tracking cover uploads and bulk operations
CREATE TABLE IF NOT EXISTS public.series_covers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES manga_meta(id) ON DELETE CASCADE,
  cover_url TEXT NOT NULL,
  thumbnail_url TEXT,
  file_size BIGINT,
  dimensions JSONB,
  uploaded_by UUID REFERENCES auth.users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for bulk upload tracking
CREATE TABLE IF NOT EXISTS public.bulk_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  series_id UUID NOT NULL REFERENCES manga_meta(id) ON DELETE CASCADE,
  upload_type TEXT NOT NULL, -- 'zip_chapters', 'images', 'covers'
  file_count INTEGER DEFAULT 0,
  processed_count INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  metadata JSONB DEFAULT '{}',
  uploaded_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create chapter ordering preferences
CREATE TABLE IF NOT EXISTS public.user_reading_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_sort_order TEXT DEFAULT 'newest_first', -- 'newest_first', 'oldest_first'
  show_locked_chapters BOOLEAN DEFAULT true,
  reading_mode TEXT DEFAULT 'single_page',
  auto_progress BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable RLS on all new tables
ALTER TABLE public.role_dashboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.help_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.series_covers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bulk_uploads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_reading_preferences ENABLE ROW LEVEL SECURITY;
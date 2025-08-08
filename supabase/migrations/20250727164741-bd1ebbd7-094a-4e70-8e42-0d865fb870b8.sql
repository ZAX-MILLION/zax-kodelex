-- Phase 6: Upload System & Data Cleanup Infrastructure

-- Create upload_metadata table for tracking all uploads
CREATE TABLE public.upload_metadata (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  file_type TEXT NOT NULL,
  mime_type TEXT,
  uploader_id UUID NOT NULL,
  associated_manga_id UUID,
  associated_chapter_id UUID,
  upload_context TEXT, -- 'cover', 'chapter_page', 'thumbnail', 'asset'
  metadata JSONB DEFAULT '{}'::jsonb,
  hash_value TEXT, -- For deduplication
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create system_changelog table for tracking system changes
CREATE TABLE public.system_changelog (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  version TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  change_type TEXT NOT NULL DEFAULT 'feature', -- 'feature', 'bugfix', 'security', 'performance'
  developer_notes TEXT,
  release_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_by UUID NOT NULL,
  is_published BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create duplicate_detection table for tracking potential duplicates
CREATE TABLE public.duplicate_detection (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  original_upload_id UUID NOT NULL,
  duplicate_upload_id UUID NOT NULL,
  similarity_score DECIMAL(3,2), -- 0.00 to 1.00
  detection_method TEXT NOT NULL, -- 'hash', 'filename', 'content'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'dismissed'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolved_by UUID
);

-- Enable RLS on all new tables
ALTER TABLE public.upload_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_changelog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.duplicate_detection ENABLE ROW LEVEL SECURITY;

-- RLS Policies for upload_metadata
CREATE POLICY "Admins can manage all upload metadata" 
ON public.upload_metadata 
FOR ALL 
USING (is_admin());

CREATE POLICY "Users can view their own upload metadata" 
ON public.upload_metadata 
FOR SELECT 
USING (auth.uid() = uploader_id AND NOT is_user_banned());

CREATE POLICY "Users can insert their own upload metadata" 
ON public.upload_metadata 
FOR INSERT 
WITH CHECK (auth.uid() = uploader_id AND NOT is_user_banned());

-- RLS Policies for system_changelog
CREATE POLICY "Admins can manage changelog" 
ON public.system_changelog 
FOR ALL 
USING (is_admin());

CREATE POLICY "Anyone can view published changelog entries" 
ON public.system_changelog 
FOR SELECT 
USING (is_published);

-- RLS Policies for duplicate_detection
CREATE POLICY "Admins can manage duplicate detection" 
ON public.duplicate_detection 
FOR ALL 
USING (is_admin());

-- Add indexes for performance
CREATE INDEX idx_upload_metadata_uploader ON public.upload_metadata(uploader_id);
CREATE INDEX idx_upload_metadata_hash ON public.upload_metadata(hash_value);
CREATE INDEX idx_upload_metadata_context ON public.upload_metadata(upload_context);
CREATE INDEX idx_upload_metadata_active ON public.upload_metadata(is_active);
CREATE INDEX idx_system_changelog_published ON public.system_changelog(is_published);
CREATE INDEX idx_system_changelog_date ON public.system_changelog(release_date);
CREATE INDEX idx_duplicate_detection_status ON public.duplicate_detection(status);

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_upload_metadata_updated_at
BEFORE UPDATE ON public.upload_metadata
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_system_changelog_updated_at
BEFORE UPDATE ON public.system_changelog
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Function to calculate file hash (for deduplication)
CREATE OR REPLACE FUNCTION public.calculate_upload_hash(file_path TEXT, file_size BIGINT)
RETURNS TEXT AS $$
BEGIN
  -- Simple hash based on path and size for now
  -- In production, this could be enhanced with actual file content hashing
  RETURN encode(digest(file_path || '::' || file_size::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to detect potential duplicates
CREATE OR REPLACE FUNCTION public.detect_duplicate_uploads()
RETURNS TRIGGER AS $$
DECLARE
  existing_upload RECORD;
BEGIN
  -- Check for exact hash matches
  FOR existing_upload IN 
    SELECT id FROM public.upload_metadata 
    WHERE hash_value = NEW.hash_value 
    AND id != NEW.id 
    AND is_active = true
  LOOP
    INSERT INTO public.duplicate_detection (
      original_upload_id, 
      duplicate_upload_id, 
      similarity_score, 
      detection_method
    ) VALUES (
      existing_upload.id, 
      NEW.id, 
      1.00, 
      'hash'
    );
  END LOOP;

  -- Check for similar filenames (simple approach)
  FOR existing_upload IN 
    SELECT id FROM public.upload_metadata 
    WHERE file_name ILIKE '%' || split_part(NEW.file_name, '.', 1) || '%'
    AND id != NEW.id 
    AND is_active = true
    AND file_type = NEW.file_type
    LIMIT 5
  LOOP
    INSERT INTO public.duplicate_detection (
      original_upload_id, 
      duplicate_upload_id, 
      similarity_score, 
      detection_method
    ) VALUES (
      existing_upload.id, 
      NEW.id, 
      0.75, 
      'filename'
    );
  END LOOP;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for duplicate detection
CREATE TRIGGER detect_duplicates_trigger
AFTER INSERT ON public.upload_metadata
FOR EACH ROW
EXECUTE FUNCTION public.detect_duplicate_uploads();
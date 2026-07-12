-- Fix remaining security warning: Add search_path to detect_duplicate_uploads function

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
$$ LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public;
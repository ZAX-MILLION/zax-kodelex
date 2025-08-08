-- Fix security warnings: Add search_path to functions

-- Fix calculate_upload_hash function
CREATE OR REPLACE FUNCTION public.calculate_upload_hash(file_path TEXT, file_size BIGINT)
RETURNS TEXT AS $$
BEGIN
  -- Simple hash based on path and size for now
  -- In production, this could be enhanced with actual file content hashing
  RETURN encode(digest(file_path || '::' || file_size::text, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER
SET search_path = public;
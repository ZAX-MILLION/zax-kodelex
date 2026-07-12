-- Create scheduled deduplication job
-- Enable pg_cron extension for scheduled tasks
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create the deduplication function
CREATE OR REPLACE FUNCTION public.run_scheduled_deduplication()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  duplicate_record RECORD;
  older_upload_id UUID;
BEGIN
  -- Find exact hash duplicates and mark older ones as archived
  FOR duplicate_record IN 
    SELECT 
      hash_value,
      array_agg(id ORDER BY created_at ASC) as upload_ids,
      array_agg(created_at ORDER BY created_at ASC) as created_dates
    FROM public.upload_metadata 
    WHERE hash_value IS NOT NULL 
    AND is_active = true
    GROUP BY hash_value 
    HAVING count(*) > 1
  LOOP
    -- Get the older upload IDs (all except the most recent)
    FOR i IN 1..(array_length(duplicate_record.upload_ids, 1) - 1) LOOP
      older_upload_id := duplicate_record.upload_ids[i];
      
      -- Mark as archived
      UPDATE public.upload_metadata 
      SET is_active = false, 
          metadata = jsonb_set(
            COALESCE(metadata, '{}'::jsonb), 
            '{archive_reason}', 
            '"duplicate_detected"'::jsonb
          )
      WHERE id = older_upload_id;
      
      -- Log the action
      INSERT INTO public.system_logs (level, message, metadata)
      VALUES (
        'info',
        'Automatically archived duplicate upload',
        jsonb_build_object(
          'archived_upload_id', older_upload_id,
          'hash_value', duplicate_record.hash_value,
          'action', 'scheduled_deduplication'
        )
      );
    END LOOP;
  END LOOP;
  
  -- Update duplicate detection table with any new findings
  INSERT INTO public.duplicate_detection (
    original_upload_id, 
    duplicate_upload_id, 
    similarity_score, 
    detection_method,
    created_at
  )
  SELECT 
    u1.id as original_upload_id,
    u2.id as duplicate_upload_id,
    1.00 as similarity_score,
    'scheduled_scan' as detection_method,
    now() as created_at
  FROM public.upload_metadata u1
  JOIN public.upload_metadata u2 ON u1.hash_value = u2.hash_value
  WHERE u1.id != u2.id 
  AND u1.created_at < u2.created_at
  AND u1.is_active = false
  AND u2.is_active = true
  AND NOT EXISTS (
    SELECT 1 FROM public.duplicate_detection d
    WHERE d.original_upload_id = u1.id AND d.duplicate_upload_id = u2.id
  );
END;
$$;

-- Schedule the deduplication job to run every 6 hours
SELECT cron.schedule(
  'scheduled-deduplication',
  '0 */6 * * *', -- Every 6 hours
  $$SELECT public.run_scheduled_deduplication();$$
);

-- Create RLS policy to prevent placeholder content insertion
CREATE OR REPLACE FUNCTION public.contains_placeholder_content(content_text text)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  -- Check for common placeholder patterns
  RETURN (
    content_text ~* 'lorem ipsum|placeholder|sample text|test content|dummy|example|TODO|FIXME|coming soon'
    OR content_text ~* 'your (title|name|content) here'
    OR content_text ~* 'replace (this|me|with)'
    OR content_text = ''
    OR length(trim(content_text)) < 3
  );
END;
$$;

-- Add RLS policies to prevent placeholder content
DO $$
DECLARE
  table_name text;
  column_name text;
  tables_and_columns text[][] := ARRAY[
    ['manga_series', 'title'],
    ['manga_series', 'description'],
    ['chapters', 'title'],
    ['user_comments', 'content'],
    ['system_announcements', 'content'],
    ['system_announcements', 'title']
  ];
BEGIN
  FOR i IN 1..array_length(tables_and_columns, 1) LOOP
    table_name := tables_and_columns[i][1];
    column_name := tables_and_columns[i][2];
    
    -- Create policy name dynamically
    EXECUTE format('
      DROP POLICY IF EXISTS "prevent_placeholder_%s_%s" ON %s;
      CREATE POLICY "prevent_placeholder_%s_%s" ON %s
      FOR INSERT WITH CHECK (NOT public.contains_placeholder_content(%s));
    ', table_name, column_name, table_name, table_name, column_name, table_name, column_name);
  END LOOP;
END;
$$;
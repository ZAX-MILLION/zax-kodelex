import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface UploadRecord {
  id: string;
  file_name: string;
  file_size: number;
  file_path: string;
  hash_value: string | null;
  created_at: string;
  is_active: boolean;
}

interface DuplicateMatch {
  original_id: string;
  duplicate_id: string;
  similarity_score: number;
  detection_method: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });

    console.log('🔍 Starting scheduled deduplication scan...');

    // Call the database function for comprehensive deduplication
    const { data, error } = await supabase.rpc('run_scheduled_deduplication');
    
    if (error) {
      console.error('❌ Deduplication function error:', error);
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: error.message 
        }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('✅ Database deduplication completed');

    // Perform additional file-level deduplication
    const { data: uploads, error: uploadsError } = await supabase
      .from('upload_metadata')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    if (uploadsError) {
      console.warn('⚠️ Could not fetch uploads for additional processing:', uploadsError);
    }

    const duplicates: DuplicateMatch[] = [];
    const hashUpdates: { id: string; hash_value: string }[] = [];

    // Helper function to calculate simple hash
    const calculateSimpleHash = (fileName: string, fileSize: number, filePath: string): string => {
      const hashInput = `${fileName}::${fileSize}::${filePath}`;
      // Simple hash calculation using Web Crypto API
      const encoder = new TextEncoder();
      const data = encoder.encode(hashInput);
      return btoa(String.fromCharCode(...data)).substring(0, 32);
    };

    // Process uploads to calculate hashes and find duplicates
    const uploadMap = new Map<string, UploadRecord>();
    const hashToUpload = new Map<string, UploadRecord>();

    for (const upload of uploads || []) {
      uploadMap.set(upload.id, upload);

      // Calculate hash if missing
      let hash = upload.hash_value;
      if (!hash) {
        hash = calculateSimpleHash(upload.file_name, upload.file_size, upload.file_path);
        hashUpdates.push({ id: upload.id, hash_value: hash });
      }

      // Check for exact hash matches
      const existing = hashToUpload.get(hash);
      if (existing) {
        // Found duplicate based on hash
        duplicates.push({
          original_id: existing.id,
          duplicate_id: upload.id,
          similarity_score: 1.0,
          detection_method: 'hash'
        });
        console.log(`Found exact duplicate: ${upload.file_name} matches ${existing.file_name}`);
      } else {
        hashToUpload.set(hash, upload);
      }
    }

    // Find similar filenames (potential duplicates)
    const uploadList = Array.from(uploadMap.values());
    for (let i = 0; i < uploadList.length; i++) {
      for (let j = i + 1; j < uploadList.length; j++) {
        const upload1 = uploadList[i];
        const upload2 = uploadList[j];

        // Skip if already found as exact duplicate
        const alreadyDetected = duplicates.some(d => 
          (d.original_id === upload1.id && d.duplicate_id === upload2.id) ||
          (d.original_id === upload2.id && d.duplicate_id === upload1.id)
        );

        if (alreadyDetected) continue;

        // Check filename similarity
        const name1 = upload1.file_name.toLowerCase().replace(/\.[^/.]+$/, ''); // Remove extension
        const name2 = upload2.file_name.toLowerCase().replace(/\.[^/.]+$/, '');

        // Simple similarity check
        if (name1.includes(name2) || name2.includes(name1)) {
          const similarity = Math.min(name1.length, name2.length) / Math.max(name1.length, name2.length);
          if (similarity > 0.8) {
            duplicates.push({
              original_id: upload1.created_at < upload2.created_at ? upload1.id : upload2.id,
              duplicate_id: upload1.created_at < upload2.created_at ? upload2.id : upload1.id,
              similarity_score: similarity,
              detection_method: 'filename'
            });
            console.log(`Found similar filenames: ${upload1.file_name} ~ ${upload2.file_name} (${similarity.toFixed(2)})`);
          }
        }

        // Check file size similarity for same file types
        const ext1 = upload1.file_name.split('.').pop()?.toLowerCase();
        const ext2 = upload2.file_name.split('.').pop()?.toLowerCase();
        
        if (ext1 === ext2 && Math.abs(upload1.file_size - upload2.file_size) === 0) {
          duplicates.push({
            original_id: upload1.created_at < upload2.created_at ? upload1.id : upload2.id,
            duplicate_id: upload1.created_at < upload2.created_at ? upload2.id : upload1.id,
            similarity_score: 0.9,
            detection_method: 'size_match'
          });
          console.log(`Found size match: ${upload1.file_name} = ${upload2.file_name} (${upload1.file_size} bytes)`);
        }
      }
    }

    // Update missing hash values
    if (hashUpdates.length > 0) {
      console.log(`Updating ${hashUpdates.length} missing hash values...`);
      for (const update of hashUpdates) {
        await supabase
          .from('upload_metadata')
          .update({ hash_value: update.hash_value })
          .eq('id', update.id);
      }
    }

    // Insert duplicate detections
    if (duplicates.length > 0) {
      console.log(`Inserting ${duplicates.length} duplicate detections...`);
      
      const duplicateRecords = duplicates.map(d => ({
        original_upload_id: d.original_id,
        duplicate_upload_id: d.duplicate_id,
        similarity_score: d.similarity_score,
        detection_method: d.detection_method,
        status: 'pending'
      }));

      const { error: insertError } = await supabase
        .from('duplicate_detection')
        .upsert(duplicateRecords, { 
          onConflict: 'original_upload_id,duplicate_upload_id',
          ignoreDuplicates: true 
        });

      if (insertError) {
        console.error('Failed to insert duplicate detections:', insertError);
      }

      // Archive older duplicate files automatically
      console.log('Auto-archiving older duplicate files...');
      for (const duplicate of duplicates) {
        if (duplicate.similarity_score >= 0.95) { // High confidence duplicates
          await supabase
            .from('upload_metadata')
            .update({ is_active: false })
            .eq('id', duplicate.duplicate_id);
          
          console.log(`Auto-archived duplicate: ${duplicate.duplicate_id}`);
        }
      }
    }

    // Create admin notification for duplicates found
    if (duplicates.length > 0) {
      const { error: notificationError } = await supabase
        .from('global_notifications')
        .insert({
          title: 'Duplicate Files Detected',
          message: `Scheduled scan found ${duplicates.length} potential duplicate files. ${duplicates.filter(d => d.similarity_score >= 0.95).length} high-confidence duplicates were auto-archived.`,
          type: 'warning',
          is_active: true,
          show_on_all_pages: false,
          expire_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      if (notificationError) {
        console.warn('⚠️ Could not create admin notification:', notificationError);
      }
    }

    // Get final summary statistics
    const { data: duplicateStats, error: statsError } = await supabase
      .from('duplicate_detection')
      .select('detection_method, status, created_at')
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (statsError) {
      console.warn('⚠️ Could not fetch duplicate stats:', statsError);
    }

    const recentDuplicates = duplicateStats?.length || 0;
    const autoArchived = duplicates.filter(d => d.similarity_score >= 0.95).length;

    console.log(`🎯 Deduplication scan complete:`);
    console.log(`   - Found ${duplicates.length} duplicates`);
    console.log(`   - Updated ${hashUpdates.length} hash values`);
    console.log(`   - Auto-archived ${autoArchived} high-confidence duplicates`);
    console.log(`   - Total duplicates in last 24h: ${recentDuplicates}`);

    // Log the completion to system logs
    try {
      await supabase.from('system_logs').insert({
        level: 'info',
        message: 'Scheduled deduplication scan completed successfully',
        metadata: {
          duplicates_found: duplicates.length,
          hashes_updated: hashUpdates.length,
          auto_archived: autoArchived,
          duplicates_24h: recentDuplicates,
          execution_time: new Date().toISOString(),
          trigger: 'scheduled'
        }
      });
    } catch (logError) {
      console.warn('⚠️ Could not log to system_logs:', logError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        duplicates_found: duplicates.length,
        hashes_updated: hashUpdates.length,
        auto_archived: autoArchived,
        duplicates_24h: recentDuplicates,
        scan_timestamp: new Date().toISOString(),
        message: 'Deduplication scan completed successfully'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('💥 Unexpected error during deduplication:', error);
    
    // Try to log the error
    try {
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL')!,
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      );
      
      await supabase.from('system_logs').insert({
        level: 'error',
        message: 'Scheduled deduplication scan failed',
        metadata: {
          error: error.message,
          stack: error.stack,
          execution_time: new Date().toISOString(),
          trigger: 'scheduled'
        }
      });
    } catch (logError) {
      console.error('Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: 'Deduplication scan failed',
        details: error.message,
        scan_timestamp: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
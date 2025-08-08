import { supabase } from '@/integrations/supabase/client';

export const cleanupDemoData = async () => {
  try {
    console.log('🧹 Starting demo data cleanup...');

    // Delete in order to avoid foreign key constraints
    
    // 1. Delete chapter-related data first
    const { error: chaptersError } = await supabase
      .from('chapters')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all except system entries
    
    if (chaptersError) {
      console.warn('Warning cleaning chapters:', chaptersError);
    } else {
      console.log('✅ Cleaned up chapters');
    }

    // 2. Delete series views
    const { error: viewsError } = await supabase
      .from('series_views')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (viewsError) {
      console.warn('Warning cleaning views:', viewsError);
    } else {
      console.log('✅ Cleaned up series views');
    }

    // 3. Delete comments (if any)
    const { error: commentsError } = await supabase
      .from('comments')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (commentsError) {
      console.warn('Warning cleaning comments:', commentsError);
    } else {
      console.log('✅ Cleaned up comments');
    }

    // 4. Delete manga series last
    const { error: seriesError } = await supabase
      .from('manga_meta')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000');
    
    if (seriesError) {
      console.warn('Warning cleaning manga_meta:', seriesError);
    } else {
      console.log('✅ Cleaned up manga series');
    }

    // 5. Reset sequences (if using PostgreSQL)
    try {
      // Note: This won't work in client-side code, but good for reference
      console.log('📝 Consider running sequence resets on server if needed');
    } catch (error) {
      console.log('Info: Sequence reset not available in client context');
    }

    console.log('🎉 Demo data cleanup completed successfully!');
    return { success: true };

  } catch (error) {
    console.error('❌ Error during cleanup:', error);
    return { success: false, error };
  }
};

export const confirmAndCleanup = async (): Promise<boolean> => {
  const confirmed = window.confirm(
    'Are you sure you want to delete ALL existing manga/novel data? This cannot be undone.'
  );
  
  if (!confirmed) {
    return false;
  }

  const result = await cleanupDemoData();
  
  if (result.success) {
    alert('Demo data cleanup completed successfully!');
    return true;
  } else {
    alert('Error during cleanup. Check console for details.');
    return false;
  }
};
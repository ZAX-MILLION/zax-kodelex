import { supabase } from '@/integrations/supabase/client';
import { getFallbackCoverImage } from '@/utils/imageOptimization';

/**
 * Fixes broken cover image URLs in the database
 * Converts /src/assets/ paths to proper public paths and adds fallbacks
 */
export const fixSeriesImages = async () => {
  try {
    console.log('Fetching series with broken image URLs...');
    
    // Get all series
    const { data: allSeries, error: fetchError } = await supabase
      .from('manga_meta')
      .select('id, title, cover_image_url');

    if (fetchError) {
      throw fetchError;
    }

    if (!allSeries || allSeries.length === 0) {
      console.log('No series found');
      return;
    }

    console.log(`Found ${allSeries.length} series to check`);

    // Fix image URLs
    const updates = allSeries.map(series => {
      let newCoverUrl = series.cover_image_url;

      // Convert /src/assets/ paths to proper public paths
      if (newCoverUrl?.startsWith('/src/assets/')) {
        newCoverUrl = newCoverUrl.replace('/src/assets/', '/');
      }
      
      // Add leading slash to relative paths
      if (newCoverUrl && !newCoverUrl.startsWith('/') && !newCoverUrl.includes('://')) {
        newCoverUrl = `/${newCoverUrl}`;
      }

      // If no cover URL or invalid, use fallback
      if (!newCoverUrl || newCoverUrl.includes('/placeholder.svg')) {
        newCoverUrl = getFallbackCoverImage(series.id);
      }

      return {
        id: series.id,
        oldUrl: series.cover_image_url,
        newUrl: newCoverUrl,
        needsUpdate: series.cover_image_url !== newCoverUrl
      };
    });

    const seriesToUpdate = updates.filter(u => u.needsUpdate);
    
    if (seriesToUpdate.length === 0) {
      console.log('All series already have valid image URLs');
      return;
    }

    console.log(`Updating ${seriesToUpdate.length} series with fixed image URLs...`);

    // Update in batches
    const batchSize = 10;
    for (let i = 0; i < seriesToUpdate.length; i += batchSize) {
      const batch = seriesToUpdate.slice(i, i + batchSize);
      
      const updatePromises = batch.map(update =>
        supabase
          .from('manga_meta')
          .update({ cover_image_url: update.newUrl })
          .eq('id', update.id)
      );

      const results = await Promise.all(updatePromises);
      const hasErrors = results.some(result => result.error);

      if (hasErrors) {
        console.error('Error updating batch:', results.filter(r => r.error).map(r => r.error));
      } else {
        console.log(`Updated batch ${Math.floor(i / batchSize) + 1}`);
      }
    }

    console.log('✅ Successfully fixed all series cover images');
    
    // Log the changes
    seriesToUpdate.forEach(update => {
      console.log(`📸 ${update.id}: ${update.oldUrl} → ${update.newUrl}`);
    });

    return {
      total: allSeries.length,
      updated: seriesToUpdate.length,
      changes: seriesToUpdate
    };

  } catch (error) {
    console.error('❌ Error fixing series images:', error);
    throw error;
  }
};

/**
 * Quick function to run the image fix from console
 */
export const runImageFix = async () => {
  try {
    const result = await fixSeriesImages();
    console.log('Image fix completed:', result);
    return result;
  } catch (error) {
    console.error('Image fix failed:', error);
    return null;
  }
};

// Make available globally for easy testing
if (typeof window !== 'undefined') {
  (window as any).fixSeriesImages = runImageFix;
}
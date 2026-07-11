import { supabase } from '@/integrations/supabase/client';

export const seedTestViews = async () => {
  try {
    // Get some series IDs
    const { data: series } = await supabase
      .from('manga_meta')
      .select('id')
      .limit(10);

    if (!series || series.length === 0) {
      console.log('No series found to add views to');
      return;
    }

    // Add views for each series to make them show up as trending
    const viewPromises = series.map(async (seriesItem, index) => {
      const viewCount = Math.floor(Math.random() * 50) + 10; // Random views between 10-60
      
      // Insert multiple views for each series
      const views = Array.from({ length: viewCount }, (_, viewIndex) => ({
        series_id: seriesItem.id,
        user_id: null,
        ip_address: `192.168.1.${index + viewIndex + 1}`,
        user_agent: 'TestUserAgent',
        referrer: 'https://example.com',
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() // Random time in last 7 days
      }));

      return supabase.from('series_views').insert(views);
    });

    await Promise.all(viewPromises);
    console.log('Test views seeded successfully');
  } catch (error) {
    console.error('Error seeding test views:', error);
  }
};

export const updateMangaViewCounts = async () => {
  try {
    // Update view counts in manga_meta based on series_views
    const { data: viewCounts } = await supabase
      .from('series_views')
      .select('series_id')
      .then(response => {
        if (response.data) {
          const counts: { [key: string]: number } = {};
          response.data.forEach(view => {
            counts[view.series_id] = (counts[view.series_id] || 0) + 1;
          });
          return { data: Object.entries(counts).map(([id, count]) => ({ series_id: id, count })) };
        }
        return { data: [] };
      });

    if (viewCounts) {
      const updatePromises = viewCounts.map(({ series_id, count }) =>
        supabase
          .from('manga_meta')
          .update({ view_count: count })
          .eq('id', series_id)
      );

      await Promise.all(updatePromises);
      console.log('View counts updated successfully');
    }
  } catch (error) {
    console.error('Error updating view counts:', error);
  }
};
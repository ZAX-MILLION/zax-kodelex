import { useState, useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  activateDemoMode,
  getDemoChapterFeed,
  isDemoModeEnabled,
  shouldUseDemoData,
} from '@/utils/demoLibraryData';

export interface ChapterFeedItem {
  chapter_id: string;
  chapter_title: string;
  chapter_number: number;
  series_id: string;
  series_title: string;
  cover_image_url: string;
  created_at: string;
  is_locked?: boolean;
  unlock_cost?: number;
}

export const useChaptersFeed = (daysBack = 30, limit = 10) => {
  const [chapters, setChapters] = useState<ChapterFeedItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchChaptersFeed = async () => {
    try {
      setLoading(true);

      if (isDemoModeEnabled() || !isSupabaseConfigured) {
        activateDemoMode();
        setChapters(getDemoChapterFeed(limit));
        return;
      }
      
      const { data, error } = await supabase
        .rpc('get_latest_chapters_feed_all', { 
          days_back: daysBack, 
          limit_count: limit 
        });

      if (error) throw error;

      if (shouldUseDemoData(data)) {
        activateDemoMode();
        setChapters(getDemoChapterFeed(limit));
        return;
      }

      const formattedChapters: ChapterFeedItem[] = data?.map((item: any) => ({
        chapter_id: item.chapter_id,
        chapter_title: item.chapter_title || `Chapter ${item.chapter_number}`,
        chapter_number: item.chapter_number,
        series_id: item.series_id,
        series_title: item.series_title,
        cover_image_url: item.cover_image_url || '/placeholder.svg',
        created_at: item.created_at,
        is_locked: item.is_locked,
        unlock_cost: item.unlock_cost
      })) || [];

      setChapters(formattedChapters);
    } catch (err) {
      console.error('Error fetching chapters feed via RPC, falling back to select:', err);
      // Fallback: select-based query if RPC is unavailable
      try {
        const since = new Date(Date.now() - daysBack * 24 * 60 * 60 * 1000).toISOString();
        const { data: chaptersData, error: chaptersError } = await supabase
          .from('chapters')
          .select('id, title, chapter_number, series_id, created_at, is_locked')
          .gte('created_at', since)
          .order('created_at', { ascending: false })
          .limit(limit);

        if (chaptersError) throw chaptersError;

        const seriesIds = Array.from(new Set((chaptersData || []).map(c => c.series_id)));
        const { data: seriesMeta } = await supabase
          .from('manga_meta')
          .select('id, title, cover_image_url')
          .in('id', seriesIds);
        const seriesMap = new Map((seriesMeta || []).map(s => [s.id, s]));

        const fallbackChapters: ChapterFeedItem[] = (chaptersData || []).map(c => ({
          chapter_id: c.id,
          chapter_title: c.title || `Chapter ${c.chapter_number}`,
          chapter_number: c.chapter_number,
          series_id: c.series_id,
          series_title: seriesMap.get(c.series_id)?.title || 'Unknown Series',
          cover_image_url: seriesMap.get(c.series_id)?.cover_image_url || '/placeholder.svg',
          created_at: c.created_at as any,
          is_locked: (c as any).is_locked
        }));

        setChapters(fallbackChapters);
      } catch (fallbackErr) {
        console.error('Fallback select query also failed:', fallbackErr);
        activateDemoMode();
        setChapters(getDemoChapterFeed(limit));
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChaptersFeed();
  }, [daysBack, limit]);

  return { chapters, loading, refreshFeed: fetchChaptersFeed };
};
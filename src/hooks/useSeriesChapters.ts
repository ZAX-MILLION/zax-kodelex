import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
  activateDemoMode,
  getDemoChaptersForSeries,
  isDemoSeriesId,
  shouldUseDemoData,
} from '@/utils/demoLibraryData';

export interface SeriesChapter {
  id: string;
  series_id: string;
  chapter_number: number;
  title: string;
  pages: string[];
  page_count: number;
  release_date: string;
  is_locked: boolean;
  sort_order: number;
}

export const useSeriesChapters = (seriesId?: string) => {
  const [chapters, setChapters] = useState<SeriesChapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeriesChapters = async () => {
    if (!seriesId) {
      setChapters([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .eq('series_id', seriesId)
        .order('chapter_number', { ascending: true });

      if (shouldUseDemoData(data, error) || isDemoSeriesId(seriesId)) {
        activateDemoMode();
        const demoChapters = getDemoChaptersForSeries(seriesId).map((chapter) => ({
          id: chapter.id,
          series_id: chapter.series_id,
          chapter_number: chapter.chapter_number,
          title: chapter.title,
          pages: chapter.pages,
          page_count: chapter.page_count,
          release_date: chapter.release_date,
          is_locked: chapter.is_locked,
          sort_order: chapter.sort_order,
        }));
        setChapters(demoChapters);
        return;
      }

      const formattedChapters: SeriesChapter[] = data?.map(chapter => {
        // Handle pages field - it might be JSON string or array
        let pages: string[] = [];
        if (chapter.pages) {
          if (typeof chapter.pages === 'string') {
            try {
              const parsed = JSON.parse(chapter.pages);
              pages = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
            } catch (e) {
              console.warn('Failed to parse pages JSON for chapter', chapter.id, e);
              pages = [];
            }
          } else if (Array.isArray(chapter.pages)) {
            pages = chapter.pages.filter((p): p is string => typeof p === 'string');
          }
        }

        return {
          id: chapter.id,
          series_id: chapter.series_id,
          chapter_number: chapter.chapter_number,
          title: chapter.title || `Chapter ${chapter.chapter_number}`,
          pages,
          page_count: pages.length || chapter.page_count || 0,
          release_date: chapter.release_date,
          is_locked: chapter.is_locked || false,
          sort_order: chapter.sort_order || chapter.chapter_number,
        };
      }) || [];

      console.log(`Fetched ${formattedChapters.length} chapters for series ${seriesId}`);
      setChapters(formattedChapters);
    } catch (err) {
      console.error('Error fetching series chapters:', err);
      if (seriesId) {
        activateDemoMode();
        setChapters(
          getDemoChaptersForSeries(seriesId).map((chapter) => ({
            id: chapter.id,
            series_id: chapter.series_id,
            chapter_number: chapter.chapter_number,
            title: chapter.title,
            pages: chapter.pages,
            page_count: chapter.page_count,
            release_date: chapter.release_date,
            is_locked: chapter.is_locked,
            sort_order: chapter.sort_order,
          }))
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const getChapterById = (chapterId: string) => {
    return chapters.find(chapter => chapter.id === chapterId);
  };

  const getChapterByNumber = (chapterNumber: number) => {
    return chapters.find(chapter => chapter.chapter_number === chapterNumber);
  };

  useEffect(() => {
    fetchSeriesChapters();
  }, [seriesId]);

  return {
    chapters,
    loading,
    error,
    refreshChapters: fetchSeriesChapters,
    getChapterById,
    getChapterByNumber,
  };
};
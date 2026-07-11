import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  activateDemoMode,
  getDemoChapterById,
  isDemoChapterId,
} from '@/utils/demoLibraryData';

export const useChapterPages = (chapterId?: string) => {
  const [pages, setPages] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchChapterPages = async () => {
    if (!chapterId) {
      setPages([]);
      return;
    }

    if (isDemoChapterId(chapterId)) {
      activateDemoMode();
      const chapter = getDemoChapterById(chapterId);
      setPages(chapter?.pages || []);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('chapters')
        .select('pages, page_count, series_id, chapter_number')
        .eq('id', chapterId)
        .single();

      if (error) {
        console.error('Error fetching chapter pages:', error);
        const demoChapter = getDemoChapterById(chapterId);
        if (demoChapter) {
          activateDemoMode();
          setPages(demoChapter.pages);
          return;
        }
        setError('Failed to load chapter pages');
        return;
      }

      let chapterPages: string[] = [];

      if (data.pages) {
        // Handle existing pages
        if (typeof data.pages === 'string') {
          try {
            const parsed = JSON.parse(data.pages);
            chapterPages = Array.isArray(parsed) ? parsed.filter((p): p is string => typeof p === 'string') : [];
          } catch (e) {
            console.warn('Failed to parse pages JSON for chapter', chapterId, e);
          }
        } else if (Array.isArray(data.pages)) {
          chapterPages = data.pages.filter((p): p is string => typeof p === 'string');
        }
      }

      // If no pages exist, generate placeholder pages
      if (chapterPages.length === 0 && data.page_count > 0) {
        const seriesName = data.series_id.split('-')[0] || 'manga';
        chapterPages = Array.from({ length: data.page_count }, (_, i) => 
          `https://picsum.photos/seed/${seriesName}-ch${data.chapter_number}-p${i + 1}/800/1200`
        );
      }

      setPages(chapterPages);
    } catch (err) {
      console.error('Error in fetchChapterPages:', err);
      setError('Failed to load chapter pages');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChapterPages();
  }, [chapterId]);

  return {
    pages,
    loading,
    error,
    refreshPages: fetchChapterPages,
  };
};
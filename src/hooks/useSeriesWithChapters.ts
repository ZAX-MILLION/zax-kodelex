import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface ChapterInfo {
  id: string;
  chapter_number: number;
  title: string;
  release_date: string;
  is_locked: boolean;
  sort_order: number;
}

export interface SeriesWithChapters {
  id: string;
  title: string;
  author?: string;
  artist?: string;
  status: string;
  genres?: string[];
  description?: string;
  cover_image_url?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
  rating_average?: number;
  rating_count?: number;
  latest_chapters: ChapterInfo[];
  total_chapters: number;
  age_rating?: string;
}

export const useSeriesWithChapters = (filter: 'latest' | 'trending' | 'random' | 'new' = 'latest', limit = 12) => {
  const [series, setSeries] = useState<SeriesWithChapters[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeriesWithChapters = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get series data
      let seriesQuery = supabase.from('manga_meta').select('*');
      
      switch (filter) {
        case 'latest':
          seriesQuery = seriesQuery.order('updated_at', { ascending: false });
          break;
        case 'new':
          seriesQuery = seriesQuery.order('created_at', { ascending: false });
          break;
        case 'trending':
          seriesQuery = seriesQuery.order('view_count', { ascending: false });
          break;
        case 'random':
          seriesQuery = seriesQuery.order('created_at', { ascending: Math.random() > 0.5 });
          break;
      }

      const { data: seriesData, error: seriesError } = await seriesQuery.limit(limit);

      if (seriesError) throw seriesError;

      if (!seriesData || seriesData.length === 0) {
        setSeries([]);
        return;
      }

      // Get latest chapters for each series
      const seriesWithChapters = await Promise.all(
        seriesData.map(async (seriesItem) => {
          // Get latest 3 chapters for this series
          const { data: chaptersData, error: chaptersError } = await supabase
            .from('chapters')
            .select('id, chapter_number, title, release_date, is_locked, sort_order')
            .eq('series_id', seriesItem.id)
            .order('sort_order', { ascending: false })
            .limit(3);

          if (chaptersError) {
            console.error('Error fetching chapters for series', seriesItem.id, ':', chaptersError);
          }

          // Get total chapter count
          const { count: totalChapters } = await supabase
            .from('chapters')
            .select('*', { count: 'exact', head: true })
            .eq('series_id', seriesItem.id);

          const formattedChapters: ChapterInfo[] = (chaptersData || []).map(chapter => ({
            id: chapter.id,
            chapter_number: chapter.chapter_number,
            title: chapter.title || `Chapter ${chapter.chapter_number}`,
            release_date: chapter.release_date,
            is_locked: chapter.is_locked,
            sort_order: chapter.sort_order,
          }));

          return {
            id: seriesItem.id,
            title: seriesItem.title,
            author: seriesItem.author,
            artist: seriesItem.artist,
            status: seriesItem.status,
            genres: seriesItem.genres,
            description: seriesItem.description,
            cover_image_url: seriesItem.cover_image_url,
            created_at: seriesItem.created_at,
            updated_at: seriesItem.updated_at,
            view_count: seriesItem.view_count || 0,
            rating_average: seriesItem.rating_average || 0,
            rating_count: seriesItem.rating_count || 0,
            age_rating: seriesItem.age_rating,
            latest_chapters: formattedChapters,
            total_chapters: totalChapters || 0,
          };
        })
      );

      setSeries(seriesWithChapters);
    } catch (err) {
      console.error('Error fetching series with chapters:', err);
      setError('Failed to load series data');
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeriesWithChapters();
  }, [filter, limit]);

  return {
    series,
    loading,
    error,
    refreshSeries: fetchSeriesWithChapters
  };
};
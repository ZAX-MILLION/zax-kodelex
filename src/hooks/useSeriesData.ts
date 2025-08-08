import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SeriesCard {
  id: string;
  title: string;
  author?: string;
  artist?: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres?: string[];
  tags?: string[];
  description?: string;
  cover_image_url?: string;
  thumbnail_url?: string;
  view_count?: number;
  rating_average?: number;
  rating_count?: number;
  publication_date?: string;
  age_rating?: string;
  language?: string;
  content_type?: 'manga' | 'novel';
  latest_chapter?: number;
  chapter_count?: number;
  created_at: string;
  updated_at: string;
}

export const useSeriesData = () => {
  const [series, setSeries] = useState<SeriesCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeries = async (type: 'latest' | 'trending' | 'popular' = 'latest', limit = 24) => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('manga_meta')
        .select(`
          id,
          title,
          author,
          artist,
          status,
          genres,
          tags,
          description,
          cover_image_url,
          thumbnail_url,
          view_count,
          rating_average,
          rating_count,
          publication_date,
          age_rating,
          language,
          content_type,
          created_at,
          updated_at
        `)
        .limit(limit);

      // Apply ordering based on type
      switch (type) {
        case 'latest':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        case 'popular':
          query = query.order('rating_average', { ascending: false });
          break;
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching series:', error);
        setError('Failed to load series');
        toast({
          title: "Error",
          description: "Failed to load series data",
          variant: "destructive",
        });
        return;
      }

      // Get chapter counts for each series
      const seriesWithChapters = await Promise.all(
        (data || []).map(async (series) => {
          const { data: chapters } = await supabase
            .from('chapters')
            .select('chapter_number, is_locked') // Include locked chapters
            .eq('series_id', series.id)
            .order('chapter_number', { ascending: false })
            .limit(1);

          return {
            ...series,
            content_type: series.content_type as 'manga' | 'novel',
            status: series.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
            latest_chapter: chapters?.[0]?.chapter_number || 0,
            chapter_count: chapters?.length || 0, // Count all chapters including locked
          };
        })
      );

      setSeries(seriesWithChapters);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError('Failed to load series');
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    await fetchSeries();
  };

  useEffect(() => {
    fetchSeries();
  }, []);

  return {
    series,
    loading,
    error,
    fetchSeries,
    refreshData,
  };
};

export const useTrendingSeries = () => {
  const [trendingSeries, setTrendingSeries] = useState<SeriesCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTrendingSeries = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('manga_meta')
        .select(`
          id,
          title,
          author,
          cover_image_url,
          thumbnail_url,
          view_count,
          rating_average,
          content_type,
          status,
          created_at,
          updated_at
        `)
        .order('view_count', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching trending series:', error);
        setError('Failed to load trending series');
        return;
      }

      const formattedData = (data || []).map(series => ({
        ...series,
        content_type: series.content_type as 'manga' | 'novel',
        status: series.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
      }));

      setTrendingSeries(formattedData);
    } catch (err) {
      console.error('Error fetching trending series:', err);
      setError('Failed to load trending series');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingSeries();
  }, []);

  return {
    trendingSeries,
    loading,
    error,
    refreshTrendingSeries: fetchTrendingSeries,
  };
};
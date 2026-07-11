import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFallbackCoverImage, isValidImageUrl } from '@/utils/imageOptimization';

export interface HomepageWidget {
  id: string;
  widget_type: string;
  widget_name: string;
  is_enabled: boolean;
  display_order: number;
  settings: {
    items_count?: number;
    title?: string;
    [key: string]: any;
  };
}

export interface HomepageSettings {
  id: string;
  hero_slides_count: number;
  latest_comics_count: number;
  trending_count: number;
  auto_slide_interval: number;
  show_content_type_filter: boolean;
  feed_chapters_count: number;
  blog_posts_count: number;
}

export interface SeriesCard {
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
  latest_chapter?: number;
}

export const useHomepageWidgets = () => {
  const [widgets, setWidgets] = useState<HomepageWidget[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchWidgets = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_widgets')
        .select('*')
        .eq('is_enabled', true)
        .order('display_order', { ascending: true });

      if (error) throw error;
      const formattedWidgets: HomepageWidget[] = data?.map(widget => ({
        id: widget.id,
        widget_type: widget.widget_type,
        widget_name: widget.widget_name,
        is_enabled: widget.is_enabled,
        display_order: widget.display_order,
        settings: (widget.settings as any) || {}
      })) || [];
      setWidgets(formattedWidgets);
    } catch (err) {
      console.error('Error fetching widgets:', err);
      setError('Failed to load widgets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWidgets();
  }, []);

  return { widgets, loading, error, refreshWidgets: fetchWidgets };
};

export const useHomepageSettings = () => {
  const [settings, setSettings] = useState<HomepageSettings | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('homepage_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (err) {
      console.error('Error fetching homepage settings:', err);
      // Use defaults if no settings found
      setSettings({
        id: '',
        hero_slides_count: 10,
        latest_comics_count: 16,
        trending_count: 12,
        auto_slide_interval: 5000,
        show_content_type_filter: true,
        feed_chapters_count: 10,
        blog_posts_count: 6
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return { settings, loading, refreshSettings: fetchSettings };
};

export const useSeriesData = () => {
  const [series, setSeries] = useState<SeriesCard[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSeries = async (
    filter: 'latest' | 'trending' | 'random' | 'new' = 'latest', 
    limit = 12, 
    offset = 0
  ) => {
    try {
      // Get total count first
      const countQuery = supabase.from('manga_meta').select('*', { count: 'exact', head: true });
      const { count, error: countError } = await countQuery;
      if (countError) throw countError;
      setTotalCount(count || 0);

      // Get paginated data
      let query = supabase.from('manga_meta').select('*');
      
      switch (filter) {
        case 'latest':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'new':
          query = query.order('created_at', { ascending: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        case 'random':
          query = query.order('created_at', { ascending: Math.random() > 0.5 });
          break;
      }

      const { data, error } = await query.range(offset, offset + limit - 1);

      if (error) throw error;

      // Get latest chapter data for each series
      const seriesIds = data?.map(item => item.id) || [];
      let chapterData: any[] = [];
      
      if (seriesIds.length > 0) {
        const { data: chapters } = await supabase
          .from('chapters')
          .select('series_id, chapter_number')
          .in('series_id', seriesIds)
          .order('chapter_number', { ascending: false });
        
        chapterData = chapters || [];
      }

      const formattedSeries: SeriesCard[] = data?.map(item => {
        const seriesChapters = chapterData.filter(ch => ch.series_id === item.id);
        const latestChapter = seriesChapters.length > 0 ? Math.max(...seriesChapters.map(ch => ch.chapter_number)) : 0;
        
        // Ensure cover image is valid or provide fallback
        const coverImageUrl = isValidImageUrl(item.cover_image_url) 
          ? item.cover_image_url 
          : getFallbackCoverImage(item.id);
        
        return {
          id: item.id,
          title: item.title,
          author: item.author,
          artist: item.artist,
          status: item.status,
          genres: item.genres,
          description: item.description,
          cover_image_url: coverImageUrl,
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: item.view_count || 0,
          latest_chapter: latestChapter
        };
      }) || [];

      setSeries(formattedSeries);
    } catch (err) {
      console.error('Error fetching series:', err);
      toast({
        title: "Error",
        description: "Failed to load series data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const recordSeriesView = async (seriesId: string) => {
    try {
      const { error } = await supabase
        .from('series_views')
        .insert({
          series_id: seriesId,
          user_id: (await supabase.auth.getUser()).data.user?.id || null,
          ip_address: null, // Would need backend service to get real IP
          user_agent: navigator.userAgent,
          referrer: document.referrer
        });

      if (error) {
        console.error('Error recording view:', error);
      }
    } catch (err) {
      console.error('Error recording series view:', err);
    }
  };

  return {
    series,
    totalCount,
    loading,
    fetchSeries,
    recordSeriesView,
    refreshSeries: () => fetchSeries()
  };
};

export const useTrendingSeries = (daysBack = 7, limit = 12) => {
  const [trendingSeries, setTrendingSeries] = useState<SeriesCard[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTrendingSeries = async () => {
    try {
      setLoading(true);
      // Get trending series IDs from the database function
      const { data: trendingData, error: trendingError } = await supabase
        .rpc('get_trending_series', { days_back: daysBack, limit_count: limit });

      if (trendingError) {
        console.error('Trending series error:', trendingError);
        // Fallback to popular series by view count
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('manga_meta')
          .select('*')
          .order('view_count', { ascending: false })
          .limit(limit);
        
        if (fallbackError) throw fallbackError;
        
        const fallbackSeries: SeriesCard[] = fallbackData?.map(item => ({
          id: item.id,
          title: item.title,
          author: item.author,
          artist: item.artist,
          status: item.status,
          genres: item.genres,
          description: item.description,
          cover_image_url: isValidImageUrl(item.cover_image_url) ? item.cover_image_url : getFallbackCoverImage(item.id),
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: item.view_count || 0,
          latest_chapter: 0
        })) || [];
        
        setTrendingSeries(fallbackSeries);
        return;
      }

      if (!trendingData || trendingData.length === 0) {
        // Fallback to recent series if no trending data
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('manga_meta')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (fallbackError) throw fallbackError;
        
        const formattedSeries: SeriesCard[] = fallbackData?.map(item => ({
          id: item.id,
          title: item.title,
          author: item.author,
          artist: item.artist,
          status: item.status,
          genres: item.genres,
          description: item.description,
          cover_image_url: isValidImageUrl(item.cover_image_url) ? item.cover_image_url : getFallbackCoverImage(item.id),
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: 0
        })) || [];

        setTrendingSeries(formattedSeries);
        return;
      }

      // Get full series data for trending series
      const seriesIds = trendingData.map(item => item.series_id);
      const { data: seriesData, error: seriesError } = await supabase
        .from('manga_meta')
        .select('*')
        .in('id', seriesIds);

      if (seriesError) throw seriesError;

      // Get chapter data for trending series
      const { data: chapters } = await supabase
        .from('chapters')
        .select('series_id, chapter_number')
        .in('series_id', seriesIds)
        .order('chapter_number', { ascending: false });

      const formattedSeries: SeriesCard[] = seriesData?.map(item => {
        const trendingInfo = trendingData.find(t => t.series_id === item.id);
        const seriesChapters = chapters?.filter(ch => ch.series_id === item.id) || [];
        const latestChapter = seriesChapters.length > 0 ? Math.max(...seriesChapters.map(ch => ch.chapter_number)) : 0;
        
        return {
          id: item.id,
          title: item.title,
          author: item.author,
          artist: item.artist,
          status: item.status,
          genres: item.genres,
          description: item.description,
          cover_image_url: isValidImageUrl(item.cover_image_url) ? item.cover_image_url : getFallbackCoverImage(item.id),
          created_at: item.created_at,
          updated_at: item.updated_at,
          view_count: Number(trendingInfo?.view_count || 0),
          latest_chapter: latestChapter
        };
      }) || [];

      setTrendingSeries(formattedSeries);
    } catch (err) {
      console.error('Error fetching trending series:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrendingSeries();
  }, [daysBack, limit]);

  return { trendingSeries, loading, refreshTrending: fetchTrendingSeries };
};

export const useGenresList = () => {
  const [genres, setGenres] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  const fetchGenres = async () => {
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('genres');

      if (error) throw error;

      const genreCount: Record<string, number> = {};
      data?.forEach(item => {
        if (item.genres && Array.isArray(item.genres)) {
          item.genres.forEach(genre => {
            genreCount[genre] = (genreCount[genre] || 0) + 1;
          });
        }
      });

      const sortedGenres = Object.entries(genreCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      setGenres(sortedGenres);
    } catch (err) {
      console.error('Error fetching genres:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGenres();
  }, []);

  return { genres, loading, refreshGenres: fetchGenres };
};
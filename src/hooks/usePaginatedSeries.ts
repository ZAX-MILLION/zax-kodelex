import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getFallbackCoverImage, isValidImageUrl } from '@/utils/imageOptimization';

export interface PaginatedSeriesData {
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
  chapter_count: number;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  itemsPerPage: number;
}

export interface SeriesFilters {
  search?: string;
  genre?: string;
  status?: string;
  sortBy?: 'latest' | 'trending' | 'rating' | 'title' | 'chapters';
  hasChapters?: boolean;
}

export const usePaginatedSeries = (itemsPerPage = 12) => {
  const [series, setSeries] = useState<PaginatedSeriesData[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    currentPage: 1,
    totalPages: 0,
    totalCount: 0,
    itemsPerPage
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchSeries = async (
    page: number = 1,
    filters: SeriesFilters = {}
  ) => {
    try {
      setLoading(true);
      setError(null);

      const offset = (page - 1) * itemsPerPage;

      // Base query for series with chapter counts
      let query = supabase
        .from('manga_meta')
        .select(`
          *,
          chapters!inner(count)
        `, { count: 'exact' });

      // Apply filters
      if (filters.hasChapters) {
        // This is handled by the inner join with chapters table
      }

      if (filters.search) {
        query = query.or(`title.ilike.%${filters.search}%,author.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
      }

      if (filters.genre) {
        query = query.contains('genres', [filters.genre]);
      }

      if (filters.status && filters.status !== 'All') {
        query = query.eq('status', filters.status as any);
      }

      // Apply sorting
      switch (filters.sortBy) {
        case 'latest':
          query = query.order('updated_at', { ascending: false });
          break;
        case 'trending':
          query = query.order('view_count', { ascending: false });
          break;
        case 'rating':
          query = query.order('rating_average', { ascending: false, nullsFirst: false });
          break;
        case 'title':
          query = query.order('title', { ascending: true });
          break;
        case 'chapters':
          // Will sort by chapter count after we process the data
          break;
        default:
          query = query.order('updated_at', { ascending: false });
      }

      const { data, error: queryError, count } = await query
        .range(offset, offset + itemsPerPage - 1);

      if (queryError) throw queryError;

      if (!data) {
        setSeries([]);
        setPagination(prev => ({
          ...prev,
          currentPage: page,
          totalCount: 0,
          totalPages: 0
        }));
        return;
      }

      // Process data to get chapter counts and format properly
      const processedSeries: PaginatedSeriesData[] = data.map(item => {
        const chapterCount = Array.isArray(item.chapters) ? item.chapters.length : 0;
        
        // Ensure valid cover image
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
          rating_average: item.rating_average,
          rating_count: item.rating_count || 0,
          chapter_count: chapterCount
        };
      });

      // Sort by chapter count if needed
      if (filters.sortBy === 'chapters') {
        processedSeries.sort((a, b) => b.chapter_count - a.chapter_count);
      }

      setSeries(processedSeries);
      setPagination({
        currentPage: page,
        totalCount: count || 0,
        totalPages: Math.ceil((count || 0) / itemsPerPage),
        itemsPerPage
      });

    } catch (err) {
      console.error('Error fetching paginated series:', err);
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

  const goToPage = (page: number) => {
    if (page >= 1 && page <= pagination.totalPages) {
      fetchSeries(page);
    }
  };

  const nextPage = () => {
    if (pagination.currentPage < pagination.totalPages) {
      goToPage(pagination.currentPage + 1);
    }
  };

  const prevPage = () => {
    if (pagination.currentPage > 1) {
      goToPage(pagination.currentPage - 1);
    }
  };

  useEffect(() => {
    fetchSeries(1);
  }, [itemsPerPage]);

  return {
    series,
    pagination,
    loading,
    error,
    fetchSeries,
    goToPage,
    nextPage,
    prevPage,
    refreshSeries: () => fetchSeries(pagination.currentPage)
  };
};
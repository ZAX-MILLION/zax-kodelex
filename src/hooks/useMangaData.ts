import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface Chapter {
  id: string;
  chapter_number: number;
  title: string;
  release_date: string;
  pages: string[];
  page_count: number;
  thumbnail_url?: string;
  sort_order: number;
  is_locked: boolean;
}

export interface MangaInfo {
  id: string;
  title: string;
  author?: string;
  artist?: string;
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres?: string[];
  tags?: string[];
  description?: string;
  cover_image_url?: string;
  meta_title?: string;
  meta_description?: string;
}

export const useMultiSeriesData = () => {
  const [allSeries, setAllSeries] = useState<MangaInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAllSeries = async () => {
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching series:', error);
        setError('Failed to load series');
        return;
      }

      const formattedSeries: MangaInfo[] = data?.map(series => ({
        id: series.id,
        title: series.title || 'Untitled',
        author: series.author || undefined,
        artist: series.artist || undefined,
        status: series.status as 'ongoing' | 'completed' | 'hiatus' | 'cancelled',
        genres: series.genres || [],
        tags: series.tags || [],
        description: series.description || undefined,
        cover_image_url: series.cover_image_url || undefined,
        meta_title: series.meta_title || undefined,
        meta_description: series.meta_description || undefined,
      })) || [];

      setAllSeries(formattedSeries);
    } catch (err) {
      console.error('Error fetching series:', err);
      setError('Failed to load series');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    await fetchAllSeries();
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    allSeries,
    loading,
    error,
    refreshData,
  };
};

export const useMangaData = () => {
  const [mangaInfo, setMangaInfo] = useState<MangaInfo | null>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchMangaInfo = async () => {
    try {
      // Fetch the first manga series
      const { data, error } = await supabase
        .from('manga_meta')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1)
        .single();

      if (error) {
        console.error('Error fetching manga info:', error);
        return;
      }

      setMangaInfo(data);
    } catch (err) {
      console.error('Error fetching manga info:', err);
    }
  };

  const fetchChapters = async () => {
    try {
      const { data, error } = await supabase
        .from('chapters')
        .select('*')
        .order('sort_order', { ascending: false });

      if (error) {
        console.error('Error fetching chapters:', error);
        setError('Failed to load chapters');
        return;
      }

      const formattedChapters: Chapter[] = data?.map(chapter => {
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
          chapter_number: chapter.chapter_number,
          title: chapter.title || `Chapter ${chapter.chapter_number}`,
          release_date: chapter.release_date,
          pages,
          page_count: pages.length || chapter.page_count || 0,
          thumbnail_url: chapter.thumbnail_url || undefined,
          sort_order: chapter.sort_order,
          is_locked: chapter.is_locked || false,
        };
      }) || [];

      console.log('Fetched chapters:', formattedChapters.length, 'chapters');
      if (formattedChapters.length > 0) {
        console.log('Sample chapter pages:', formattedChapters[0].pages?.length || 0, 'pages');
      }

      setChapters(formattedChapters);
    } catch (err) {
      console.error('Error fetching chapters:', err);
      setError('Failed to load chapters');
    }
  };

  const refreshData = async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchMangaInfo(), fetchChapters()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
  }, []);

  return {
    mangaInfo,
    chapters,
    loading,
    error,
    refreshData,
  };
};

export const useReadingProgress = (userId?: string) => {
  const [progress, setProgress] = useState<Record<string, number>>({});

  const fetchProgress = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('reading_progress')
        .select('chapter_id, current_page, total_pages, completed')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching reading progress:', error);
        return;
      }

      const progressMap: Record<string, number> = {};
      data?.forEach(item => {
        if (item.completed) {
          progressMap[item.chapter_id] = 100;
        } else {
          progressMap[item.chapter_id] = Math.round((item.current_page / item.total_pages) * 100);
        }
      });

      setProgress(progressMap);
    } catch (err) {
      console.error('Error fetching reading progress:', err);
    }
  };

  const updateProgress = async (chapterId: string, currentPage: number, totalPages: number) => {
    if (!userId) return;

    const completed = currentPage >= totalPages - 1;

    try {
      const { error } = await supabase
        .from('reading_progress')
        .upsert({
          user_id: userId,
          chapter_id: chapterId,
          current_page: currentPage + 1,
          total_pages: totalPages,
          completed: completed,
          last_read_at: new Date().toISOString(),
        });

      if (error) {
        console.error('Error updating reading progress:', error);
        return;
      }

      // Update local state
      const newProgress = completed ? 100 : Math.round(((currentPage + 1) / totalPages) * 100);
      setProgress(prev => ({ ...prev, [chapterId]: newProgress }));
    } catch (err) {
      console.error('Error updating reading progress:', err);
    }
  };

  useEffect(() => {
    fetchProgress();
  }, [userId]);

  return {
    progress,
    updateProgress,
    refreshProgress: fetchProgress,
  };
};

export const useBookmarks = (userId?: string) => {
  const [bookmarks, setBookmarks] = useState<string[]>([]);

  const fetchBookmarks = async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('bookmarks')
        .select('chapter_id')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching bookmarks:', error);
        return;
      }

      setBookmarks(data?.map(b => b.chapter_id) || []);
    } catch (err) {
      console.error('Error fetching bookmarks:', err);
    }
  };

  const toggleBookmark = async (chapterId: string) => {
    if (!userId) return false;

    const isBookmarked = bookmarks.includes(chapterId);

    try {
      if (isBookmarked) {
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', userId)
          .eq('chapter_id', chapterId);

        if (error) {
          console.error('Error removing bookmark:', error);
          return isBookmarked;
        }

        setBookmarks(prev => prev.filter(id => id !== chapterId));
        return false;
      } else {
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: userId,
            chapter_id: chapterId,
            page_number: 1,
          });

        if (error) {
          console.error('Error adding bookmark:', error);
          return isBookmarked;
        }

        setBookmarks(prev => [...prev, chapterId]);
        return true;
      }
    } catch (err) {
      console.error('Error toggling bookmark:', err);
      return isBookmarked;
    }
  };

  useEffect(() => {
    fetchBookmarks();
  }, [userId]);

  return {
    bookmarks,
    toggleBookmark,
    refreshBookmarks: fetchBookmarks,
  };
};
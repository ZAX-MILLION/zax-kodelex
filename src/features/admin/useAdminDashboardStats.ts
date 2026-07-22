import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { appConfig } from '@/config/env';

export interface AdminDashboardStats {
  seriesCount: number | null;
  chapterCount: number | null;
  commentCount: number | null;
  memberCount: number | null;
  loading: boolean;
  error: string | null;
  /** True when these are real counts from Supabase (never true on the public demo). */
  isRealData: boolean;
}

const EMPTY_STATS: AdminDashboardStats = {
  seriesCount: null,
  chapterCount: null,
  commentCount: null,
  memberCount: null,
  loading: false,
  error: null,
  isRealData: false,
};

/**
 * Real totals for the admin dashboard home. Never runs on the public demo
 * build (`appConfig.hasSupabase` is forced `false` there) and never invents
 * numbers — if Supabase isn't configured, callers get `null` counts and
 * must show an honest "not connected" state instead of fake stats.
 */
export function useAdminDashboardStats(): AdminDashboardStats {
  const [stats, setStats] = useState<AdminDashboardStats>(EMPTY_STATS);

  useEffect(() => {
    if (!appConfig.hasSupabase) {
      setStats(EMPTY_STATS);
      return;
    }

    let cancelled = false;
    setStats((prev) => ({ ...prev, loading: true, error: null }));

    const loadCount = async (table: 'manga_meta' | 'chapters' | 'comments' | 'profiles') => {
      const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
      if (error) throw error;
      // `count` can legitimately be null if the PostgREST `content-range`
      // header isn't exposed cross-origin — show "unknown", never a fake 0.
      return count;
    };

    Promise.all([loadCount('manga_meta'), loadCount('chapters'), loadCount('comments'), loadCount('profiles')])
      .then(([seriesCount, chapterCount, commentCount, memberCount]) => {
        if (cancelled) return;
        setStats({
          seriesCount,
          chapterCount,
          commentCount,
          memberCount,
          loading: false,
          error: null,
          isRealData: true,
        });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setStats({
          ...EMPTY_STATS,
          loading: false,
          error: error instanceof Error ? error.message : 'Failed to load dashboard totals.',
        });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return stats;
}

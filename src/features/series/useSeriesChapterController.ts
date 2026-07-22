import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import {
  getContinueChapterNumber,
  isChapterRead,
  markAllChaptersRead,
} from '@/features/series/seriesReadingProgress';
import { getSeriesChapterGridView, type SeriesChapterGridView } from '@/features/series/seriesChapterGridView';
import {
  daysAgoFor,
  getChapterStatus,
  type ChapterAccessFilter,
  type ChapterItemDisplayState,
  type ChapterReadFilter,
  type SeriesChapterItem,
} from '@/features/series/seriesChapterTypes';

/**
 * Shared chapter list state/behavior: search, filter, sort, access checks,
 * read tracking, and navigation. Every layout's chapter presentation
 * component consumes this same controller so filter/sort/access/read/demo
 * behavior is identical everywhere — only the item markup differs per layout.
 */
export function useSeriesChapterController(chapters: SeriesChapterItem[], seriesId?: string) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [gridView, setGridView] = useState<SeriesChapterGridView>(() => getSeriesChapterGridView());
  const [sortNewestFirst, setSortNewestFirst] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [accessFilter, setAccessFilter] = useState<ChapterAccessFilter>('all');
  const [readFilter, setReadFilter] = useState<ChapterReadFilter>('all');
  const [userAccess, setUserAccess] = useState<Record<string, boolean>>({});
  const [selectedChapter, setSelectedChapter] = useState<SeriesChapterItem | null>(null);
  const [showUnlockPopup, setShowUnlockPopup] = useState(false);
  const [readTick, setReadTick] = useState(0);

  const continueChapter = seriesId ? getContinueChapterNumber(seriesId) : null;

  useEffect(() => {
    if (!user || chapters.length === 0) return;
    if (chapters.some((chapter) => chapter.id.includes('-ch-'))) return;

    let cancelled = false;
    (async () => {
      try {
        const { data } = await supabase
          .from('chapter_access')
          .select('chapter_id')
          .eq('user_id', user.id)
          .in('chapter_id', chapters.map((c) => c.id));
        if (cancelled) return;
        const accessMap: Record<string, boolean> = {};
        data?.forEach((access) => {
          accessMap[access.chapter_id] = true;
        });
        setUserAccess(accessMap);
      } catch (error) {
        console.error('Error checking user access:', error);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, chapters]);

  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === 'zax-series-chapter-grid-view' && event.newValue) {
        const parsed = parseInt(event.newValue, 10);
        if ([1, 2, 3].includes(parsed)) {
          setGridView(parsed as SeriesChapterGridView);
        }
      }
      setReadTick((n) => n + 1);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const filteredChapters = useMemo(() => {
    let list = [...chapters];
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      list = list.filter(
        (c) => c.title.toLowerCase().includes(q) || String(c.chapter_number).includes(q)
      );
    }
    if (accessFilter !== 'all') {
      list = list.filter((c) => {
        const type = c.access_type || (c.is_locked ? (c.unlock_cost > 0 ? 'coins' : 'premium') : 'free');
        return type === accessFilter;
      });
    }
    if (readFilter !== 'all' && seriesId) {
      list = list.filter((c) => {
        const read = isChapterRead(seriesId, c.chapter_number);
        return readFilter === 'read' ? read : !read;
      });
    }
    list.sort((a, b) =>
      sortNewestFirst ? b.chapter_number - a.chapter_number : a.chapter_number - b.chapter_number
    );
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chapters, searchQuery, accessFilter, readFilter, sortNewestFirst, seriesId, readTick]);

  const displayItems = useMemo<ChapterItemDisplayState[]>(
    () =>
      filteredChapters.map((chapter) => {
        const daysAgo = daysAgoFor(chapter.release_date);
        const status = getChapterStatus(chapter, userAccess);
        return {
          chapter,
          status,
          isLockedVisual: status === 'locked' || status === 'locked-premium',
          isRead: seriesId ? isChapterRead(seriesId, chapter.chapter_number) : false,
          isContinue: continueChapter === chapter.chapter_number,
          daysAgo,
          isNew: daysAgo <= 3,
          commentCount: chapter.comment_count ?? 0,
        };
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [filteredChapters, userAccess, seriesId, continueChapter, readTick]
  );

  const handleChapterClick = (chapter: SeriesChapterItem) => {
    if (chapter.id.includes('-ch-') || seriesId?.startsWith('00000000-0000-4000-a000-')) {
      const targetSeries = seriesId || chapter.id.split('-ch-')[0];
      navigate(`/reader/${targetSeries}/${chapter.chapter_number}`);
      return;
    }
    const status = getChapterStatus(chapter, userAccess);
    if (status === 'locked' || status === 'locked-premium') {
      setSelectedChapter(chapter);
      setShowUnlockPopup(true);
    } else {
      navigate(`/reader/${chapter.id}`);
    }
  };

  const markAllRead = () => {
    if (!seriesId || chapters.length === 0) return;
    markAllChaptersRead(seriesId, chapters.map((c) => c.chapter_number));
    setReadTick((n) => n + 1);
  };

  return {
    gridView,
    setGridView,
    sortNewestFirst,
    setSortNewestFirst,
    searchQuery,
    setSearchQuery,
    accessFilter,
    setAccessFilter,
    readFilter,
    setReadFilter,
    displayItems,
    handleChapterClick,
    markAllRead,
    selectedChapter,
    showUnlockPopup,
    closeUnlockPopup: () => {
      setShowUnlockPopup(false);
      setSelectedChapter(null);
    },
    onUnlocked: () => setUserAccess((prev) => ({ ...prev, ...(selectedChapter ? { [selectedChapter.id]: true } : {}) })),
  };
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { WebtoonReader } from '@/components/reader/WebtoonReader';
import { DemoChapterGate } from '@/components/demo/DemoChapterGate';
import { useDemoRole } from '@/contexts/DemoRoleContext';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';
import { useMangaData, useReadingProgress, useBookmarks } from '@/hooks/useMangaData';
import { useSeriesChapters } from '@/hooks/useSeriesChapters';
import { useChapterPages } from '@/hooks/useChapterPages';
import { useIsMobile } from '@/hooks/use-mobile';
import { appConfig } from '@/config/env';
import { isSupabaseConfigured, supabase } from '@/integrations/supabase/client';
import {
  activateDemoMode,
  getDemoChapterById,
  getDemoChapterBySeriesAndNumber,
  getDemoChaptersForSeries,
  getDemoSeriesById,
  getRelatedDemoSeries,
  isDemoChapterId,
  isDemoSeriesId,
  type DemoChapter,
  type DemoSeries,
} from '@/utils/demoLibraryData';

function resolveDemoChapter(
  chapterId?: string,
  seriesId?: string,
  chapterNumber?: string
): { chapter: DemoChapter; series: DemoSeries } | null {
  if (chapterId && isDemoChapterId(chapterId)) {
    const chapter = getDemoChapterById(chapterId);
    if (!chapter) return null;
    const series = getDemoSeriesById(chapter.series_id);
    if (!series) return null;
    return { chapter, series };
  }
  if (seriesId && isDemoSeriesId(seriesId) && chapterNumber) {
    const chapter = getDemoChapterBySeriesAndNumber(seriesId, parseInt(chapterNumber, 10));
    if (!chapter) return null;
    const series = getDemoSeriesById(seriesId);
    if (!series) return null;
    return { chapter, series };
  }
  return null;
}

const Reader = () => {
  const { chapterId, seriesId, chapterNumber } = useParams<{
    chapterId?: string;
    seriesId?: string;
    chapterNumber?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const demoRole = useDemoRole();
  const useDemoPath =
    appConfig.isDemo ||
    !isSupabaseConfigured ||
    Boolean(
      (chapterId && isDemoChapterId(chapterId)) ||
        (seriesId && isDemoSeriesId(seriesId))
    );

  const demoResolved = useMemo(
    () => (useDemoPath ? resolveDemoChapter(chapterId, seriesId, chapterNumber) : null),
    [useDemoPath, chapterId, seriesId, chapterNumber]
  );

  const [unlockTick, setUnlockTick] = useState(0);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (demoResolved) activateDemoMode();
  }, [demoResolved]);

  useEffect(() => {
    const initialPage = parseInt(searchParams.get('page') || '0', 10);
    if (initialPage > 0) setCurrentPageIndex(initialPage);
    else setCurrentPageIndex(0);
  }, [demoResolved?.chapter.id, searchParams]);

  useEffect(() => {
    if (!demoResolved) return;
    try {
      sessionStorage.setItem(
        `zax-demo-continue:${demoResolved.series.id}`,
        String(demoResolved.chapter.chapter_number)
      );
    } catch {
      /* ignore */
    }
  }, [demoResolved]);

  // ---------- Demo reader path (no Supabase) ----------
  if (useDemoPath) {
    if (!demoResolved) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
          <Card className="p-8 text-center max-w-md space-y-4">
            <h1 className="text-2xl font-bold">Chapter not found</h1>
            <p className="text-muted-foreground">
              That demo chapter does not exist in the local catalogue.
            </p>
            <Button asChild className="min-h-11">
              <Link to="/">Back home</Link>
            </Button>
          </Card>
        </div>
      );
    }

    const { chapter, series } = demoResolved;
    const access = demoRole.canAccessChapter(chapter);
    // re-read when unlockTick changes
    void unlockTick;

    if (!access.allowed) {
      return (
        <DemoChapterGate
          chapterTitle={chapter.title}
          chapterId={chapter.id}
          seriesId={series.id}
          access={access}
          previewImage={chapter.pages[0] || series.cover_image_url}
          onUnlocked={() => setUnlockTick((n) => n + 1)}
        />
      );
    }

    const siblings = getDemoChaptersForSeries(series.id);
    const related = getRelatedDemoSeries(series.id, 3);
    const currentIndex = siblings.findIndex((c) => c.id === chapter.id);
    const prev = chapter.previous_chapter_id
      ? getDemoChapterById(chapter.previous_chapter_id)
      : null;
    const next = chapter.next_chapter_id ? getDemoChapterById(chapter.next_chapter_id) : null;

    return (
      <WebtoonReader
        pages={chapter.pages}
        currentPage={currentPageIndex}
        onPageChange={setCurrentPageIndex}
        onNavigateHome={() => navigate('/')}
        onNavigateChapterList={() => navigate(`/series/${series.id}`)}
        onPreviousChapter={() => {
          if (prev) navigate(`/reader/${series.id}/${prev.chapter_number}`);
        }}
        onNextChapter={() => {
          if (next) navigate(`/reader/${series.id}/${next.chapter_number}`);
        }}
        hasPreviousChapter={Boolean(prev)}
        hasNextChapter={Boolean(next)}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapter_number}
        seriesTitle={series.title}
        seriesId={series.id}
        relatedSeries={related.map((item) => ({
          id: item.id,
          title: item.title,
          cover_image_url: item.cover_image_url,
        }))}
        endOfChapter
        isMobile={isMobile}
        chapterPositionLabel={`${currentIndex + 1} / ${siblings.length}`}
      />
    );
  }

  // ---------- Production / staging path ----------
  return <ProductionReader />;
};

function ProductionReader() {
  const { chapterId, seriesId, chapterNumber } = useParams<{
    chapterId?: string;
    seriesId?: string;
    chapterNumber?: string;
  }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [detectedSeriesId, setDetectedSeriesId] = useState<string | null>(seriesId || null);
  const { chapters: seriesChapters, loading: seriesLoading } = useSeriesChapters(
    detectedSeriesId || undefined
  );
  const { chapters: allChapters, loading: allLoading } = useMangaData();
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const { updateProgress } = useReadingProgress(user?.id);
  useBookmarks(user?.id);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);

  useEffect(() => {
    if (chapterId && !detectedSeriesId) {
      const detect = async () => {
        const { data } = await supabase
          .from('chapters')
          .select('series_id')
          .eq('id', chapterId)
          .maybeSingle();
        if (data?.series_id) setDetectedSeriesId(data.series_id);
      };
      void detect();
    }
  }, [chapterId, detectedSeriesId]);

  const chapters = detectedSeriesId ? seriesChapters : allChapters;
  const loading = detectedSeriesId ? seriesLoading : allLoading;
  const { pages: chapterPages, loading: pagesLoading } = useChapterPages(chapterId);

  const chapter = chapterId
    ? chapters.find((c) => c.id === chapterId)
    : chapters.find((c) => c.chapter_number === parseInt(chapterNumber || '0', 10));

  const pages = chapterPages.length > 0 ? chapterPages : chapter?.pages || [];

  useEffect(() => {
    const initialPage = parseInt(searchParams.get('page') || '0', 10);
    if (initialPage > 0 && pages.length > 0) {
      setCurrentPageIndex(Math.min(initialPage, pages.length - 1));
    }
  }, [searchParams, pages.length]);

  useEffect(() => {
    if (chapter && user && pages.length > 0) {
      updateProgress(chapter.id, currentPageIndex, pages.length);
    }
  }, [currentPageIndex, chapter, user, updateProgress, pages.length]);

  const goToNextChapter = useCallback(() => {
    const idx = chapters.findIndex((c) => c.id === chapter?.id);
    if (idx >= 0 && idx < chapters.length - 1) {
      navigate(`/reader/${chapters[idx + 1].id}`);
    }
  }, [chapters, chapter, navigate]);

  const goToPreviousChapter = useCallback(() => {
    const idx = chapters.findIndex((c) => c.id === chapter?.id);
    if (idx > 0) navigate(`/reader/${chapters[idx - 1].id}`);
  }, [chapters, chapter, navigate]);

  if (loading || pagesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Loader2 className="h-8 w-8 animate-spin text-manga-red" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Card className="p-8 text-center space-y-4">
          <h1 className="text-2xl font-bold">Chapter Not Found</h1>
          <Button onClick={() => navigate('/')} variant="manga">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const isPremiumOnly = chapter.chapter_number % 5 === 0;
  if (isPremiumOnly && !isPremium) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg px-4">
        <Card className="p-8 text-center max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Premium chapter</h1>
          <p className="text-muted-foreground">This chapter requires an active Premium membership.</p>
          <Button asChild>
            <Link to="/premium">View Premium</Link>
          </Button>
        </Card>
      </div>
    );
  }

  if (pages.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-reader-bg">
        <Card className="p-8 text-center max-w-md space-y-4">
          <h1 className="text-2xl font-bold">Pages unavailable</h1>
          <Button onClick={() => navigate('/')} variant="manga">
            Back to Home
          </Button>
        </Card>
      </div>
    );
  }

  const currentChapterIndex = chapters.findIndex((c) => c.id === chapter.id);

  return (
    <WebtoonReader
      pages={pages}
      currentPage={currentPageIndex}
      onPageChange={setCurrentPageIndex}
      onNavigateHome={() => navigate('/')}
      onNavigateChapterList={() =>
        navigate(detectedSeriesId ? `/series/${detectedSeriesId}` : '/series')
      }
      onPreviousChapter={goToPreviousChapter}
      onNextChapter={goToNextChapter}
      hasPreviousChapter={currentChapterIndex > 0}
      hasNextChapter={currentChapterIndex < chapters.length - 1}
      chapterTitle={chapter.title}
      chapterNumber={chapter.chapter_number}
      isMobile={isMobile}
    />
  );
}

export default Reader;

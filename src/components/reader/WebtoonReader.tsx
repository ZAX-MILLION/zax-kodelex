import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ChevronLeft, ChevronRight, Home, List, Settings } from 'lucide-react';
import { ChapterSettings } from './ChapterSettings';
import { useChapterLayout } from '@/hooks/useChapterLayout';

interface RelatedSeriesItem {
  id: string;
  title: string;
  cover_image_url: string;
}

interface WebtoonReaderProps {
  pages: string[];
  currentPage: number;
  onPageChange: (page: number) => void;
  onNavigateHome: () => void;
  onNavigateChapterList: () => void;
  onPreviousChapter: () => void;
  onNextChapter: () => void;
  hasPreviousChapter: boolean;
  hasNextChapter: boolean;
  chapterTitle: string;
  chapterNumber: number;
  seriesTitle?: string;
  seriesId?: string;
  relatedSeries?: RelatedSeriesItem[];
  endOfChapter?: boolean;
  isMobile?: boolean;
  chapterPositionLabel?: string;
}

const PLACEHOLDER =
  (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? `${import.meta.env.BASE_URL}placeholder.svg`
    : '/placeholder.svg'
  ).replace(/\/{2,}placeholder/, '/placeholder');

export const WebtoonReader = ({
  pages,
  currentPage,
  onPageChange,
  onNavigateHome,
  onNavigateChapterList,
  onPreviousChapter,
  onNextChapter,
  hasPreviousChapter,
  hasNextChapter,
  chapterTitle,
  chapterNumber,
  seriesTitle,
  seriesId,
  relatedSeries = [],
  endOfChapter = true,
  chapterPositionLabel,
}: WebtoonReaderProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [boxedWidth, setBoxedWidth] = useState(() => {
    const stored = localStorage.getItem('manga-boxed-width');
    return stored === null ? true : stored === 'true';
  });
  const [brokenPages, setBrokenPages] = useState<Record<number, boolean>>({});

  const { imageGap, imageFit, imageScale } = useChapterLayout();

  const getObjectFit = (fit: string): 'contain' | 'cover' | 'fill' | 'scale-down' | 'none' => {
    switch (fit) {
      case 'contain':
        return 'contain';
      case 'width':
        return 'cover';
      case 'height':
        return 'cover';
      case 'auto':
        return 'none';
      default:
        return 'contain';
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const containerTop = containerRef.current.scrollTop;
      const containerHeight = containerRef.current.clientHeight;
      const threshold = containerHeight * 0.5;

      for (let i = 0; i < pageRefs.current.length; i++) {
        const pageEl = pageRefs.current[i];
        if (!pageEl) continue;
        const pageTop = pageEl.offsetTop - containerTop;
        const pageBottom = pageTop + pageEl.offsetHeight;
        if (pageTop <= threshold && pageBottom >= threshold) {
          if (i !== currentPage) onPageChange(i);
          break;
        }
      }
    };

    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true });
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, [currentPage, onPageChange]);

  useEffect(() => {
    const pageEl = pageRefs.current[currentPage];
    if (pageEl && containerRef.current) {
      const reduce =
        typeof window !== 'undefined' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      pageEl.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'center' });
    }
  }, [currentPage]);

  useEffect(() => {
    const handleBoxedWidthChange = (event: CustomEvent) => {
      setBoxedWidth(event.detail);
    };
    window.addEventListener('boxedWidthChange', handleBoxedWidthChange as EventListener);
    return () =>
      window.removeEventListener('boxedWidthChange', handleBoxedWidthChange as EventListener);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'j') {
        if (currentPage < pages.length - 1) onPageChange(currentPage + 1);
        else if (hasNextChapter) onNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'k') {
        if (currentPage > 0) onPageChange(currentPage - 1);
        else if (hasPreviousChapter) onPreviousChapter();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onNavigateHome();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [
    currentPage,
    pages.length,
    hasNextChapter,
    hasPreviousChapter,
    onPageChange,
    onNextChapter,
    onPreviousChapter,
    onNavigateHome,
  ]);

  const progressPercentage = pages.length
    ? ((currentPage + 1) / pages.length) * 100
    : 0;

  return (
    <div className="min-h-screen bg-background">
      <Card className="fixed top-0 left-0 right-0 z-50 rounded-none border-b bg-background/95 backdrop-blur-sm pt-[env(safe-area-inset-top)]">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-1 sm:gap-2">
            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateHome}
                className="px-2 sm:px-3 min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Home className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onNavigateChapterList}
                className="px-2 sm:px-3 min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
              >
                <List className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Series</span>
              </Button>
            </div>

            <div className="text-center min-w-0 flex-1 mx-2">
              <h1 className="font-bold text-sm sm:text-lg truncate">
                Ch. {chapterNumber}
                {seriesTitle ? ` · ${seriesTitle}` : ''}
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground truncate hidden sm:block">
                {chapterTitle}
                {chapterPositionLabel ? ` · Chapter ${chapterPositionLabel}` : ''}
              </p>
            </div>

            <div className="flex items-center gap-1 sm:gap-2 min-w-0">
              <span className="text-xs sm:text-sm text-muted-foreground whitespace-nowrap" aria-live="polite">
                {currentPage + 1}/{pages.length}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="px-2 min-h-11 focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Reader settings"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-2 sm:mt-3">
            <Progress value={progressPercentage} className="h-1" aria-label="Reading progress" />
          </div>
        </div>
      </Card>

      <div
        ref={containerRef}
        className="pt-16 sm:pt-20 pb-16 sm:pb-20 overflow-y-auto overflow-x-hidden h-[100vh] h-[100dvh]"
      >
        <div className={boxedWidth ? 'max-w-4xl mx-auto' : 'w-full'}>
          {pages.map((page, index) => (
            <div
              key={`${page}-${index}`}
              ref={(el) => {
                pageRefs.current[index] = el;
              }}
              className="w-full block bg-muted/20"
              style={{ marginBottom: `${imageGap}px`, aspectRatio: '2 / 3' }}
            >
              {brokenPages[index] ? (
                <div className="flex h-full min-h-[320px] items-center justify-center border border-border/40 bg-muted/40 p-6 text-center text-sm text-muted-foreground">
                  Page {index + 1} could not load. Continuing with the rest of the chapter.
                </div>
              ) : (
                <img
                  src={typeof page === 'string' ? page : ''}
                  alt={`${chapterTitle} — page ${index + 1} of ${pages.length}`}
                  width={800}
                  height={1200}
                  loading={index === 0 ? 'eager' : 'lazy'}
                  decoding="async"
                  fetchPriority={index === 0 ? 'high' : 'auto'}
                  className="block mx-auto h-auto w-full"
                  style={{
                    maxWidth: '100%',
                    width: '100%',
                    height: 'auto',
                    objectFit: getObjectFit(imageFit),
                    transform: `scale(${Math.min(imageScale, 100) / 100})`,
                    transformOrigin: 'top center',
                  }}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (target.src.includes('placeholder')) {
                      setBrokenPages((prev) => ({ ...prev, [index]: true }));
                      return;
                    }
                    target.src = PLACEHOLDER;
                  }}
                />
              )}
            </div>
          ))}

          {endOfChapter && (
            <section
              aria-labelledby="end-chapter-heading"
              className="mx-auto max-w-xl px-4 py-10 text-center space-y-5"
            >
              <h2 id="end-chapter-heading" className="text-2xl font-bold">
                End of chapter {chapterNumber}
              </h2>
              <p className="text-muted-foreground">
                {hasNextChapter
                  ? 'Continue with the next sample chapter, or return to the series page.'
                  : 'You finished the last sample chapter in this demo series.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasNextChapter && (
                  <Button onClick={onNextChapter} className="min-h-11">
                    Next chapter
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                <Button variant="outline" onClick={onNavigateChapterList} className="min-h-11">
                  Back to series
                </Button>
              </div>

              {relatedSeries.length > 0 && (
                <div className="pt-6 text-left space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Related series
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {relatedSeries.map((item) => (
                      <Link
                        key={item.id}
                        to={`/series/${item.id}`}
                        className="rounded-xl border border-border/50 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <img
                          src={item.cover_image_url}
                          alt=""
                          width={320}
                          height={200}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover"
                        />
                        <span className="block p-2 text-sm font-medium line-clamp-2">
                          {item.title}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {seriesId ? null : null}
            </section>
          )}
        </div>
      </div>

      <Card className="fixed bottom-0 left-0 right-0 z-50 rounded-none border-t bg-background/95 backdrop-blur-sm pb-[env(safe-area-inset-bottom)]">
        <div className="w-full px-2 sm:px-4 py-2 sm:py-3">
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousChapter}
              disabled={!hasPreviousChapter}
              className="h-11 min-w-[44px] px-3 sm:px-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="h-4 w-4 sm:mr-1" />
              <span className="hidden sm:inline">Previous</span>
            </Button>

            <div className="text-center min-w-0 flex-1">
              <div className="text-xs sm:text-sm text-muted-foreground">
                {currentPage + 1}/{pages.length}
              </div>
              <div className="text-xs text-muted-foreground hidden sm:block">
                {Math.round(progressPercentage)}% complete
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onNextChapter}
              disabled={!hasNextChapter}
              className="h-11 min-w-[44px] px-3 sm:px-4 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4 sm:ml-1" />
            </Button>
          </div>
        </div>
      </Card>

      <ChapterSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
};

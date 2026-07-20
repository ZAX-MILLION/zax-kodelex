import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  List,
  Settings,
  MessageCircle,
  ArrowLeft,
  ArrowUp,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ReaderSettings } from './ReaderSettings';
import { ReaderComments } from './ReaderComments';
import { ReaderSettingsProvider, useReaderSettings } from '@/contexts/ReaderSettingsContext';
import { useDemoChapterComments } from '@/features/demo/useDemoChapterComments';

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
  /** Demo catalogue index for comment seeds, e.g. 0 for first featured series */
  demoSeriesIndex?: number;
  chapterId?: string;
}

const PLACEHOLDER =
  (typeof import.meta !== 'undefined' && import.meta.env?.BASE_URL
    ? `${import.meta.env.BASE_URL}placeholder.svg`
    : '/placeholder.svg'
  ).replace(/\/{2,}placeholder/, '/placeholder');

function WebtoonReaderInner({
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
  demoSeriesIndex = 0,
}: WebtoonReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [barsVisible, setBarsVisible] = useState(true);
  const [brokenPages, setBrokenPages] = useState<Record<number, boolean>>({});
  const [keyboardFocus, setKeyboardFocus] = useState(false);

  const { settings, backgroundCss, contentMaxWidth, justifyClass } = useReaderSettings();
  const chapterKey = `${demoSeriesIndex}-${chapterNumber}`;
  const { count: commentCount } = useDemoChapterComments(chapterKey);

  const overlaysOpen = settingsOpen;
  const forceBars =
    overlaysOpen ||
    keyboardFocus ||
    settings.toolbarBehavior === 'always' ||
    currentPage <= 0 ||
    currentPage >= pages.length - 1;

  const showBars = forceBars || barsVisible;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const scrollToComments = () => {
    setBarsVisible(true);
    document.getElementById('reader-comments')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  const scrollToTop = () => {
    containerRef.current?.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    setBarsVisible(true);
  };

  useEffect(() => {
    const onFocusIn = (e: FocusEvent) => {
      const t = e.target as HTMLElement | null;
      if (t?.closest('[data-reader-chrome]')) setKeyboardFocus(true);
    };
    const onFocusOut = () => {
      window.setTimeout(() => {
        const active = document.activeElement as HTMLElement | null;
        if (!active?.closest('[data-reader-chrome]')) setKeyboardFocus(false);
      }, 0);
    };
    window.addEventListener('focusin', onFocusIn);
    window.addEventListener('focusout', onFocusOut);
    return () => {
      window.removeEventListener('focusin', onFocusIn);
      window.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        if (settings.toolbarBehavior !== 'auto-hide' || forceBars) {
          lastScrollY.current = container.scrollTop;
          return;
        }
        const y = container.scrollTop;
        const delta = y - lastScrollY.current;
        const nearTop = y < 48;
        const nearBottom =
          y + container.clientHeight > container.scrollHeight - 120;
        if (nearTop || nearBottom) {
          setBarsVisible(true);
        } else if (delta > 8) {
          setBarsVisible(false);
        } else if (delta < -8) {
          setBarsVisible(true);
        }
        lastScrollY.current = y;

        const threshold = container.clientHeight * 0.45;
        for (let i = 0; i < pageRefs.current.length; i++) {
          const pageEl = pageRefs.current[i];
          if (!pageEl) continue;
          const pageTop = pageEl.offsetTop - y;
          const pageBottom = pageTop + pageEl.offsetHeight;
          if (pageTop <= threshold && pageBottom >= threshold) {
            if (i !== currentPage) onPageChange(i);
            break;
          }
        }
      });
    };

    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [currentPage, onPageChange, settings.toolbarBehavior, forceBars]);

  useEffect(() => {
    // Capture before Radix unmounts an open Select listbox on Escape.
    let selectOpenOnEscape = false;
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectOpenOnEscape = !!document.querySelector('[role="listbox"]');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && settingsOpen) {
        if (selectOpenOnEscape) {
          selectOpenOnEscape = false;
          return;
        }
        setSettingsOpen(false);
        return;
      }
      if ((e.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) return;
      setBarsVisible(true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'j') {
        if (settings.readingMode === 'webtoon') {
          containerRef.current?.scrollBy({
            top: containerRef.current.clientHeight * 0.85,
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        } else if (currentPage < pages.length - 1) onPageChange(currentPage + 1);
        else if (hasNextChapter) onNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'k') {
        if (settings.readingMode === 'webtoon') {
          containerRef.current?.scrollBy({
            top: -containerRef.current.clientHeight * 0.85,
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        } else if (currentPage > 0) onPageChange(currentPage - 1);
        else if (hasPreviousChapter) onPreviousChapter();
      } else if (e.key === 'Home') {
        e.preventDefault();
        onNavigateHome();
      }
    };
    window.addEventListener('keydown', onKeyCapture, true);
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKeyCapture, true);
      window.removeEventListener('keydown', onKey);
    };
  }, [
    settingsOpen,
    settings.readingMode,
    currentPage,
    pages.length,
    hasNextChapter,
    hasPreviousChapter,
    onPageChange,
    onNextChapter,
    onPreviousChapter,
    onNavigateHome,
    reduceMotion,
  ]);

  const onReadingSurfaceClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a, button, [role="button"], input, textarea, select')) return;
      if (settings.toolbarBehavior === 'always') return;
      if (settings.toolbarBehavior === 'tap' || settings.toolbarBehavior === 'auto-hide') {
        setBarsVisible((v) => !v);
      }
    },
    [settings.toolbarBehavior]
  );

  const progressPercentage = pages.length ? ((currentPage + 1) / pages.length) * 100 : 0;

  const imgStyle = (_index: number): CSSProperties => {
    const scale = settings.imageScale / 100;
    const base: React.CSSProperties = {
      maxWidth: '100%',
      height: 'auto',
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top center',
    };
    if (settings.imageFit === 'width') {
      return { ...base, width: '100%', objectFit: 'contain' };
    }
    if (settings.imageFit === 'screen') {
      return {
        ...base,
        width: 'auto',
        maxHeight: '100dvh',
        objectFit: 'contain',
      };
    }
    if (settings.imageFit === 'contain') {
      return { ...base, width: '100%', maxHeight: '100dvh', objectFit: 'contain' };
    }
    return { ...base, width: 'auto', maxWidth: '100%', objectFit: 'none' };
  };

  const pageList =
    settings.readingMode === 'single'
      ? [pages[currentPage]].filter(Boolean)
      : settings.readingMode === 'double'
        ? pages.slice(currentPage, currentPage + 2)
        : pages;

  const chromeTransition = reduceMotion
    ? ''
    : 'transition-transform duration-200 ease-out';

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ backgroundColor: backgroundCss }}>
      <header
        data-reader-chrome
        className={`fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)] ${chromeTransition} ${
          showBars ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between gap-1 px-2 sm:px-4 py-2">
          <div className="flex items-center gap-1 min-w-0">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 px-2"
              onClick={onNavigateChapterList}
              aria-label="Back to series"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="min-w-0">
              <h1 className="text-sm sm:text-base font-semibold truncate">
                {seriesTitle || 'Series'} · Ch. {chapterNumber}
              </h1>
              <p className="text-xs text-muted-foreground truncate hidden sm:block">{chapterTitle}</p>
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            {settings.progressStyle !== 'hidden' && settings.progressStyle !== 'bar' && (
              <span className="text-xs text-muted-foreground px-1 whitespace-nowrap" aria-live="polite">
                {currentPage + 1}/{pages.length}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={onNavigateChapterList}
              aria-label="Chapter list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 relative"
              onClick={scrollToComments}
              aria-label={`Comments, ${commentCount}`}
            >
              <MessageCircle className="h-4 w-4" />
              <span className="absolute top-1 right-0.5 text-[10px] font-semibold">{commentCount}</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={() => {
                setSettingsOpen(true);
                setBarsVisible(true);
              }}
              aria-label="Reader Settings"
            >
              <Settings className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={onNavigateHome}
              aria-label="Exit reader"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {(settings.progressStyle === 'full' || settings.progressStyle === 'bar') && (
          <Progress value={progressPercentage} className="h-1 rounded-none" aria-label="Reading progress" />
        )}
      </header>

      <main
        ref={containerRef}
        className="overflow-y-auto overflow-x-hidden h-[100dvh]"
        onClick={onReadingSurfaceClick}
      >
        <div
          className={`pt-16 sm:pt-20 pb-24 ${justifyClass}`}
          style={{
            maxWidth: contentMaxWidth,
            width: settings.widthMode === 'full' ? '100%' : undefined,
          }}
        >
          <div
            className={
              settings.readingMode === 'double'
                ? 'flex flex-row gap-0 justify-center flex-wrap'
                : 'block'
            }
            style={{
              direction:
                settings.readingMode !== 'webtoon' && settings.direction === 'rtl' ? 'rtl' : 'ltr',
            }}
          >
            {(settings.readingMode === 'webtoon' ? pages : pageList).map((page, index) => {
              const realIndex =
                settings.readingMode === 'webtoon' ? index : currentPage + index;
              return (
                <div
                  key={`${page}-${realIndex}`}
                  ref={(el) => {
                    pageRefs.current[realIndex] = el;
                  }}
                  className="w-full block"
                  style={{
                    marginBottom:
                      settings.readingMode === 'webtoon' ? `${settings.imageGap}px` : 0,
                    flex:
                      settings.readingMode === 'double' ? '1 1 45%' : undefined,
                    maxWidth: settings.readingMode === 'double' ? '50%' : undefined,
                  }}
                >
                  {brokenPages[realIndex] ? (
                    <div className="flex min-h-[240px] items-center justify-center border border-border/40 bg-muted/30 p-6 text-center text-sm text-muted-foreground">
                      Page {realIndex + 1} could not load.
                    </div>
                  ) : (
                    <img
                      src={typeof page === 'string' ? page : ''}
                      alt={`${chapterTitle} — page ${realIndex + 1} of ${pages.length}`}
                      width={800}
                      height={1200}
                      loading={realIndex === 0 ? 'eager' : 'lazy'}
                      decoding="async"
                      fetchPriority={realIndex === 0 ? 'high' : 'auto'}
                      className="block mx-auto"
                      style={imgStyle(realIndex)}
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (target.src.includes('placeholder')) {
                          setBrokenPages((prev) => ({ ...prev, [realIndex]: true }));
                          return;
                        }
                        target.src = PLACEHOLDER;
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {settings.readingMode !== 'webtoon' && (
            <div className="flex justify-center gap-3 py-6">
              <Button
                variant="outline"
                className="min-h-11"
                disabled={currentPage <= 0}
                onClick={() => onPageChange(Math.max(0, currentPage - (settings.readingMode === 'double' ? 2 : 1)))}
              >
                Previous page
              </Button>
              <Button
                variant="outline"
                className="min-h-11"
                disabled={currentPage >= pages.length - 1}
                onClick={() =>
                  onPageChange(
                    Math.min(
                      pages.length - 1,
                      currentPage + (settings.readingMode === 'double' ? 2 : 1)
                    )
                  )
                }
              >
                Next page
              </Button>
            </div>
          )}

          {endOfChapter && (
            <section
              aria-labelledby="end-chapter-heading"
              className="mx-auto max-w-xl px-4 py-10 text-center space-y-5"
            >
              <h2 id="end-chapter-heading" className="text-2xl font-bold">
                Chapter {chapterNumber} complete
              </h2>
              <p className="text-muted-foreground text-sm">
                Progress is saved on this device
                {hasNextChapter ? '. Continue when you are ready.' : '.'}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {hasPreviousChapter && (
                  <Button variant="outline" onClick={onPreviousChapter} className="min-h-11">
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous chapter
                  </Button>
                )}
                {hasNextChapter && (
                  <Button onClick={onNextChapter} className="min-h-11">
                    Next chapter
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                )}
                <Button variant="outline" onClick={onNavigateChapterList} className="min-h-11">
                  Return to series
                </Button>
                <Button variant="secondary" onClick={scrollToComments} className="min-h-11">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Comments
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
                        <span className="block p-2 text-sm font-medium line-clamp-2">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {seriesId ? null : null}
            </section>
          )}

          <ReaderComments chapterKey={chapterKey} />
        </div>
      </main>

      <nav
        data-reader-chrome
        aria-label="Reader controls"
        className={`fixed bottom-0 left-0 right-0 z-50 border-t border-border/40 bg-background/95 backdrop-blur-md pb-[env(safe-area-inset-bottom)] ${chromeTransition} ${
          showBars ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center justify-between gap-2 px-2 sm:px-4 py-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onPreviousChapter}
            disabled={!hasPreviousChapter}
            className="h-11 min-w-[44px] px-3"
            aria-label="Previous chapter"
          >
            <ChevronLeft className="h-4 w-4 sm:mr-1" />
            <span className="hidden sm:inline">Previous</span>
          </Button>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={onNavigateChapterList}
              aria-label="Chapter selector"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={scrollToComments}
              aria-label="Comments"
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={scrollToTop}
              aria-label="Back to top"
            >
              <ArrowUp className="h-4 w-4" />
            </Button>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={onNextChapter}
            disabled={!hasNextChapter}
            className="h-11 min-w-[44px] px-3"
            aria-label="Next chapter"
          >
            <span className="hidden sm:inline">Next</span>
            <ChevronRight className="h-4 w-4 sm:ml-1" />
          </Button>
        </div>
      </nav>

      <ReaderSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </div>
  );
}

export const WebtoonReader = (props: WebtoonReaderProps) => (
  <ReaderSettingsProvider>
    <WebtoonReaderInner {...props} />
  </ReaderSettingsProvider>
);

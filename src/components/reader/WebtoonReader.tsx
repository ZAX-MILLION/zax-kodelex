import { useCallback, useEffect, useRef, useState, type CSSProperties, type MouseEvent } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, MessageCircle, ArrowLeft, X, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ReaderSettings } from './ReaderSettings';
import { ReaderComments } from './ReaderComments';
import { ReaderCommentsDrawer } from './ReaderCommentsDrawer';
import { ReaderSideRail } from './ReaderSideRail';
import { ReaderChapterList, type ReaderChapterListItem } from './ReaderChapterList';
import { ReaderReportDialog } from './ReaderReportDialog';
import {
  ReaderSettingsProvider,
  useReaderSettings,
  AUTO_SCROLL_PX_PER_FRAME,
} from '@/contexts/ReaderSettingsContext';
import { useDemoChapterComments } from '@/features/demo/useDemoChapterComments';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

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
  onSelectChapter?: (chapterNumber: number) => void;
  hasPreviousChapter: boolean;
  hasNextChapter: boolean;
  chapterTitle: string;
  chapterNumber: number;
  seriesTitle?: string;
  seriesId?: string;
  seriesCoverUrl?: string;
  chapters?: ReaderChapterListItem[];
  relatedSeries?: RelatedSeriesItem[];
  endOfChapter?: boolean;
  isMobile?: boolean;
  chapterPositionLabel?: string;
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
  onSelectChapter,
  hasPreviousChapter,
  hasNextChapter,
  chapterTitle,
  chapterNumber,
  seriesTitle,
  seriesId,
  seriesCoverUrl,
  chapters = [],
  relatedSeries = [],
  endOfChapter = true,
  demoSeriesIndex = 0,
}: WebtoonReaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const lastScrollY = useRef(0);
  const ticking = useRef(false);
  const autoScrollRaf = useRef<number | null>(null);
  const userScrollPause = useRef(false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [chapterListOpen, setChapterListOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [barsVisible, setBarsVisible] = useState(true);
  const [railVisible, setRailVisible] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const [brokenPages, setBrokenPages] = useState<Record<number, boolean>>({});
  const [keyboardFocus, setKeyboardFocus] = useState(false);

  const isMobileHook = useIsMobile();
  const { settings, backgroundCss, contentMaxWidth, justifyClass } = useReaderSettings();
  const chapterKey = `${demoSeriesIndex}-${chapterNumber}`;
  const { count: commentCount } = useDemoChapterComments(chapterKey);

  const overlaysOpen = settingsOpen || commentsOpen || chapterListOpen || reportOpen;
  const forceTopBar =
    overlaysOpen ||
    keyboardFocus ||
    settings.topBarBehavior === 'always' ||
    currentPage <= 0 ||
    currentPage >= pages.length - 1;

  const showTopBar = forceTopBar || barsVisible;
  const collapsedOnMobile =
    settings.sideRailBehavior === 'collapsed-mobile' && isMobileHook;
  const forceRail =
    overlaysOpen ||
    keyboardFocus ||
    settings.sideRailBehavior === 'always' ||
    collapsedOnMobile;
  const showRail = forceRail || railVisible;

  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const stopAutoScroll = useCallback(() => {
    setAutoScroll(false);
    if (autoScrollRaf.current != null) {
      cancelAnimationFrame(autoScrollRaf.current);
      autoScrollRaf.current = null;
    }
  }, []);

  const scrollToCommentsInline = () => {
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

  const scrollToBottom = () => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: reduceMotion ? 'auto' : 'smooth' });
  };

  const openOverlay = (kind: 'settings' | 'comments' | 'chapters' | 'report') => {
    stopAutoScroll();
    setBarsVisible(true);
    setRailVisible(true);
    if (kind === 'settings') setSettingsOpen(true);
    if (kind === 'comments') setCommentsOpen(true);
    if (kind === 'chapters') setChapterListOpen(true);
    if (kind === 'report') setReportOpen(true);
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
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        ticking.current = false;
        const y = el.scrollTop;
        const delta = y - lastScrollY.current;

        if (autoScroll && !userScrollPause.current && Math.abs(delta) > 4) {
          // Manual interruption while auto-scrolling
          const expected = AUTO_SCROLL_PX_PER_FRAME[settings.autoScrollSpeed] * 2;
          if (Math.abs(delta) > expected + 8) {
            stopAutoScroll();
          }
        }

        if (settings.topBarBehavior === 'auto-hide' && !forceTopBar) {
          if (y < 48) setBarsVisible(true);
          else if (delta > 8) setBarsVisible(false);
          else if (delta < -8) setBarsVisible(true);
        }

        if (settings.sideRailBehavior === 'auto-hide' && !forceRail) {
          if (y < 48) setRailVisible(true);
          else if (delta > 8) setRailVisible(false);
          else if (delta < -8) setRailVisible(true);
        }

        lastScrollY.current = y;

        const probe = el.clientHeight * 0.45;
        for (let i = 0; i < pageRefs.current.length; i++) {
          const node = pageRefs.current[i];
          if (!node) continue;
          const top = node.offsetTop - y;
          const bottom = top + node.offsetHeight;
          if (top <= probe && bottom >= probe) {
            if (i !== currentPage) onPageChange(i);
            break;
          }
        }

        if (y + el.clientHeight >= el.scrollHeight - 4) {
          stopAutoScroll();
        }
      });
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [
    autoScroll,
    currentPage,
    forceRail,
    forceTopBar,
    onPageChange,
    settings.autoScrollSpeed,
    settings.sideRailBehavior,
    settings.topBarBehavior,
    stopAutoScroll,
  ]);

  useEffect(() => {
    if (!autoScroll || reduceMotion) {
      if (reduceMotion) stopAutoScroll();
      return;
    }
    const el = containerRef.current;
    if (!el) return;
    const speed = AUTO_SCROLL_PX_PER_FRAME[settings.autoScrollSpeed];
    const tick = () => {
      el.scrollTop += speed;
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) {
        stopAutoScroll();
        return;
      }
      autoScrollRaf.current = requestAnimationFrame(tick);
    };
    autoScrollRaf.current = requestAnimationFrame(tick);
    return () => {
      if (autoScrollRaf.current != null) cancelAnimationFrame(autoScrollRaf.current);
    };
  }, [autoScroll, reduceMotion, settings.autoScrollSpeed, stopAutoScroll]);

  useEffect(() => {
    if (overlaysOpen) stopAutoScroll();
  }, [overlaysOpen, stopAutoScroll]);

  useEffect(() => {
    let selectOpenOnEscape = false;
    const onKeyCapture = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        selectOpenOnEscape = !!document.querySelector('[role="listbox"]');
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectOpenOnEscape) {
          selectOpenOnEscape = false;
          return;
        }
        if (reportOpen) {
          setReportOpen(false);
          return;
        }
        if (settingsOpen) {
          setSettingsOpen(false);
          return;
        }
        if (commentsOpen) {
          setCommentsOpen(false);
          return;
        }
        if (chapterListOpen) {
          setChapterListOpen(false);
          return;
        }
      }
      if ((e.target as HTMLElement)?.closest('input, textarea, [contenteditable]')) return;
      setBarsVisible(true);
      if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D' || e.key === 'j') {
        if (settings.readingMode === 'webtoon') {
          containerRef.current?.scrollBy({
            top: (containerRef.current.clientHeight || 0) * 0.85,
            behavior: reduceMotion ? 'auto' : 'smooth',
          });
        } else if (currentPage < pages.length - 1) onPageChange(currentPage + 1);
        else if (hasNextChapter) onNextChapter();
      } else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A' || e.key === 'k') {
        if (settings.readingMode === 'webtoon') {
          containerRef.current?.scrollBy({
            top: -(containerRef.current.clientHeight || 0) * 0.85,
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
    chapterListOpen,
    commentsOpen,
    currentPage,
    hasNextChapter,
    hasPreviousChapter,
    onNavigateHome,
    onNextChapter,
    onPageChange,
    onPreviousChapter,
    pages.length,
    reduceMotion,
    reportOpen,
    settings.readingMode,
    settingsOpen,
  ]);

  const onReadingSurfaceClick = useCallback(
    (e: MouseEvent) => {
      const t = e.target as HTMLElement;
      if (t.closest('a, button, [role="button"], input, textarea, select')) return;
      if (settings.topBarBehavior === 'tap' || settings.topBarBehavior === 'auto-hide') {
        if (settings.topBarBehavior === 'tap') setBarsVisible((v) => !v);
      }
    },
    [settings.topBarBehavior]
  );

  const progressPercentage = pages.length ? ((currentPage + 1) / pages.length) * 100 : 0;

  const imgStyle = (): CSSProperties => {
    const scale = settings.imageScale / 100;
    const base: CSSProperties = {
      maxWidth: '100%',
      height: 'auto',
      transform: scale !== 1 ? `scale(${scale})` : undefined,
      transformOrigin: 'top center',
    };
    if (settings.imageFit === 'width') return { ...base, width: '100%', objectFit: 'contain' };
    if (settings.imageFit === 'screen')
      return { ...base, width: 'auto', maxHeight: '100dvh', objectFit: 'contain' };
    if (settings.imageFit === 'contain')
      return { ...base, width: '100%', maxHeight: '100dvh', objectFit: 'contain' };
    return { ...base, width: 'auto', maxWidth: '100%', objectFit: 'none' };
  };

  const pageList =
    settings.readingMode === 'single'
      ? [pages[currentPage]].filter(Boolean)
      : settings.readingMode === 'double'
        ? pages.slice(currentPage, currentPage + 2)
        : pages;

  const chromeTransition = reduceMotion ? '' : 'transition-transform duration-200 ease-out';
  const progressLabel =
    settings.progressStyle === 'percent'
      ? `${Math.round(progressPercentage)}%`
      : `${currentPage + 1} / ${pages.length}`;

  return (
    <div className="min-h-[100dvh] overflow-x-hidden" style={{ backgroundColor: backgroundCss }}>
      <div className="sr-only" aria-live="polite">
        {autoScroll ? 'Auto-scroll on' : 'Auto-scroll off'}
      </div>

      <header
        data-reader-chrome
        data-reader-top-bar
        className={cn(
          'fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/95 backdrop-blur-md pt-[env(safe-area-inset-top)]',
          chromeTransition,
          showTopBar ? 'translate-y-0' : '-translate-y-full'
        )}
      >
        <div className="flex h-11 sm:h-12 items-center justify-between gap-1 px-1.5 sm:px-3">
          <div className="flex min-w-0 items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11 px-2"
              onClick={onNavigateChapterList}
              aria-label="Back to series"
              title="Back to series"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            {seriesCoverUrl ? (
              <img
                src={seriesCoverUrl}
                alt=""
                width={28}
                height={28}
                className="hidden h-7 w-7 rounded object-cover sm:block"
              />
            ) : null}
            <div className="min-w-0 flex items-center gap-1.5 text-sm">
              <span className="truncate font-semibold max-w-[28vw] sm:max-w-[20vw] md:max-w-[240px]">
                {seriesTitle || 'Series'}
              </span>
              <span className="text-muted-foreground hidden sm:inline" aria-hidden>
                /
              </span>
              <span className="truncate text-muted-foreground max-w-[30vw] sm:max-w-none">
                Ch. {chapterNumber}
                {chapterTitle ? (
                  <span className="hidden md:inline">{` — ${chapterTitle}`}</span>
                ) : null}
              </span>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {settings.progressStyle !== 'hidden' && settings.progressStyle !== 'bar' && (
              <span
                className="rounded-md bg-muted/80 px-2 py-1 text-xs tabular-nums text-muted-foreground"
                aria-live="polite"
              >
                {progressLabel}
              </span>
            )}
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={() => openOverlay('chapters')}
              aria-label="Chapter list"
              title="Chapter list"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="min-h-11 min-w-11"
              onClick={onNavigateHome}
              aria-label="Exit reader"
              title="Exit reader"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        {settings.progressStyle === 'bar' && (
          <Progress value={progressPercentage} className="h-0.5 rounded-none" aria-label="Reading progress" />
        )}
      </header>

      <main
        ref={containerRef}
        className="h-[100dvh] overflow-y-auto overflow-x-hidden"
        onClick={onReadingSurfaceClick}
      >
        <div
          className={cn('pt-12 sm:pt-14 pb-8', justifyClass)}
          style={{
            maxWidth: contentMaxWidth,
            width: settings.widthMode === 'full' ? '100%' : undefined,
          }}
        >
          <div
            className={
              settings.readingMode === 'double'
                ? 'flex flex-row flex-wrap justify-center gap-0'
                : 'block'
            }
            style={{
              direction:
                settings.readingMode !== 'webtoon' && settings.direction === 'rtl' ? 'rtl' : 'ltr',
            }}
          >
            {(settings.readingMode === 'webtoon' ? pages : pageList).map((page, index) => {
              const realIndex = settings.readingMode === 'webtoon' ? index : currentPage + index;
              return (
                <div
                  key={`${page}-${realIndex}`}
                  ref={(node) => {
                    pageRefs.current[realIndex] = node;
                  }}
                  className="block w-full"
                  style={{
                    marginBottom:
                      settings.readingMode === 'webtoon' ? `${settings.imageGap}px` : 0,
                    flex: settings.readingMode === 'double' ? '1 1 45%' : undefined,
                    maxWidth: settings.readingMode === 'double' ? '50%' : undefined,
                  }}
                >
                  {brokenPages[realIndex] ? (
                    <div className="flex min-h-[240px] items-center justify-center p-6 text-center text-sm text-muted-foreground">
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
                      className="mx-auto block"
                      style={imgStyle()}
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
                onClick={() =>
                  onPageChange(Math.max(0, currentPage - (settings.readingMode === 'double' ? 2 : 1)))
                }
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
              className="mx-auto max-w-xl space-y-5 px-4 py-10 text-center"
            >
              <h2 id="end-chapter-heading" className="text-2xl font-bold">
                Chapter {chapterNumber} complete
              </h2>
              <p className="text-sm text-muted-foreground">
                Progress is saved on this device
                {hasNextChapter ? '. Continue when you are ready.' : '.'}
              </p>
              <div className="flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap">
                {hasNextChapter && (
                  <Button onClick={onNextChapter} className="min-h-11 sm:order-2 sm:min-w-[12rem]">
                    Next chapter
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                )}
                {hasPreviousChapter && (
                  <Button variant="outline" onClick={onPreviousChapter} className="min-h-11 sm:order-1">
                    <ChevronLeft className="mr-1 h-4 w-4" />
                    Previous chapter
                  </Button>
                )}
                <Button variant="outline" onClick={onNavigateChapterList} className="min-h-11 sm:order-3">
                  Return to series
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => openOverlay('comments')}
                  className="min-h-11 sm:order-4"
                >
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Comments ({commentCount})
                </Button>
              </div>

              {relatedSeries.length > 0 && (
                <div className="space-y-3 pt-6 text-left">
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                    Related series
                  </h3>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    {relatedSeries.map((item) => (
                      <Link
                        key={item.id}
                        to={`/series/${item.id}`}
                        className="overflow-hidden rounded-xl border border-border/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        <img
                          src={item.cover_image_url}
                          alt=""
                          width={320}
                          height={200}
                          loading="lazy"
                          className="aspect-[16/10] w-full object-cover"
                        />
                        <span className="line-clamp-2 block p-2 text-sm font-medium">{item.title}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              {seriesId ? null : null}
            </section>
          )}

          <ReaderComments chapterKey={chapterKey} variant="inline" />
        </div>
      </main>

      <ReaderSideRail
        commentCount={commentCount}
        autoScrollActive={autoScroll}
        visible={showRail}
        collapsedOnMobile={collapsedOnMobile}
        onScrollTop={scrollToTop}
        onScrollBottom={scrollToBottom}
        onChapterList={() => openOverlay('chapters')}
        onSettings={() => openOverlay('settings')}
        onToggleAutoScroll={() => {
          if (reduceMotion) return;
          setAutoScroll((v) => !v);
        }}
        onComments={() => openOverlay('comments')}
        onReport={() => openOverlay('report')}
      />

      <ReaderSettings isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
      <ReaderCommentsDrawer
        open={commentsOpen}
        onClose={() => setCommentsOpen(false)}
        chapterKey={chapterKey}
        onJumpToInline={scrollToCommentsInline}
      />
      <ReaderChapterList
        open={chapterListOpen}
        onClose={() => setChapterListOpen(false)}
        seriesTitle={seriesTitle || 'Series'}
        chapters={chapters}
        currentChapterNumber={chapterNumber}
        hasPrevious={hasPreviousChapter}
        hasNext={hasNextChapter}
        onSelectChapter={(n) => {
          if (onSelectChapter) onSelectChapter(n);
          else onNavigateChapterList();
        }}
        onPrevious={onPreviousChapter}
        onNext={onNextChapter}
      />
      <ReaderReportDialog
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        chapterTitle={chapterTitle}
        chapterNumber={chapterNumber}
      />
    </div>
  );
}

export const WebtoonReader = (props: WebtoonReaderProps) => (
  <ReaderSettingsProvider>
    <WebtoonReaderInner {...props} />
  </ReaderSettingsProvider>
);

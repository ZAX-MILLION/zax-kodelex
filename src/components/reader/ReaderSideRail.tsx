import { useEffect, useState } from 'react';
import {
  ArrowUp,
  ArrowDown,
  List,
  SlidersHorizontal,
  Play,
  Pause,
  MessageCircle,
  Flag,
  MoreVertical,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

export interface ReaderSideRailProps {
  commentCount: number;
  autoScrollActive: boolean;
  visible: boolean;
  collapsedOnMobile: boolean;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  onChapterList: () => void;
  onSettings: () => void;
  onToggleAutoScroll: () => void;
  onComments: () => void;
  onReport: () => void;
}

function RailButton({
  label,
  onClick,
  children,
  active,
  badge,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  active?: boolean;
  badge?: number | string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className={cn(
            'relative h-11 w-11 min-h-11 min-w-11 rounded-lg text-foreground/90 hover:bg-white/10 hover:text-foreground',
            active && 'bg-primary/20 text-primary'
          )}
          aria-label={label}
          aria-pressed={active}
          onClick={onClick}
        >
          {children}
          {badge != null && Number(badge) > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[1.1rem] rounded-full bg-primary px-1 text-[10px] font-semibold leading-4 text-primary-foreground">
              {badge}
            </span>
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="left" className="print:hidden">
        {label}
      </TooltipContent>
    </Tooltip>
  );
}

function RailToolbar({
  commentCount,
  autoScrollActive,
  onScrollTop,
  onScrollBottom,
  onChapterList,
  onSettings,
  onToggleAutoScroll,
  onComments,
  onReport,
  header,
}: {
  commentCount: number;
  autoScrollActive: boolean;
  onScrollTop: () => void;
  onScrollBottom: () => void;
  onChapterList: () => void;
  onSettings: () => void;
  onToggleAutoScroll: () => void;
  onComments: () => void;
  onReport: () => void;
  header?: React.ReactNode;
}) {
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-2xl border border-border/40 bg-background/95 p-1 shadow-xl backdrop-blur-md"
      role="toolbar"
      aria-orientation="vertical"
    >
      {header}
      <RailButton label="Scroll to top" onClick={onScrollTop}>
        <ArrowUp className="h-4 w-4" />
      </RailButton>
      <RailButton label="Chapter list" onClick={onChapterList}>
        <List className="h-4 w-4" />
      </RailButton>
      <RailButton label="Reader Settings" onClick={onSettings}>
        <SlidersHorizontal className="h-4 w-4" />
      </RailButton>
      <RailButton
        label={autoScrollActive ? 'Pause auto-scroll' : 'Start auto-scroll'}
        onClick={onToggleAutoScroll}
        active={autoScrollActive}
      >
        {autoScrollActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </RailButton>
      <RailButton label={`Comments, ${commentCount}`} onClick={onComments} badge={commentCount}>
        <MessageCircle className="h-4 w-4" />
      </RailButton>
      <RailButton label="Report chapter" onClick={onReport}>
        <Flag className="h-4 w-4" />
      </RailButton>
      <RailButton label="Scroll to bottom" onClick={onScrollBottom}>
        <ArrowDown className="h-4 w-4" />
      </RailButton>
    </div>
  );
}

export function ReaderSideRail({
  commentCount,
  autoScrollActive,
  visible,
  collapsedOnMobile,
  onScrollTop,
  onScrollBottom,
  onChapterList,
  onSettings,
  onToggleAutoScroll,
  onComments,
  onReport,
}: ReaderSideRailProps) {
  const [mobileExpanded, setMobileExpanded] = useState(false);

  useEffect(() => {
    if (!collapsedOnMobile) setMobileExpanded(false);
  }, [collapsedOnMobile]);

  useEffect(() => {
    if (!mobileExpanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setMobileExpanded(false);
      }
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [mobileExpanded]);

  const runAndCollapse = (action: () => void) => () => {
    setMobileExpanded(false);
    action();
  };

  const toolbarProps = {
    commentCount,
    autoScrollActive,
    onScrollTop: runAndCollapse(onScrollTop),
    onScrollBottom: runAndCollapse(onScrollBottom),
    onChapterList: runAndCollapse(onChapterList),
    onSettings: runAndCollapse(onSettings),
    onToggleAutoScroll: runAndCollapse(onToggleAutoScroll),
    onComments: runAndCollapse(onComments),
    onReport: runAndCollapse(onReport),
  };

  const desktopToolbarProps = {
    commentCount,
    autoScrollActive,
    onScrollTop,
    onScrollBottom,
    onChapterList,
    onSettings,
    onToggleAutoScroll,
    onComments,
    onReport,
  };

  return (
    <TooltipProvider delayDuration={200}>
      {/* Desktop / tablet: vertical rail outside the reserved image gutter */}
      <aside
        data-reader-chrome
        data-reader-side-rail
        data-reader-side-rail-desktop
        aria-label="Reader controls"
        className={cn(
          'fixed z-[55] print:hidden transition-opacity duration-200',
          'right-[max(0.75rem,env(safe-area-inset-right))]',
          'top-1/2 -translate-y-1/2',
          collapsedOnMobile ? 'hidden md:block' : 'hidden sm:block',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        <RailToolbar {...desktopToolbarProps} />
      </aside>

      {/* Mobile: compact launcher in the reserved right gutter (does not cover images) */}
      {collapsedOnMobile && (
        <aside
          data-reader-chrome
          data-reader-side-rail
          data-reader-side-rail-mobile-launcher
          aria-label="Reader controls"
          className={cn(
            'fixed z-[55] print:hidden transition-opacity duration-200 md:hidden',
            'right-[max(0.5rem,env(safe-area-inset-right))]',
            'top-1/2 -translate-y-1/2',
            visible && !mobileExpanded ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="h-11 w-11 min-h-11 min-w-11 rounded-full shadow-lg border border-border/50 bg-background/95 backdrop-blur-md"
            aria-label="Open reader controls"
            aria-expanded={false}
            aria-controls="reader-side-rail-mobile-panel"
            onClick={() => setMobileExpanded(true)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </aside>
      )}

      {/* Mobile always-visible rail (non-collapsed setting): stays in the same reserved gutter */}
      {!collapsedOnMobile && (
        <aside
          data-reader-chrome
          data-reader-side-rail
          data-reader-side-rail-mobile-always
          aria-label="Reader controls"
          className={cn(
            'fixed z-[55] print:hidden transition-opacity duration-200 sm:hidden',
            'right-[max(0.5rem,env(safe-area-inset-right))]',
            'top-1/2 -translate-y-1/2',
            visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
          )}
        >
          <RailToolbar {...desktopToolbarProps} />
        </aside>
      )}

      {/* Mobile expanded: temporary edge sheet + backdrop — does not permanently cover pages */}
      {collapsedOnMobile && mobileExpanded && (
        <>
          <button
            type="button"
            data-reader-side-rail-backdrop
            className="fixed inset-0 z-[54] bg-black/55 print:hidden md:hidden"
            aria-label="Dismiss reader controls"
            onClick={() => setMobileExpanded(false)}
          />
          <aside
            id="reader-side-rail-mobile-panel"
            data-reader-chrome
            data-reader-side-rail
            data-reader-side-rail-mobile-panel
            aria-label="Reader controls"
            aria-modal="true"
            role="dialog"
            className={cn(
              'fixed z-[55] print:hidden md:hidden',
              'top-[max(0.75rem,env(safe-area-inset-top))]',
              'bottom-[max(0.75rem,env(safe-area-inset-bottom))]',
              'right-[max(0.5rem,env(safe-area-inset-right))]',
              'flex items-center'
            )}
          >
            <RailToolbar
              {...toolbarProps}
              header={
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-11 w-11 min-h-11 min-w-11 rounded-lg text-muted-foreground"
                  aria-label="Close reader controls"
                  aria-expanded={true}
                  onClick={() => setMobileExpanded(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              }
            />
          </aside>
        </>
      )}
    </TooltipProvider>
  );
}

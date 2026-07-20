import { useState } from 'react';
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
  const showExpanded = !collapsedOnMobile || mobileExpanded;

  return (
    <TooltipProvider delayDuration={200}>
      <aside
        data-reader-chrome
        data-reader-side-rail
        aria-label="Reader controls"
        className={cn(
          'fixed z-[55] print:hidden transition-opacity duration-200',
          'right-[max(0.5rem,env(safe-area-inset-right))]',
          'top-1/2 -translate-y-1/2',
          'sm:right-[max(0.75rem,env(safe-area-inset-right))]',
          visible ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
      >
        {/* Mobile collapsed launcher */}
        {collapsedOnMobile && !mobileExpanded && (
          <Button
            type="button"
            variant="secondary"
            size="sm"
            className="sm:hidden h-11 w-11 min-h-11 min-w-11 rounded-full shadow-lg border border-border/50 bg-background/95 backdrop-blur-md"
            aria-label="Open reader controls"
            aria-expanded={false}
            onClick={() => setMobileExpanded(true)}
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        )}

        <div
          className={cn(
            'flex flex-col items-center gap-0.5 rounded-2xl border border-border/40 bg-background/95 p-1 shadow-xl backdrop-blur-md',
            collapsedOnMobile && !showExpanded && 'hidden',
            collapsedOnMobile && showExpanded && 'sm:flex',
            !collapsedOnMobile && 'flex'
          )}
          role="toolbar"
          aria-orientation="vertical"
        >
          {collapsedOnMobile && mobileExpanded && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="sm:hidden h-9 w-11 text-xs text-muted-foreground"
              aria-label="Collapse reader controls"
              aria-expanded={true}
              onClick={() => setMobileExpanded(false)}
            >
              Close
            </Button>
          )}
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
      </aside>
    </TooltipProvider>
  );
}

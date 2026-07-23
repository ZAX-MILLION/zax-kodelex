import { BookMarked, CheckCircle, MessageCircle } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout D — Reader Archive rows.
 * Always a single-column archive list — richer than a plain table, while
 * still preserving fast chapter scanning.
 */
function CompactRow({ item, onClick }: { item: ChapterItemDisplayState; onClick: () => void }) {
  const { chapter, status, isRead, isContinue, daysAgo, commentCount } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-start gap-3 border-b border-b-border/10 px-3 py-3 text-left transition-colors last:border-b-0 hover:bg-primary/5 sm:gap-4 sm:px-4 sm:py-3.5',
        isContinue && 'bg-primary/[0.06]'
      )}
    >
      <div className="flex w-10 shrink-0 flex-col items-center pt-0.5 text-center">
        <span
          className={cn(
            'text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground',
            isContinue && 'text-primary'
          )}
        >
          Ch
        </span>
        <span
          className={cn(
            'text-lg font-black tabular-nums text-foreground sm:text-xl',
            isContinue && 'text-primary'
          )}
        >
          {chapter.chapter_number}
        </span>
      </div>

      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary sm:text-[15px]">
              {chapter.title || `Chapter ${chapter.chapter_number}`}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
              <span>{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
              <span>{chapter.page_count} pages</span>
              {commentCount > 0 && (
                <span className="inline-flex items-center gap-1">
                  <MessageCircle className="h-3 w-3" />
                  {commentCount} comments
                </span>
              )}
            </div>
          </div>

          <div className="shrink-0 pt-0.5">
            <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
          {isContinue && (
            <span className="inline-flex items-center gap-1 font-medium text-primary">
              <BookMarked className="h-3.5 w-3.5" />
              Continue here
            </span>
          )}
          {isRead && !isContinue && (
            <span className="inline-flex items-center gap-1">
              <CheckCircle className="h-3.5 w-3.5" />
              Read
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export function CompactChapterList({ items, onChapterClick }: ChapterListRendererProps) {
  return (
    <div
      className="overflow-hidden rounded-2xl border border-border/15 bg-card/30 shadow-[0_24px_60px_-52px_rgba(0,0,0,0.7)]"
      data-chapter-toc="single-column"
    >
      {items.map((item) => (
        <CompactRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} />
      ))}
    </div>
  );
}

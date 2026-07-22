import { BookMarked, CheckCircle, MessageCircle } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout D — Compact List chapter presentation.
 * True list rows tuned for scanning hundreds of chapters fast: tiny
 * vertical rhythm, everything on one line, strong hover state.
 */
function CompactRow({ item, onClick, mini }: { item: ChapterItemDisplayState; onClick: () => void; mini?: boolean }) {
  const { chapter, status, isRead, isContinue, daysAgo, commentCount } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 border-b border-l-2 border-b-border/10 border-l-transparent py-1.5 text-left transition-colors last:border-b-0 hover:border-l-primary hover:bg-primary/10',
        isContinue && 'border-l-primary bg-primary/5'
      )}
    >
      <span className="w-6 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
        {chapter.chapter_number}
      </span>
      <span className={cn('min-w-0 flex-1 truncate font-medium text-foreground', mini ? 'text-xs' : 'text-sm')}>
        {chapter.title || `Chapter ${chapter.chapter_number}`}
      </span>
      {!mini && (
        <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
          {daysAgo === 0 ? 'Today' : `${daysAgo}d`}
        </span>
      )}
      {!mini && commentCount > 0 && (
        <span className="hidden shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground sm:flex">
          <MessageCircle className="h-3 w-3" />
          {commentCount}
        </span>
      )}
      {isContinue && <BookMarked className="h-3 w-3 shrink-0 text-primary" />}
      {isRead && !isContinue && <CheckCircle className="h-3 w-3 shrink-0 text-muted-foreground" />}
      <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
    </button>
  );
}

export function CompactChapterList({ items, gridView, onChapterClick }: ChapterListRendererProps) {
  if (gridView === 1) {
    return (
      <div className="rounded-md border border-border/10">
        {items.map((item) => (
          <CompactRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} />
        ))}
      </div>
    );
  }

  const columns = gridView === 2 ? 2 : 3;
  const buckets: ChapterItemDisplayState[][] = Array.from({ length: columns }, () => []);
  items.forEach((item, i) => buckets[i % columns].push(item));

  return (
    <div className={cn('grid gap-x-4', columns === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3')}>
      {buckets.map((bucket, i) => (
        <div key={i} className="rounded-md border border-border/10">
          {bucket.map((item) => (
            <CompactRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} mini={columns === 3} />
          ))}
        </div>
      ))}
    </div>
  );
}

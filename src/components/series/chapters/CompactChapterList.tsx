import { BookMarked, CheckCircle, MessageCircle } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout D — Chapter Index TOC.
 * Always a single-column list — never multi-column (grid prefs from other layouts
 * must not turn this into a broken 2/3-col index).
 */
function CompactRow({ item, onClick }: { item: ChapterItemDisplayState; onClick: () => void }) {
  const { chapter, status, isRead, isContinue, daysAgo, commentCount } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2 border-b border-l-2 border-b-border/10 border-l-transparent px-2 py-2 text-left transition-colors last:border-b-0 hover:border-l-primary hover:bg-primary/10',
        isContinue && 'border-l-primary bg-primary/5'
      )}
    >
      <span className="w-7 shrink-0 text-right text-xs font-bold tabular-nums text-muted-foreground">
        {chapter.chapter_number}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {chapter.title || `Chapter ${chapter.chapter_number}`}
      </span>
      <span className="hidden shrink-0 text-[11px] text-muted-foreground sm:inline">
        {daysAgo === 0 ? 'Today' : `${daysAgo}d`}
      </span>
      {commentCount > 0 && (
        <span className="hidden shrink-0 items-center gap-0.5 text-[11px] text-muted-foreground sm:flex">
          <MessageCircle className="h-3 w-3" />
          {commentCount}
        </span>
      )}
      {isContinue && <BookMarked className="h-3.5 w-3.5 shrink-0 text-primary" />}
      {isRead && !isContinue && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
    </button>
  );
}

export function CompactChapterList({ items, onChapterClick }: ChapterListRendererProps) {
  return (
    <div className="overflow-hidden rounded-md border border-border/15" data-chapter-toc="single-column">
      {items.map((item) => (
        <CompactRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} />
      ))}
    </div>
  );
}

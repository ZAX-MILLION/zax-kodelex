import { BookMarked, CheckCircle, FileText } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout C — Store Catalogue chapter presentation.
 * Always tile-based so it never collapses into a TOC-style row list (Layout D).
 */
function CatalogueTile({
  item,
  onClick,
  dense,
}: {
  item: ChapterItemDisplayState;
  onClick: () => void;
  dense?: boolean;
}) {
  const { chapter, status, isContinue, isRead, daysAgo } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1.5 rounded-md border border-border/20 bg-card/40 p-2.5 text-left transition-colors hover:border-primary/30 hover:bg-card/60',
        isContinue && 'border-primary/50 bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <span className="rounded bg-foreground/10 px-1.5 py-0.5 text-[11px] font-bold tabular-nums">
          №{chapter.chapter_number}
        </span>
        <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
      </div>
      <p className={cn('line-clamp-1 font-semibold text-foreground', dense ? 'text-xs' : 'text-sm')}>
        {chapter.title || `Chapter ${chapter.chapter_number}`}
      </p>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1">
          <FileText className="h-3 w-3" />
          {chapter.page_count}p · {daysAgo === 0 ? 'Today' : `${daysAgo}d`}
        </span>
        {isRead && !isContinue && <CheckCircle className="h-3 w-3" />}
        {isContinue && <BookMarked className="h-3 w-3 text-primary" />}
      </div>
    </button>
  );
}

export function CatalogueChapterGrid({ items, gridView, onChapterClick }: ChapterListRendererProps) {
  return (
    <div
      className={cn(
        'grid gap-2',
        gridView === 1 && 'grid-cols-1 sm:grid-cols-2',
        gridView === 2 && 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
        gridView === 3 && 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      )}
    >
      {items.map((item) => (
        <CatalogueTile
          key={item.chapter.id}
          item={item}
          onClick={() => onChapterClick(item.chapter)}
          dense={gridView === 3}
        />
      ))}
    </div>
  );
}

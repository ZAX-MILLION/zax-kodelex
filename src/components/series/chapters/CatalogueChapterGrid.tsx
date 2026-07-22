import { BookMarked, CheckCircle, FileText, Lock } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout C — Compact Catalogue chapter presentation.
 * Database/library feel: visible chapter numbers, tight zebra rows in
 * 1-col, structured meta tiles for wider densities.
 */
function CatalogueRow({ item, index, onClick }: { item: ChapterItemDisplayState; index: number; onClick: () => void }) {
  const { chapter, status, isLockedVisual, isRead, isContinue } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-primary/10',
        index % 2 === 0 ? 'bg-muted/15' : 'bg-transparent',
        isContinue && 'border-l-2 border-primary bg-primary/10'
      )}
    >
      <span className="w-8 shrink-0 rounded bg-foreground/5 px-1.5 py-0.5 text-center text-xs font-bold tabular-nums text-foreground/80">
        {chapter.chapter_number}
      </span>
      <span className="min-w-0 flex-1 truncate text-sm font-medium text-foreground">
        {chapter.title || `Chapter ${chapter.chapter_number}`}
      </span>
      <span className="hidden shrink-0 items-center gap-1 text-[11px] text-muted-foreground sm:flex">
        <FileText className="h-3 w-3" />
        {chapter.page_count}p
      </span>
      {isContinue && <BookMarked className="h-3.5 w-3.5 shrink-0 text-primary" />}
      {isRead && !isContinue && <CheckCircle className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
      {isLockedVisual ? (
        <Lock className="h-3.5 w-3.5 shrink-0 text-destructive" />
      ) : (
        <span className="w-14 shrink-0 text-right">
          <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
        </span>
      )}
    </button>
  );
}

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
  if (gridView === 1) {
    return (
      <div className="overflow-hidden rounded-md border border-border/15">
        {items.map((item, index) => (
          <CatalogueRow key={item.chapter.id} item={item} index={index} onClick={() => onChapterClick(item.chapter)} />
        ))}
      </div>
    );
  }

  return (
    <div className={cn('grid gap-2', gridView === 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4')}>
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

import { Clock, MessageCircle, BookMarked, CheckCircle } from 'lucide-react';
import { ChapterAccessBadge } from './ChapterAccessBadge';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout A — Editorial chapter presentation.
 * Publication-style rows: chapter number set apart like a magazine index,
 * thin hairline separators instead of cards, minimal chrome.
 */
function EditorialRow({
  item,
  onClick,
  showThumb,
}: {
  item: ChapterItemDisplayState;
  onClick: () => void;
  showThumb?: boolean;
}) {
  const { chapter, status, isContinue, daysAgo, commentCount, isRead } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex w-full items-center gap-4 border-b border-border/15 py-3.5 text-left transition-colors last:border-b-0 hover:bg-muted/20',
        isContinue && 'bg-primary/5'
      )}
    >
      <span
        className={cn(
          'w-10 shrink-0 font-serif text-2xl font-light italic tabular-nums text-muted-foreground/70 group-hover:text-primary',
          isContinue && 'text-primary'
        )}
      >
        {String(chapter.chapter_number).padStart(2, '0')}
      </span>

      {showThumb && (
        <div
          className="hidden h-12 w-9 shrink-0 overflow-hidden rounded border border-border/20 bg-cover bg-center sm:block"
          style={{ backgroundImage: `url(${chapter.thumbnail_url})` }}
          aria-hidden
        />
      )}

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground group-hover:text-primary">
          {chapter.title || `Chapter ${chapter.chapter_number}`}
        </p>
        <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
          </span>
          {commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {commentCount}
            </span>
          )}
          {isContinue && (
            <span className="flex items-center gap-1 font-medium text-primary">
              <BookMarked className="h-3 w-3" />
              Continue
            </span>
          )}
          {isRead && !isContinue && (
            <span className="flex items-center gap-1">
              <CheckCircle className="h-3 w-3" />
              Read
            </span>
          )}
        </div>
      </div>

      <div className="shrink-0">
        <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
      </div>
    </button>
  );
}

function EditorialTextCard({ item, onClick }: { item: ChapterItemDisplayState; onClick: () => void }) {
  const { chapter, status, isContinue, daysAgo } = item;
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group flex flex-col gap-1.5 rounded-md border border-border/15 p-3 text-left transition-colors hover:border-primary/25 hover:bg-muted/20',
        isContinue && 'border-primary/40 bg-primary/5'
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-serif text-lg font-light italic tabular-nums text-muted-foreground/70">
          {String(chapter.chapter_number).padStart(2, '0')}
        </span>
        <ChapterAccessBadge status={status} unlockCost={chapter.unlock_cost} compact />
      </div>
      <p className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary">
        {chapter.title || `Chapter ${chapter.chapter_number}`}
      </p>
      <span className="text-[11px] text-muted-foreground">{daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}</span>
    </button>
  );
}

export function EditorialChapterList({ items, gridView, onChapterClick }: ChapterListRendererProps) {
  if (gridView === 3) {
    return (
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <EditorialTextCard key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} />
        ))}
      </div>
    );
  }

  if (gridView === 2) {
    return (
      <div className="grid grid-cols-1 gap-x-8 sm:grid-cols-2">
        {items.map((item) => (
          <EditorialRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} />
        ))}
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border/15">
      {items.map((item) => (
        <EditorialRow key={item.chapter.id} item={item} onClick={() => onChapterClick(item.chapter)} showThumb />
      ))}
    </div>
  );
}

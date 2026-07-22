import { BookMarked, CheckCircle, Clock, Lock, MessageCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout B — Cinematic chapter presentation.
 * Landscape artwork cards with the access/lock state painted onto the
 * image itself, like a streaming-service episode grid.
 */
function CinematicCard({
  item,
  onClick,
  size,
}: {
  item: ChapterItemDisplayState;
  onClick: () => void;
  size: 'large' | 'medium' | 'small';
}) {
  const { chapter, isLockedVisual, isContinue, isRead, daysAgo, commentCount } = item;
  const aspect = size === 'large' ? 'aspect-[16/7]' : size === 'medium' ? 'aspect-[16/9]' : 'aspect-[4/3]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-xl border border-white/10 text-left shadow-lg shadow-black/30 transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-xl',
        aspect,
        isContinue && 'ring-2 ring-primary/70'
      )}
    >
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${chapter.thumbnail_url})` }}
        aria-hidden
      />
      <div
        className={cn(
          'absolute inset-0',
          isLockedVisual
            ? 'bg-black/65'
            : 'bg-gradient-to-t from-black/90 via-black/25 to-black/5'
        )}
        aria-hidden
      />

      {isLockedVisual && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Lock className="h-7 w-7 text-white/80" />
        </div>
      )}
      {!isLockedVisual && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/15 p-3 backdrop-blur-sm">
            <Play className="h-5 w-5 fill-white text-white" />
          </div>
        </div>
      )}

      <div className="absolute right-2 top-2 rounded-full bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
        Ch. {chapter.chapter_number}
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-0.5 p-3">
        <p
          className={cn(
            'line-clamp-1 font-bold text-white drop-shadow',
            size === 'large' ? 'text-base sm:text-lg' : 'text-sm'
          )}
        >
          {chapter.title || `Chapter ${chapter.chapter_number}`}
        </p>
        <div className="flex items-center gap-2.5 text-[11px] text-white/75">
          <span className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo === 0 ? 'Today' : `${daysAgo}d`}
          </span>
          {commentCount > 0 && (
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {commentCount}
            </span>
          )}
          {isContinue && (
            <span className="flex items-center gap-1 font-semibold text-primary">
              <BookMarked className="h-3 w-3" />
              Continue
            </span>
          )}
          {isRead && !isContinue && <CheckCircle className="h-3 w-3 text-white/70" />}
        </div>
      </div>
    </button>
  );
}

export function CinematicChapterCards({ items, gridView, columnClassName, onChapterClick }: ChapterListRendererProps) {
  const size = gridView === 1 ? 'large' : gridView === 2 ? 'medium' : 'small';
  return (
    <div className={cn('grid gap-3 sm:gap-4', columnClassName)}>
      {items.map((item) => (
        <CinematicCard key={item.chapter.id} item={item} size={size} onClick={() => onChapterClick(item.chapter)} />
      ))}
    </div>
  );
}

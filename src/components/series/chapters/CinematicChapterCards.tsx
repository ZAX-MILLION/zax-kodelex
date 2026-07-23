import { BookMarked, CheckCircle, Clock, Lock, MessageCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterListRendererProps } from './types';
import type { ChapterItemDisplayState } from '@/features/series/seriesChapterTypes';

/**
 * Layout B — Streaming episode cards.
 * Landscape posters with lock/play painted on the artwork. At 1-col density,
 * episodes scroll as a horizontal rail (streaming shelf); denser views use a grid.
 */
function CinematicCard({
  item,
  onClick,
  size,
  rail,
}: {
  item: ChapterItemDisplayState;
  onClick: () => void;
  size: 'large' | 'medium' | 'small';
  rail?: boolean;
}) {
  const { chapter, isLockedVisual, isContinue, isRead, daysAgo, commentCount } = item;
  const aspect = size === 'large' ? 'aspect-[16/9]' : size === 'medium' ? 'aspect-[16/10]' : 'aspect-[4/3]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'group relative overflow-hidden rounded-2xl border border-white/10 text-left shadow-lg shadow-black/35 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl',
        aspect,
        rail && 'w-[min(86vw,320px)] shrink-0 sm:w-[340px]',
        isContinue && 'ring-2 ring-primary/80'
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
            ? 'bg-black/70'
            : 'bg-gradient-to-t from-black/95 via-black/30 to-black/5'
        )}
        aria-hidden
      />

      {isLockedVisual && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-white/20 bg-black/45 p-3 backdrop-blur-sm">
            <Lock className="h-6 w-6 text-white/85" />
          </div>
        </div>
      )}
      {!isLockedVisual && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-primary/90 p-3 shadow-lg">
            <Play className="h-5 w-5 fill-primary-foreground text-primary-foreground" />
          </div>
        </div>
      )}

      <div className="absolute left-2 top-2 rounded-full bg-black/65 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white backdrop-blur-sm">
        Ep. {chapter.chapter_number}
      </div>

      <div className="absolute inset-x-0 bottom-0 space-y-1 p-3 sm:p-3.5">
        <p
          className={cn(
            'line-clamp-2 font-bold text-white drop-shadow',
            size === 'large' ? 'text-base sm:text-lg' : 'text-sm sm:text-[15px]'
          )}
        >
          {chapter.title || `Episode ${chapter.chapter_number}`}
        </p>
        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[11px] text-white/75">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {daysAgo === 0 ? 'Today' : `${daysAgo}d ago`}
          </span>
          <span>{chapter.page_count}p</span>
          {commentCount > 0 && (
            <span className="inline-flex items-center gap-1">
              <MessageCircle className="h-3 w-3" />
              {commentCount}
            </span>
          )}
          {isContinue && (
            <span className="inline-flex items-center gap-1 font-semibold text-primary">
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

export function CinematicChapterCards({
  items,
  gridView,
  columnClassName,
  onChapterClick,
}: ChapterListRendererProps) {
  // Streaming shelf: horizontal episode rail at density 1
  if (gridView === 1) {
    return (
      <div
        className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin] sm:gap-4"
        data-chapter-rail="episodes"
      >
        {items.map((item) => (
          <CinematicCard
            key={item.chapter.id}
            item={item}
            size="large"
            rail
            onClick={() => onChapterClick(item.chapter)}
          />
        ))}
      </div>
    );
  }

  const size = gridView === 2 ? 'medium' : 'small';
  return (
    <div className={cn('grid gap-3 sm:gap-4', columnClassName)}>
      {items.map((item) => (
        <CinematicCard
          key={item.chapter.id}
          item={item}
          size={size}
          onClick={() => onChapterClick(item.chapter)}
        />
      ))}
    </div>
  );
}

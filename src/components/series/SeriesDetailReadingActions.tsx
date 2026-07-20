import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, Play, Share2, Coins, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeriesDetailReadingActionsProps {
  seriesId: string;
  seriesTitle: string;
  startChapter: number;
  continueLabel: string;
  progressPercent: number;
  isInLibrary: boolean;
  hasChapters: boolean;
  accessBadges: Array<'free' | 'coins' | 'premium'>;
  onContinue: () => void;
  onLibraryToggle: () => void;
  onShare: () => void;
  variant: 'sidebar' | 'mobile-bar' | 'inline';
}

export function SeriesDetailReadingActions({
  seriesId,
  startChapter,
  continueLabel,
  progressPercent,
  isInLibrary,
  hasChapters,
  accessBadges,
  onContinue,
  onLibraryToggle,
  onShare,
  variant,
}: SeriesDetailReadingActionsProps) {
  const inner = (
    <>
      {hasChapters && (
        <Button asChild size="lg" className="min-h-11 w-full gap-2 rounded-xl text-sm sm:text-base">
          <Link to={`/reader/${seriesId}/${startChapter}`} onClick={onContinue}>
            <Play className="h-4 w-4 sm:h-5 sm:w-5" />
            {continueLabel}
          </Link>
        </Button>
      )}
      {progressPercent > 0 && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Reading progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-gradient-to-r from-primary to-secondary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
      <Button
        onClick={onLibraryToggle}
        size="lg"
        className={cn(
          'min-h-11 w-full gap-2 rounded-xl text-sm font-semibold shadow-md transition-all sm:text-base',
          isInLibrary
            ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white hover:from-red-600 hover:to-pink-700'
            : 'border border-primary/30 bg-primary text-primary-foreground hover:bg-primary/90'
        )}
      >
        <Heart className={cn('h-4 w-4 sm:h-5 sm:w-5', isInLibrary && 'fill-current')} />
        {isInLibrary ? 'In Library' : 'Add to Library'}
      </Button>
      <Button
        variant="outline"
        size="lg"
        className="min-h-11 w-full gap-2 rounded-xl text-sm sm:text-base"
        onClick={onShare}
      >
        <Share2 className="h-4 w-4" />
        Share
      </Button>
      {variant !== 'mobile-bar' && accessBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {accessBadges.includes('free') && (
            <Badge variant="secondary" className="text-[11px] sm:text-xs">
              Free chapter
            </Badge>
          )}
          {accessBadges.includes('coins') && (
            <Badge variant="outline" className="gap-1 text-[11px] sm:text-xs">
              <Coins className="h-3 w-3" />
              Coin chapter
            </Badge>
          )}
          {accessBadges.includes('premium') && (
            <Badge variant="outline" className="gap-1 text-[11px] sm:text-xs">
              <Crown className="h-3 w-3" />
              Premium chapter
            </Badge>
          )}
        </div>
      )}
    </>
  );

  if (variant === 'mobile-bar') {
    return (
      <div
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 p-3 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg gap-2">
          {hasChapters && (
            <Button asChild className="min-h-11 flex-1 gap-2 rounded-xl">
              <Link to={`/reader/${seriesId}/${startChapter}`} onClick={onContinue}>
                <Play className="h-4 w-4" />
                {continueLabel}
              </Link>
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 shrink-0 rounded-xl"
            onClick={onLibraryToggle}
            aria-label={isInLibrary ? 'Remove from library' : 'Add to library'}
          >
            <Heart className={cn('h-4 w-4', isInLibrary && 'fill-current text-red-500')} />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="min-h-11 min-w-11 shrink-0 rounded-xl"
            onClick={onShare}
            aria-label="Share series"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <aside className="hidden lg:block">
        <div className="sticky top-24 space-y-3 rounded-2xl border border-border/30 bg-card/80 p-4 backdrop-blur-xl shadow-lg">
          {inner}
        </div>
      </aside>
    );
  }

  return <div className="mt-4 space-y-3 sm:mt-6">{inner}</div>;
}

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
  variant: 'mobile-bar' | 'inline';
  /** Smaller buttons for information-dense layouts (Layout D — Compact List). */
  dense?: boolean;
  /** Icon-only Library button instead of icon+label (Layout B floating panel, dense rows). */
  iconOnlyLibrary?: boolean;
}

/**
 * Compact, content-width action group — never a full-bleed bar on
 * desktop/tablet. Primary action caps out around 190–220px; secondary
 * actions are icon-first so this group stays a supporting element next to
 * title/cover, not the loudest thing on the page.
 */
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
  dense = false,
  iconOnlyLibrary = false,
}: SeriesDetailReadingActionsProps) {
  const barHeight = dense ? 'h-9' : 'h-10 sm:h-11';

  const inner = (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {hasChapters && (
          <Button
            asChild
            size="sm"
            className={cn(
              'w-auto shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-4 text-sm font-semibold',
              barHeight,
              dense ? 'max-w-[170px]' : 'max-w-[220px] sm:px-5'
            )}
          >
            <Link to={`/reader/${seriesId}/${startChapter}`} onClick={onContinue}>
              <Play className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
              <span className="truncate">{continueLabel}</span>
            </Link>
          </Button>
        )}
        <Button
          type="button"
          variant={isInLibrary ? 'secondary' : 'outline'}
          size="sm"
          onClick={onLibraryToggle}
          className={cn(
            'w-auto shrink-0 gap-1.5 whitespace-nowrap rounded-lg px-3 text-sm font-medium',
            barHeight,
            iconOnlyLibrary && 'px-0'
          )}
          aria-label={isInLibrary ? 'Remove from library' : 'Add to library'}
        >
          <Heart className={cn('h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4', isInLibrary && 'fill-current text-red-500')} />
          {!iconOnlyLibrary && <span className="truncate">{isInLibrary ? 'In Library' : 'Add to Library'}</span>}
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onShare}
          aria-label="Share series"
          className={cn('shrink-0 rounded-lg border border-border/40', dense ? 'h-9 w-9' : 'h-10 w-10 sm:h-11 sm:w-11')}
        >
          <Share2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
        </Button>
      </div>

      {progressPercent > 0 && (
        <div className="max-w-[220px] space-y-1">
          <div className="flex justify-between text-[11px] text-muted-foreground">
            <span>Progress</span>
            <span>{progressPercent}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-muted/50">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}

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
        className="fixed inset-x-0 bottom-0 z-40 border-t border-border/40 bg-background/95 p-2.5 backdrop-blur-xl lg:hidden"
        style={{ paddingBottom: 'max(0.625rem, env(safe-area-inset-bottom))' }}
      >
        <div className="mx-auto flex max-w-lg items-center justify-center gap-2">
          {hasChapters && (
            <Button asChild size="sm" className="h-10 w-auto max-w-[220px] flex-1 gap-1.5 rounded-lg px-4">
              <Link to={`/reader/${seriesId}/${startChapter}`} onClick={onContinue}>
                <Play className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{continueLabel}</span>
              </Link>
            </Button>
          )}
          <Button
            type="button"
            variant={isInLibrary ? 'secondary' : 'outline'}
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg"
            onClick={onLibraryToggle}
            aria-label={isInLibrary ? 'Remove from library' : 'Add to library'}
          >
            <Heart className={cn('h-4 w-4', isInLibrary && 'fill-current text-red-500')} />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-10 w-10 shrink-0 rounded-lg"
            onClick={onShare}
            aria-label="Share series"
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return <div className={cn('space-y-2.5', dense ? 'mt-2' : 'mt-3')}>{inner}</div>;
}

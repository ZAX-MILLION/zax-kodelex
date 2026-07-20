import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeriesDetailViewModel } from './SeriesDetailHero';

interface SeriesDetailTitleBlockProps {
  series: SeriesDetailViewModel;
  chapterCount: number;
  accessBadges?: Array<'free' | 'coins' | 'premium'>;
  compact?: boolean;
  showStats?: boolean;
  className?: string;
}

export function SeriesDetailTitleBlock({
  series,
  chapterCount,
  accessBadges = [],
  compact = false,
  showStats = true,
  className,
}: SeriesDetailTitleBlockProps) {
  return (
    <div className={cn('min-w-0 space-y-2 sm:space-y-3', className)}>
      <div className="space-y-1 sm:space-y-2">
        <h1
          className={cn(
            'break-words font-black leading-tight text-foreground',
            compact
              ? 'text-lg xs:text-xl sm:text-2xl'
              : 'text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]'
          )}
        >
          {series.title}
        </h1>
        {series.alt_title && (
          <p className="text-sm text-muted-foreground sm:text-base">{series.alt_title}</p>
        )}
      </div>

      {showStats && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
          {series.rating_average != null && series.rating_average > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {series.rating_average.toFixed(1)}
              {series.rating_count != null && series.rating_count > 0 && (
                <span className="font-normal text-muted-foreground">
                  ({series.rating_count.toLocaleString()})
                </span>
              )}
            </span>
          )}
          {series.status && (
            <span className="rounded-full border border-border/40 bg-muted/40 px-2 py-0.5 capitalize">
              {series.status}
            </span>
          )}
          {series.followers_count != null && series.followers_count > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Users className="h-3.5 w-3.5" />
              {series.followers_count.toLocaleString()} followers
            </span>
          )}
          {chapterCount > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <BookOpen className="h-3.5 w-3.5" />
              {chapterCount} chapters
            </span>
          )}
          {series.view_count != null && series.view_count > 0 && (
            <span className="inline-flex items-center gap-1 text-muted-foreground">
              <Eye className="h-3.5 w-3.5" />
              {series.view_count.toLocaleString()} views
            </span>
          )}
        </div>
      )}

      <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-base">
        {series.author && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
            <span className="text-muted-foreground">
              By <span className="font-semibold text-foreground">{series.author}</span>
            </span>
          </div>
        )}
        {series.artist && series.artist !== series.author && (
          <div className="flex min-w-0 items-center gap-2">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
            <span className="text-muted-foreground">
              Art by <span className="font-semibold text-foreground">{series.artist}</span>
            </span>
          </div>
        )}
      </div>

      {series.genres && series.genres.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {series.genres.slice(0, compact ? 6 : 8).map((genre) => (
            <Link
              key={genre}
              to={`/series?genre=${encodeURIComponent(genre)}`}
              className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 sm:px-3 sm:py-1 sm:text-xs"
            >
              {genre}
            </Link>
          ))}
        </div>
      )}

      {accessBadges.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {accessBadges.includes('free') && (
            <span className="rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 text-[11px]">
              Free chapter
            </span>
          )}
          {accessBadges.includes('coins') && (
            <span className="rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 text-[11px]">
              Coin chapter
            </span>
          )}
          {accessBadges.includes('premium') && (
            <span className="rounded-full border border-border/30 bg-muted/50 px-2 py-0.5 text-[11px]">
              Premium chapter
            </span>
          )}
        </div>
      )}
    </div>
  );
}

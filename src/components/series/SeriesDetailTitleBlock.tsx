import { Link } from 'react-router-dom';
import { Star, Users, BookOpen, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { SeriesDetailViewModel } from './SeriesDetailHero';

export type TitleBlockPresentation = 'editorial' | 'cinematic' | 'catalogue' | 'index';

interface SeriesDetailTitleBlockProps {
  series: SeriesDetailViewModel;
  chapterCount: number;
  accessBadges?: Array<'free' | 'coins' | 'premium'>;
  compact?: boolean;
  showStats?: boolean;
  /** Layout-specific metadata presentation */
  presentation?: TitleBlockPresentation;
  className?: string;
}

export function SeriesDetailTitleBlock({
  series,
  chapterCount,
  accessBadges = [],
  compact = false,
  showStats = true,
  presentation = 'editorial',
  className,
}: SeriesDetailTitleBlockProps) {
  const isIndex = presentation === 'index';
  const isEditorial = presentation === 'editorial';
  const isCatalogue = presentation === 'catalogue';
  const isCinematic = presentation === 'cinematic';

  const metaBits: string[] = [];
  if (series.author) metaBits.push(series.author);
  if (series.status) metaBits.push(series.status);
  if (chapterCount > 0) metaBits.push(`${chapterCount} ch`);
  if (series.rating_average != null && series.rating_average > 0) {
    metaBits.push(`${series.rating_average.toFixed(1)}★`);
  }

  return (
    <div
      className={cn(
        'min-w-0',
        isIndex ? 'space-y-1' : 'space-y-2 sm:space-y-3',
        className
      )}
    >
      <div className={cn(isIndex ? 'space-y-0' : 'space-y-1 sm:space-y-2')}>
        <h1
          className={cn(
            'break-words leading-tight text-foreground',
            isIndex && 'text-base font-semibold xs:text-lg sm:text-xl',
            isCinematic && 'text-lg font-bold xs:text-xl sm:text-2xl lg:text-3xl',
            isCatalogue && 'text-lg font-bold xs:text-xl sm:text-2xl',
            isEditorial &&
              (compact
                ? 'text-lg font-black xs:text-xl sm:text-2xl'
                : 'text-xl font-black xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]')
          )}
        >
          {series.title}
        </h1>
        {series.alt_title && !isIndex && (
          <p className="text-sm text-muted-foreground sm:text-base">{series.alt_title}</p>
        )}
      </div>

      {/* Index: single condensed metadata line */}
      {isIndex && (
        <p className="truncate text-[11px] text-muted-foreground sm:text-xs">
          {metaBits.join(' · ')}
        </p>
      )}

      {/* Editorial: inline text with separators, no pill chips */}
      {isEditorial && showStats && (
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
          {series.rating_average != null && series.rating_average > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {series.rating_average.toFixed(1)}
            </span>
          )}
          {series.status && (
            <>
              <span aria-hidden className="text-border">
                |
              </span>
              <span className="capitalize">{series.status}</span>
            </>
          )}
          {series.author && (
            <>
              <span aria-hidden className="text-border">
                |
              </span>
              <span>{series.author}</span>
            </>
          )}
          {chapterCount > 0 && (
            <>
              <span aria-hidden className="text-border">
                |
              </span>
              <span>{chapterCount} chapters</span>
            </>
          )}
          {series.view_count != null && series.view_count > 0 && (
            <>
              <span aria-hidden className="text-border">
                |
              </span>
              <span>{series.view_count.toLocaleString()} views</span>
            </>
          )}
        </p>
      )}

      {/* Cinematic: minimal overlay stats */}
      {isCinematic && showStats && (
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground sm:text-sm">
          {series.rating_average != null && series.rating_average > 0 && (
            <span className="inline-flex items-center gap-1 font-semibold text-foreground">
              <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
              {series.rating_average.toFixed(1)}
            </span>
          )}
          {series.status && <span className="capitalize">{series.status}</span>}
          {chapterCount > 0 && <span>{chapterCount} ch</span>}
        </div>
      )}

      {/* Catalogue: scannable chips + stats row */}
      {isCatalogue && (
        <>
          {showStats && (
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs sm:text-sm">
              {series.rating_average != null && series.rating_average > 0 && (
                <span className="inline-flex items-center gap-1 font-semibold">
                  <Star className="h-3.5 w-3.5 fill-yellow-500 text-yellow-500" />
                  {series.rating_average.toFixed(1)}
                </span>
              )}
              {series.status && (
                <span className="rounded-md border border-border/40 bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
                  {series.status}
                </span>
              )}
              {series.followers_count != null && series.followers_count > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  {series.followers_count.toLocaleString()}
                </span>
              )}
              {chapterCount > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-3.5 w-3.5" />
                  {chapterCount}
                </span>
              )}
              {series.view_count != null && series.view_count > 0 && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <Eye className="h-3.5 w-3.5" />
                  {series.view_count.toLocaleString()}
                </span>
              )}
            </div>
          )}
          {series.genres && series.genres.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {series.genres.slice(0, 6).map((genre) => (
                <Link
                  key={genre}
                  to={`/series?genre=${encodeURIComponent(genre)}`}
                  className="rounded-md border border-primary/25 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary"
                >
                  {genre}
                </Link>
              ))}
            </div>
          )}
          {accessBadges.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {accessBadges.includes('free') && (
                <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                  Free
                </span>
              )}
              {accessBadges.includes('coins') && (
                <span className="rounded-md bg-amber-500/15 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:text-amber-400">
                  Coins
                </span>
              )}
              {accessBadges.includes('premium') && (
                <span className="rounded-md bg-violet-500/15 px-2 py-0.5 text-[10px] font-semibold text-violet-700 dark:text-violet-300">
                  Premium
                </span>
              )}
            </div>
          )}
        </>
      )}

      {/* Editorial author line (no genre chips) */}
      {isEditorial && series.author && (
        <p className="text-sm text-muted-foreground">
          By <span className="font-medium text-foreground">{series.author}</span>
          {series.artist && series.artist !== series.author && (
            <>
              {' '}
              · Art <span className="font-medium text-foreground">{series.artist}</span>
            </>
          )}
        </p>
      )}

      {isCinematic && series.author && (
        <p className="text-xs text-muted-foreground sm:text-sm">
          {series.author}
          {series.genres?.[0] ? ` · ${series.genres[0]}` : ''}
        </p>
      )}
    </div>
  );
}

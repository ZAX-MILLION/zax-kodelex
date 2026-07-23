import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import type { DemoSeries } from '@/utils/demoLibraryData';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RelatedTitlesVariant = 'rail' | 'visual-grid' | 'tile-grid' | 'text-list' | 'omit';

interface SeriesRelatedTitlesProps {
  series: DemoSeries[];
  currentTitle?: string;
  /** @deprecated Prefer `variant` */
  compact?: boolean;
  variant?: RelatedTitlesVariant;
}

export function SeriesRelatedTitles({
  series,
  compact = false,
  variant,
}: SeriesRelatedTitlesProps) {
  const mode: RelatedTitlesVariant =
    variant || (compact ? 'rail' : 'tile-grid');

  if (mode === 'omit') return null;

  if (series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No related titles found in the demo catalogue.</p>
    );
  }

  if (mode === 'text-list') {
    return (
      <ul className="divide-y divide-border/20 border-y border-border/20">
        {series.map((item) => (
          <li key={item.id}>
            <Link
              to={`/series/${item.id}`}
              className="flex items-baseline justify-between gap-3 py-2 text-sm transition-colors hover:text-primary"
            >
              <span className="min-w-0 truncate font-medium">{item.title}</span>
              <span className="shrink-0 text-xs text-muted-foreground">{item.author}</span>
            </Link>
          </li>
        ))}
      </ul>
    );
  }

  if (mode === 'rail') {
    return (
      <div className="-mx-1 flex gap-3 overflow-x-auto px-1 pb-2 [scrollbar-width:thin]">
        {series.map((item) => (
          <Link
            key={item.id}
            to={`/series/${item.id}`}
            className="group w-[88px] shrink-0 sm:w-[100px]"
          >
            <LazyImage
              src={getOptimizedImageUrl(item.cover_image_url || getFallbackCoverImage(item.id), 120, 160)}
              alt={item.title}
              width={120}
              height={160}
              className="aspect-[3/4] w-full rounded-md object-cover"
              loading="lazy"
            />
            <h3 className="mt-1.5 line-clamp-2 text-[11px] font-medium leading-tight text-muted-foreground group-hover:text-foreground">
              {item.title}
            </h3>
          </Link>
        ))}
      </div>
    );
  }

  const visual = mode === 'visual-grid';
  const imgW = visual ? 320 : 200;
  const imgH = visual ? 450 : 280;

  return (
    <div
      className={cn(
        'grid gap-3',
        visual
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
      )}
    >
      {series.map((item) => (
        <Link
          key={item.id}
          to={`/series/${item.id}`}
          className={cn(
            'group overflow-hidden transition-colors',
            visual
              ? 'rounded-xl border border-border/20 bg-card/50 hover:border-primary/35'
              : 'rounded-lg border border-border/20 bg-card/40 hover:border-primary/25 hover:bg-card/60'
          )}
        >
          <LazyImage
            src={getOptimizedImageUrl(item.cover_image_url || getFallbackCoverImage(item.id), imgW, imgH)}
            alt={item.title}
            width={imgW}
            height={imgH}
            className={cn(
              'w-full object-cover transition-transform group-hover:scale-[1.02]',
              visual ? 'aspect-[16/10] sm:aspect-[3/4]' : 'aspect-[3/4]'
            )}
            loading="lazy"
          />
          <div className={visual ? 'space-y-1 p-3' : 'space-y-0.5 p-2'}>
            <h3
              className={cn(
                'line-clamp-2 font-medium leading-snug',
                visual ? 'text-sm sm:text-base' : 'text-xs sm:text-sm'
              )}
            >
              {item.title}
            </h3>
            {visual && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{item.author}</p>
            )}
            {item.rating_average > 0 && (
              <p className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />
                {item.rating_average.toFixed(1)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

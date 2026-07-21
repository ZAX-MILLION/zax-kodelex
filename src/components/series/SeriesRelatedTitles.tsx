import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import type { DemoSeries } from '@/utils/demoLibraryData';
import { Star } from 'lucide-react';

interface SeriesRelatedTitlesProps {
  series: DemoSeries[];
  currentTitle: string;
  compact?: boolean;
}

export function SeriesRelatedTitles({ series, compact = false }: SeriesRelatedTitlesProps) {
  if (series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No related titles found in the demo catalogue.</p>
    );
  }

  const imgW = compact ? 120 : 280;
  const imgH = compact ? 160 : 400;

  return (
    <div
      className={
        compact
          ? 'grid grid-cols-3 gap-2 xs:grid-cols-4 sm:grid-cols-5 lg:grid-cols-6'
          : 'grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4'
      }
    >
      {series.map((item) => (
        <Link
          key={item.id}
          to={`/series/${item.id}`}
          className={
            compact
              ? 'group overflow-hidden rounded-lg border border-border/20 bg-card/40 transition-colors hover:border-primary/25 hover:bg-card/60'
              : 'group overflow-hidden rounded-xl border border-border/25 bg-card/60 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/80'
          }
        >
          <LazyImage
            src={getOptimizedImageUrl(item.cover_image_url || getFallbackCoverImage(item.id), imgW, imgH)}
            alt={item.title}
            width={imgW}
            height={imgH}
            className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className={compact ? 'space-y-0.5 p-1.5 sm:p-2' : 'space-y-1 p-3'}>
            <h3
              className={
                compact
                  ? 'line-clamp-2 text-[11px] font-medium leading-tight sm:text-xs'
                  : 'line-clamp-2 text-sm font-semibold leading-snug'
              }
            >
              {item.title}
            </h3>
            {!compact && (
              <p className="line-clamp-1 text-xs text-muted-foreground">{item.author}</p>
            )}
            {item.rating_average > 0 && (
              <p
                className={
                  compact
                    ? 'flex items-center gap-0.5 text-[10px] text-muted-foreground'
                    : 'flex items-center gap-1 text-xs text-muted-foreground'
                }
              >
                <Star className={compact ? 'h-2.5 w-2.5 fill-yellow-500 text-yellow-500' : 'h-3 w-3 fill-yellow-500 text-yellow-500'} />
                {item.rating_average.toFixed(1)}
              </p>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}

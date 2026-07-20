import { Link } from 'react-router-dom';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import type { DemoSeries } from '@/utils/demoLibraryData';
import { Star } from 'lucide-react';

interface SeriesRelatedTitlesProps {
  series: DemoSeries[];
  currentTitle: string;
}

export function SeriesRelatedTitles({ series, currentTitle }: SeriesRelatedTitlesProps) {
  if (series.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No related titles found in the demo catalogue.</p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {series.map((item) => (
        <Link
          key={item.id}
          to={`/series/${item.id}`}
          className="group overflow-hidden rounded-xl border border-border/25 bg-card/60 backdrop-blur-sm transition-colors hover:border-primary/30 hover:bg-card/80"
        >
          <LazyImage
            src={getOptimizedImageUrl(item.cover_image_url || getFallbackCoverImage(item.id), 280, 400)}
            alt={item.title}
            width={280}
            height={400}
            className="aspect-[3/4] w-full object-cover transition-transform group-hover:scale-[1.02]"
            loading="lazy"
          />
          <div className="space-y-1 p-3">
            <h3 className="line-clamp-2 text-sm font-semibold leading-snug">{item.title}</h3>
            <p className="line-clamp-1 text-xs text-muted-foreground">{item.author}</p>
            {item.rating_average > 0 && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
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

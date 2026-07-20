import { useEffect, useState } from 'react';
import {
  getOptimizedSeriesDetailsBgUrl,
  resolveSeriesDetailsBackground,
  type SeriesDetailsBgSource,
} from '@/features/series/seriesDetailsBackground';
import { cn } from '@/lib/utils';

interface SeriesDetailsBackgroundProps {
  seriesId: string;
  seriesCustomUrl?: string | null;
  globalDefaultUrl?: string | null;
  className?: string;
  children: React.ReactNode;
}

/**
 * Fixed, softened page backdrop for manga/series details.
 * Content scrolls above a dimmed, blurred image layer for readability.
 */
export function SeriesDetailsBackground({
  seriesId,
  seriesCustomUrl,
  globalDefaultUrl,
  className,
  children,
}: SeriesDetailsBackgroundProps) {
  const resolved = resolveSeriesDetailsBackground({
    seriesId,
    seriesCustomUrl,
    globalDefaultUrl,
  });
  const [src, setSrc] = useState(() => getOptimizedSeriesDetailsBgUrl(resolved.url));
  const [source, setSource] = useState<SeriesDetailsBgSource>(resolved.source);

  useEffect(() => {
    const next = resolveSeriesDetailsBackground({
      seriesId,
      seriesCustomUrl,
      globalDefaultUrl,
    });
    setSrc(getOptimizedSeriesDetailsBgUrl(next.url));
    setSource(next.source);
  }, [seriesId, seriesCustomUrl, globalDefaultUrl]);

  return (
    <div className={cn('relative min-h-screen overflow-x-hidden', className)}>
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        aria-hidden
        data-series-details-bg={source}
      >
        <img
          src={src}
          alt=""
          width={1600}
          height={900}
          decoding="async"
          loading="eager"
          fetchPriority="low"
          className="h-full w-full object-cover scale-105 blur-[2px] sm:blur-[3px]"
          onError={(e) => {
            const el = e.currentTarget;
            if (!el.src.includes('series-details-bg-default')) {
              el.src = '/assets/series-details-bg-default.svg';
              setSource('fallback');
            }
          }}
        />
        <div className="absolute inset-0 bg-background/75 sm:bg-background/70" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/55 to-background/90" />
      </div>
      <div className="relative z-0">{children}</div>
    </div>
  );
}

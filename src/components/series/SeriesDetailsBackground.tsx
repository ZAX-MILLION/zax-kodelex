import { useEffect, useMemo, useState } from 'react';
import {
  getOptimizedSeriesDetailsBgUrl,
  getSeriesDetailsBgPositionStyle,
  resolveSeriesDetailsBackground,
  SERIES_DETAILS_BG_FALLBACK,
  type SeriesDetailsBgSource,
  type SeriesDetailsBgTheme,
} from '@/features/series/seriesDetailsBackground';
import { getLayoutBgPreset } from '@/features/series/seriesDetailsLayoutBgPresets';
import type { SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';
import { cn } from '@/lib/utils';

interface SeriesDetailsBackgroundProps {
  seriesId: string;
  seriesCustomUrl?: string | null;
  globalDefaultUrl?: string | null;
  coverImageUrl?: string | null;
  layoutId?: SeriesDetailsLayoutId;
  /** Per-series background theme persisted in the database (staging/production). */
  dbThemeOverride?: Partial<SeriesDetailsBgTheme> | null;
  className?: string;
  children: React.ReactNode;
}

/**
 * Fixed or scrolling page backdrop for manga/series details.
 * Content scrolls above a dimmed, blurred image layer for readability.
 */
export function SeriesDetailsBackground({
  seriesId,
  seriesCustomUrl,
  globalDefaultUrl,
  coverImageUrl,
  layoutId = 'A',
  dbThemeOverride,
  className,
  children,
}: SeriesDetailsBackgroundProps) {
  const layoutPreset = getLayoutBgPreset(layoutId);
  const resolved = useMemo(
    () =>
      resolveSeriesDetailsBackground({
        seriesId,
        seriesCustomUrl,
        globalDefaultUrl,
        coverImageUrl,
        layoutPreset,
        dbThemeOverride,
      }),
    [seriesId, seriesCustomUrl, globalDefaultUrl, coverImageUrl, layoutId, dbThemeOverride]
  );

  const [src, setSrc] = useState(() => getOptimizedSeriesDetailsBgUrl(resolved.url));
  const [source, setSource] = useState<SeriesDetailsBgSource>(resolved.source);
  const { theme } = resolved;

  useEffect(() => {
    const next = resolveSeriesDetailsBackground({
      seriesId,
      seriesCustomUrl,
      globalDefaultUrl,
      coverImageUrl,
      layoutPreset: getLayoutBgPreset(layoutId),
      dbThemeOverride,
    });
    setSrc(getOptimizedSeriesDetailsBgUrl(next.url));
    setSource(next.source);
  }, [seriesId, seriesCustomUrl, globalDefaultUrl, coverImageUrl, layoutId, dbThemeOverride]);

  const overlayAlpha = theme.overlayDarkness / 100;
  const accentStyle = theme.accentColor
    ? ({ '--series-bg-accent': theme.accentColor } as React.CSSProperties)
    : undefined;

  return (
    <div
      className={cn('relative min-h-screen overflow-x-hidden', className)}
      style={accentStyle}
      data-series-details-layout={layoutId}
    >
      <div
        className={cn(
          'pointer-events-none inset-0 -z-10',
          theme.attachment === 'fixed' ? 'fixed' : 'absolute'
        )}
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
          className="h-full w-full object-cover scale-105"
          style={{
            objectPosition: getSeriesDetailsBgPositionStyle(theme.position),
            filter: theme.blur > 0 ? `blur(${theme.blur}px)` : undefined,
          }}
          onError={(e) => {
            const el = e.currentTarget;
            if (source === 'cover' && coverImageUrl) {
              setSrc(SERIES_DETAILS_BG_FALLBACK);
              setSource('fallback');
              return;
            }
            if (!el.src.includes('series-details-bg-default')) {
              el.src = SERIES_DETAILS_BG_FALLBACK;
              setSource('fallback');
            }
          }}
        />
        <div
          className="absolute inset-0 bg-background"
          style={{ opacity: overlayAlpha }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/50 to-background/92" />
        {theme.accentColor && (
          <div
            className="absolute inset-0 mix-blend-soft-light opacity-25"
            style={{ backgroundColor: theme.accentColor }}
          />
        )}
      </div>
      <div className="relative z-10 isolate">{children}</div>
    </div>
  );
}


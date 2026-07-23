import { lazy, Suspense, type LazyExoticComponent, type ComponentType } from 'react';
import type { SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';
import type { SeriesDetailLayoutShellProps } from './types';

const Editorial = lazy(() =>
  import('./SeriesDetailsLayoutEditorial').then((m) => ({
    default: m.SeriesDetailsLayoutEditorial,
  }))
);
const Cinematic = lazy(() =>
  import('./SeriesDetailsLayoutCinematic').then((m) => ({
    default: m.SeriesDetailsLayoutCinematic,
  }))
);
const Compact = lazy(() =>
  import('./SeriesDetailsLayoutCompact').then((m) => ({
    default: m.SeriesDetailsLayoutCompact,
  }))
);
const CompactList = lazy(() =>
  import('./SeriesDetailsLayoutCompactList').then((m) => ({
    default: m.SeriesDetailsLayoutCompactList,
  }))
);

function LayoutFallback() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="animate-pulse space-y-4">
        <div className="h-8 max-w-md rounded-lg bg-muted/30" />
        <div className="h-48 rounded-xl bg-muted/20" />
      </div>
    </div>
  );
}

/**
 * Canonical ID → lazy shell mapping.
 * A/B/C/D MUST each point at a different component (enforced by unit tests).
 */
export const SERIES_DETAILS_LAYOUT_SHELLS: Record<
  SeriesDetailsLayoutId,
  LazyExoticComponent<ComponentType<SeriesDetailLayoutShellProps>>
> = {
  A: Editorial,
  B: Cinematic,
  C: Compact,
  D: CompactList,
};

export const SERIES_DETAILS_LAYOUT_SHELL_FILES: Record<SeriesDetailsLayoutId, string> = {
  A: 'SeriesDetailsLayoutEditorial',
  B: 'SeriesDetailsLayoutCinematic',
  C: 'SeriesDetailsLayoutCompact',
  D: 'SeriesDetailsLayoutCompactList',
};

export function getSeriesDetailsLayoutShellLazy(
  layoutId: SeriesDetailsLayoutId
): LazyExoticComponent<ComponentType<SeriesDetailLayoutShellProps>> {
  return SERIES_DETAILS_LAYOUT_SHELLS[layoutId];
}

export function SeriesDetailsLayoutShell({
  layoutId,
  ...props
}: SeriesDetailLayoutShellProps) {
  const Shell = SERIES_DETAILS_LAYOUT_SHELLS[layoutId];
  return (
    <Suspense fallback={<LayoutFallback />}>
      {/* key forces a full unmount when the visitor switches A/B/C/D */}
      <Shell key={layoutId} {...props} layoutId={layoutId} />
    </Suspense>
  );
}

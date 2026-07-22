import { useMemo, useState } from 'react';
import { LayoutGrid, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  clearSeriesDetailsLayoutOverride,
  getGlobalSeriesDetailsLayout,
  getSeriesDetailsLayoutOverride,
  resolveSeriesDetailsLayout,
  SERIES_DETAILS_LAYOUT_DEFAULT,
  SERIES_DETAILS_LAYOUT_META,
  setGlobalSeriesDetailsLayout,
  setSeriesDetailsLayoutOverride,
  type SeriesDetailsLayoutId,
} from '@/features/series/seriesDetailsLayout';
import {
  canSyncSeriesDetailsOverrideToDb,
  syncSeriesDetailsOverrideToDb,
  type SeriesDetailsDbSyncResult,
} from '@/features/series/seriesDetailsAdminSync';
import { SeriesLayoutThumbnail } from './SeriesLayoutThumbnail';

const LAYOUT_IDS: SeriesDetailsLayoutId[] = ['A', 'B', 'C', 'D'];

interface SeriesDetailsLayoutControlsProps {
  seriesId?: string;
  seriesTitle?: string;
  onChanged?: () => void;
  compact?: boolean;
  /** Controlled layout (Series Design page draft — no per-field save). */
  layout?: SeriesDetailsLayoutId;
  onLayoutChange?: (layout: SeriesDetailsLayoutId) => void;
  hideActions?: boolean;
}

export function SeriesDetailsLayoutControls({
  seriesId,
  seriesTitle,
  onChanged,
  compact,
  layout: controlledLayout,
  onLayoutChange,
  hideActions,
}: SeriesDetailsLayoutControlsProps) {
  const isSeries = Boolean(seriesId);
  const isControlled = controlledLayout !== undefined && onLayoutChange !== undefined;
  const resolved = resolveSeriesDetailsLayout(seriesId);
  const initial = isSeries
    ? getSeriesDetailsLayoutOverride(seriesId!) || SERIES_DETAILS_LAYOUT_DEFAULT
    : getGlobalSeriesDetailsLayout() || SERIES_DETAILS_LAYOUT_DEFAULT;

  const [internalLayout, setInternalLayout] = useState<SeriesDetailsLayoutId>(initial);
  const layout = isControlled ? controlledLayout : internalLayout;
  const setLayout = isControlled ? onLayoutChange : setInternalLayout;
  const [notice, setNotice] = useState<string | null>(null);

  const previewResolved = useMemo(
    () => (isSeries ? resolveSeriesDetailsLayout(seriesId) : layout),
    [isSeries, seriesId, layout]
  );

  const save = () => {
    if (isSeries && seriesId) {
      setSeriesDetailsLayoutOverride(seriesId, layout);
      setNotice(`Layout saved for ${seriesTitle || 'this series'} (local preview).`);
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, { details_layout_override: layout }).then(
          (result: SeriesDetailsDbSyncResult) => {
            if (result.ok) {
              setNotice(`Layout saved for ${seriesTitle || 'this series'}.`);
              return;
            }
            setNotice(`Layout saved locally, but database sync failed: ${result.error ?? 'unknown error'}`);
          }
        );
      }
    } else {
      setGlobalSeriesDetailsLayout(layout);
      setNotice('Global manga details layout saved.');
    }
    onChanged?.();
  };

  const reset = () => {
    if (isSeries && seriesId) {
      clearSeriesDetailsLayoutOverride(seriesId);
      setLayout(resolveSeriesDetailsLayout(seriesId));
      setNotice('Series layout override cleared.');
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, { details_layout_override: null });
      }
    } else {
      setGlobalSeriesDetailsLayout(null);
      setLayout(SERIES_DETAILS_LAYOUT_DEFAULT);
      setNotice('Global layout reset to Editorial (A).');
    }
    onChanged?.();
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center gap-2">
        <LayoutGrid className="h-4 w-4 text-primary" aria-hidden />
        <Label className="text-sm font-semibold">
          {isSeries
            ? `Layout for ${seriesTitle || 'this series'}`
            : 'Default manga details layout'}
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Priority: per-series override → global default → Layout A (Editorial). Currently active:{' '}
        <strong>{SERIES_DETAILS_LAYOUT_META[previewResolved].label}</strong>
      </p>
      <p className="text-[11px] text-muted-foreground">
        Note: the chapter grid&apos;s 1 / 2 / 3 column toggle is a reader view density preference, not a
        page style — it applies inside every layout below.
      </p>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {LAYOUT_IDS.map((id) => {
          const meta = SERIES_DETAILS_LAYOUT_META[id];
          const selected = layout === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setLayout(id)}
              className={cn(
                'rounded-xl border p-3 text-left transition-colors',
                selected
                  ? 'border-primary bg-primary/5'
                  : 'border-border/40 bg-card/50 hover:border-primary/30'
              )}
              aria-pressed={selected}
            >
              <SeriesLayoutThumbnail layoutId={id} selected={selected} />
              <p className="mt-2 text-xs font-semibold">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{meta.description}</p>
            </button>
          );
        })}
      </div>

      {!hideActions && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={save}>
            Save layout
          </Button>
          <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      )}
      {notice && (
        <p className="text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

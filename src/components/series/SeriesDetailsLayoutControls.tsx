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

const LAYOUT_IDS: SeriesDetailsLayoutId[] = ['A', 'B', 'C'];

function LayoutThumbnail({ layoutId, selected }: { layoutId: SeriesDetailsLayoutId; selected: boolean }) {
  return (
    <div
      className={cn(
        'relative h-20 w-full overflow-hidden rounded-lg border bg-muted/30 sm:h-24',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border/40'
      )}
      aria-hidden
    >
      {layoutId === 'A' && (
        <div className="flex h-full gap-1 p-2">
          <div className="w-1/3 rounded bg-primary/30" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-2 w-3/4 rounded bg-foreground/20" />
            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/30" />
            <div className="mt-auto h-4 rounded bg-primary/20" />
          </div>
        </div>
      )}
      {layoutId === 'B' && (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/25 to-background/80" />
          <div className="relative flex h-full flex-col items-center justify-end gap-1 p-2 pb-3">
            <div className="h-10 w-8 rounded bg-primary/40" />
            <div className="h-2 w-2/3 rounded bg-foreground/25" />
            <div className="h-3 w-1/2 rounded-full bg-primary/50" />
          </div>
        </div>
      )}
      {layoutId === 'C' && (
        <div className="flex h-full flex-col gap-1 p-2">
          <div className="flex gap-1">
            <div className="h-8 w-6 shrink-0 rounded bg-primary/30" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full rounded bg-foreground/20" />
              <div className="h-1 w-2/3 rounded bg-muted-foreground/25" />
            </div>
          </div>
          <div className="mt-1 space-y-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 rounded bg-muted-foreground/15" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

interface SeriesDetailsLayoutControlsProps {
  seriesId?: string;
  seriesTitle?: string;
  onChanged?: () => void;
  compact?: boolean;
}

export function SeriesDetailsLayoutControls({
  seriesId,
  seriesTitle,
  onChanged,
  compact,
}: SeriesDetailsLayoutControlsProps) {
  const isSeries = Boolean(seriesId);
  const resolved = resolveSeriesDetailsLayout(seriesId);
  const initial = isSeries
    ? getSeriesDetailsLayoutOverride(seriesId!) || SERIES_DETAILS_LAYOUT_DEFAULT
    : getGlobalSeriesDetailsLayout() || SERIES_DETAILS_LAYOUT_DEFAULT;

  const [layout, setLayout] = useState<SeriesDetailsLayoutId>(initial);
  const [notice, setNotice] = useState<string | null>(null);

  const previewResolved = useMemo(
    () => (isSeries ? resolveSeriesDetailsLayout(seriesId) : layout),
    [isSeries, seriesId, layout]
  );

  const save = () => {
    if (isSeries && seriesId) {
      setSeriesDetailsLayoutOverride(seriesId, layout);
      setNotice(`Layout saved for ${seriesTitle || 'this series'}.`);
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

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
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
              <LayoutThumbnail layoutId={id} selected={selected} />
              <p className="mt-2 text-xs font-semibold">{meta.label}</p>
              <p className="text-[10px] text-muted-foreground leading-snug">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" onClick={save}>
          Save layout
        </Button>
        <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Reset
        </Button>
      </div>
      {notice && (
        <p className="text-sm text-muted-foreground" role="status">
          {notice}
        </p>
      )}
    </div>
  );
}

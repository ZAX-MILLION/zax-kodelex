import { useMemo, useState } from 'react';
import { ImageIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  clearSeriesDetailsBackgroundOverride,
  getGlobalSeriesDetailsBackground,
  getSeriesDetailsBackgroundOverride,
  resolveSeriesDetailsBackground,
  setGlobalSeriesDetailsBackground,
  setSeriesDetailsBackgroundOverride,
  SERIES_DETAILS_BG_FALLBACK,
} from '@/features/series/seriesDetailsBackground';

interface SeriesDetailsBackgroundControlsProps {
  /** When set, edits per-series override; otherwise edits global default. */
  seriesId?: string;
  seriesTitle?: string;
  onChanged?: () => void;
  compact?: boolean;
}

export function SeriesDetailsBackgroundControls({
  seriesId,
  seriesTitle,
  onChanged,
  compact,
}: SeriesDetailsBackgroundControlsProps) {
  const isSeries = Boolean(seriesId);
  const initial = isSeries
    ? getSeriesDetailsBackgroundOverride(seriesId!) || ''
    : getGlobalSeriesDetailsBackground() || '';
  const [url, setUrl] = useState(initial);
  const [notice, setNotice] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!seriesId && !url.trim()) {
      return resolveSeriesDetailsBackground({ seriesId: '_preview_' });
    }
    return resolveSeriesDetailsBackground({
      seriesId: seriesId || '_preview_',
      seriesCustomUrl: isSeries ? url.trim() || null : null,
      globalDefaultUrl: !isSeries ? url.trim() || null : getGlobalSeriesDetailsBackground(),
    });
  }, [isSeries, seriesId, url]);

  const save = () => {
    if (isSeries && seriesId) {
      setSeriesDetailsBackgroundOverride(seriesId, url.trim() || null);
      setNotice(url.trim() ? 'Custom series background saved.' : 'Series background cleared (using global/fallback).');
    } else {
      setGlobalSeriesDetailsBackground(url.trim() || null);
      setNotice(url.trim() ? 'Global manga-details background saved.' : 'Global background reset to built-in default.');
    }
    onChanged?.();
  };

  const reset = () => {
    if (isSeries && seriesId) {
      clearSeriesDetailsBackgroundOverride(seriesId);
      setUrl('');
      setNotice('Series background reset.');
    } else {
      setGlobalSeriesDetailsBackground(null);
      setUrl('');
      setNotice('Global background reset to built-in default.');
    }
    onChanged?.();
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="space-y-2">
        <Label htmlFor={isSeries ? `series-bg-${seriesId}` : 'global-series-bg'}>
          {isSeries
            ? `Background for ${seriesTitle || 'this series'}`
            : 'Default manga details background URL'}
        </Label>
        <Input
          id={isSeries ? `series-bg-${seriesId}` : 'global-series-bg'}
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={SERIES_DETAILS_BG_FALLBACK}
          className="min-h-11"
        />
        <p className="text-xs text-muted-foreground">
          Priority: per-series → global default → built-in. Leave empty to use the next fallback.
        </p>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/20">
        <div className="relative h-28 sm:h-36">
          <img
            src={preview.url}
            alt=""
            className="h-full w-full object-cover blur-[1px] scale-105"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-background/60" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2 text-xs text-muted-foreground">
            <ImageIcon className="h-3.5 w-3.5" aria-hidden />
            Preview · source: {preview.source}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button type="button" className="min-h-11" onClick={save}>
          Save background
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

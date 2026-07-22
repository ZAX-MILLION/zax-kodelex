import { useMemo, useState } from 'react';
import { ImageIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  clearSeriesDetailsBackgroundOverride,
  clearSeriesDetailsBgThemeOverride,
  DEFAULT_SERIES_DETAILS_BG_THEME,
  getGlobalSeriesDetailsBackground,
  getGlobalSeriesDetailsBgTheme,
  getSeriesDetailsBackgroundOverride,
  getSeriesDetailsBgThemeOverride,
  resolveSeriesDetailsBackground,
  setGlobalSeriesDetailsBackground,
  setGlobalSeriesDetailsBgTheme,
  setSeriesDetailsBackgroundOverride,
  setSeriesDetailsBgThemeOverride,
  SERIES_DETAILS_BG_FALLBACK,
  type SeriesDetailsBgAttachment,
  type SeriesDetailsBgPosition,
  type SeriesDetailsBgTheme,
} from '@/features/series/seriesDetailsBackground';
import {
  canSyncSeriesDetailsOverrideToDb,
  syncSeriesDetailsOverrideToDb,
  type SeriesDetailsDbSyncResult,
} from '@/features/series/seriesDetailsAdminSync';

interface SeriesDetailsBackgroundControlsProps {
  /** When set, edits per-series override; otherwise edits global default. */
  seriesId?: string;
  seriesTitle?: string;
  coverImageUrl?: string | null;
  onChanged?: () => void;
  compact?: boolean;
}

function loadTheme(isSeries: boolean, seriesId?: string): SeriesDetailsBgTheme {
  if (isSeries && seriesId) {
    const override = getSeriesDetailsBgThemeOverride(seriesId);
    return { ...getGlobalSeriesDetailsBgTheme(), ...override };
  }
  return getGlobalSeriesDetailsBgTheme();
}

export function SeriesDetailsBackgroundControls({
  seriesId,
  seriesTitle,
  coverImageUrl,
  onChanged,
  compact,
}: SeriesDetailsBackgroundControlsProps) {
  const isSeries = Boolean(seriesId);
  const initial = isSeries
    ? getSeriesDetailsBackgroundOverride(seriesId!) || ''
    : getGlobalSeriesDetailsBackground() || '';
  const [url, setUrl] = useState(initial);
  const [theme, setTheme] = useState<SeriesDetailsBgTheme>(() => loadTheme(isSeries, seriesId));
  const [notice, setNotice] = useState<string | null>(null);

  const preview = useMemo(() => {
    if (!seriesId && !url.trim()) {
      return resolveSeriesDetailsBackground({ seriesId: '_preview_', coverImageUrl });
    }
    return resolveSeriesDetailsBackground({
      seriesId: seriesId || '_preview_',
      seriesCustomUrl: isSeries ? url.trim() || null : null,
      globalDefaultUrl: !isSeries ? url.trim() || null : getGlobalSeriesDetailsBackground(),
      coverImageUrl,
    });
  }, [isSeries, seriesId, url, coverImageUrl]);

  const save = () => {
    if (isSeries && seriesId) {
      setSeriesDetailsBackgroundOverride(seriesId, url.trim() || null);
      setSeriesDetailsBgThemeOverride(seriesId, theme);
      setNotice(
        url.trim()
          ? 'Custom series background saved (local preview).'
          : 'Series background cleared (using global/cover/fallback).'
      );
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, {
          details_background_url: url.trim() || null,
          details_bg_position: theme.position,
          details_bg_overlay_darkness: theme.overlayDarkness,
          details_bg_blur: theme.blur,
          details_bg_accent_color: theme.accentColor,
          details_bg_attachment: theme.attachment,
        }).then((result: SeriesDetailsDbSyncResult) => {
          if (result.ok) {
            setNotice(
              url.trim()
                ? 'Custom series background saved.'
                : 'Series background cleared (using global/cover/fallback).'
            );
            return;
          }
          setNotice(`Background saved locally, but database sync failed: ${result.error ?? 'unknown error'}`);
        });
      }
    } else {
      setGlobalSeriesDetailsBackground(url.trim() || null);
      setGlobalSeriesDetailsBgTheme(theme);
      setNotice(url.trim() ? 'Global manga-details background saved.' : 'Global background reset to cover/fallback chain.');
    }
    onChanged?.();
  };

  const reset = () => {
    if (isSeries && seriesId) {
      clearSeriesDetailsBackgroundOverride(seriesId);
      clearSeriesDetailsBgThemeOverride(seriesId);
      setUrl('');
      setTheme(loadTheme(true, seriesId));
      setNotice('Series background and theme reset.');
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, {
          details_background_url: null,
          details_bg_position: null,
          details_bg_overlay_darkness: null,
          details_bg_blur: null,
          details_bg_accent_color: null,
          details_bg_attachment: null,
        });
      }
    } else {
      setGlobalSeriesDetailsBackground(null);
      setGlobalSeriesDetailsBgTheme(DEFAULT_SERIES_DETAILS_BG_THEME);
      setUrl('');
      setTheme({ ...DEFAULT_SERIES_DETAILS_BG_THEME });
      setNotice('Global background reset to built-in defaults.');
    }
    onChanged?.();
  };

  const updateTheme = <K extends keyof SeriesDetailsBgTheme>(key: K, value: SeriesDetailsBgTheme[K]) => {
    setTheme((prev) => ({ ...prev, [key]: value }));
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
          Priority: per-series → global → blurred cover → built-in JPG. Leave empty to use the next fallback.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Image position</Label>
          <Select
            value={theme.position}
            onValueChange={(v) => updateTheme('position', v as SeriesDetailsBgPosition)}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="center">Center</SelectItem>
              <SelectItem value="top">Top</SelectItem>
              <SelectItem value="bottom">Bottom</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Scroll behavior</Label>
          <Select
            value={theme.attachment}
            onValueChange={(v) => updateTheme('attachment', v as SeriesDetailsBgAttachment)}
          >
            <SelectTrigger className="min-h-11">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fixed">Fixed (cinematic)</SelectItem>
              <SelectItem value="scroll">Scroll with page</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor={`overlay-${seriesId || 'global'}`}>Overlay darkness ({theme.overlayDarkness}%)</Label>
          <input
            id={`overlay-${seriesId || 'global'}`}
            type="range"
            min={40}
            max={95}
            value={theme.overlayDarkness}
            onChange={(e) => updateTheme('overlayDarkness', Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`blur-${seriesId || 'global'}`}>Blur ({theme.blur}px)</Label>
          <input
            id={`blur-${seriesId || 'global'}`}
            type="range"
            min={0}
            max={12}
            value={theme.blur}
            onChange={(e) => updateTheme('blur', Number(e.target.value))}
            className="w-full accent-primary"
          />
        </div>
        <div className="space-y-2 sm:col-span-2">
          <Label htmlFor={`accent-${seriesId || 'global'}`}>Accent tint (optional)</Label>
          <Input
            id={`accent-${seriesId || 'global'}`}
            type="color"
            value={theme.accentColor || '#dc2626'}
            onChange={(e) => updateTheme('accentColor', e.target.value)}
            className="min-h-11 h-11 w-full max-w-[120px] p-1"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border/40 bg-muted/20">
        <div className="relative h-28 sm:h-36">
          <img
            src={preview.url}
            alt=""
            className="h-full w-full object-cover scale-105"
            style={{ filter: theme.blur > 0 ? `blur(${theme.blur}px)` : undefined }}
            loading="lazy"
            decoding="async"
          />
          <div
            className="absolute inset-0 bg-background"
            style={{ opacity: theme.overlayDarkness / 100 }}
          />
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


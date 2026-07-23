import { useMemo, useState } from 'react';
import { Monitor, Moon, RotateCcw, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import {
  clearSeriesAppearanceOverride,
  getGlobalAppearanceMode,
  getSeriesAppearanceOverride,
  resolveAppearanceMode,
  setGlobalAppearanceMode,
  setSeriesAppearanceOverride,
  APPEARANCE_DEFAULT,
  type AppearanceMode,
} from '@/features/appearance/appearanceMode';
import {
  canSyncSeriesDetailsOverrideToDb,
  syncSeriesDetailsOverrideToDb,
  type SeriesDetailsDbSyncResult,
} from '@/features/series/seriesDetailsAdminSync';

const MODES: Array<{ id: AppearanceMode; label: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Light', icon: Sun },
  { id: 'dark', label: 'Dark', icon: Moon },
  { id: 'system', label: 'System', icon: Monitor },
];

interface SeriesAppearanceControlsProps {
  /** When set, edits a per-series appearance override; otherwise edits the global default. */
  seriesId?: string;
  seriesTitle?: string;
  onChanged?: () => void;
  compact?: boolean;
  /** Controlled mode for Series Design page draft. */
  mode?: AppearanceMode;
  onModeChange?: (mode: AppearanceMode) => void;
  hideActions?: boolean;
}

/**
 * Admin appearance control for Light / Dark / System.
 * Global default lives here; per-series override (when `seriesId` is set) can
 * follow the global value ("Use global appearance") or pin its own mode.
 * Resolution: series override → global appearance → system/default.
 */
export function SeriesAppearanceControls({
  seriesId,
  seriesTitle,
  onChanged,
  compact,
  mode: controlledMode,
  onModeChange,
  hideActions,
}: SeriesAppearanceControlsProps) {
  const isSeries = Boolean(seriesId);
  const isControlled = controlledMode !== undefined && onModeChange !== undefined;
  const [useGlobal, setUseGlobal] = useState(() =>
    isSeries && seriesId ? !getSeriesAppearanceOverride(seriesId) : false
  );
  const [internalMode, setInternalMode] = useState<AppearanceMode>(() =>
    isSeries && seriesId
      ? getSeriesAppearanceOverride(seriesId) || getGlobalAppearanceMode()
      : getGlobalAppearanceMode()
  );
  const mode = isControlled ? controlledMode : internalMode;
  const setMode = isControlled ? onModeChange : setInternalMode;
  const [notice, setNotice] = useState<string | null>(null);

  const previewResolved = useMemo(
    () => (isSeries && seriesId ? resolveAppearanceMode(seriesId) : mode),
    [isSeries, seriesId, mode]
  );

  const save = () => {
    if (isSeries && seriesId) {
      const override = useGlobal ? null : mode;
      setSeriesAppearanceOverride(seriesId, override);
      setNotice(
        useGlobal
          ? `${seriesTitle || 'This series'} now follows the global appearance (local preview).`
          : `Appearance saved for ${seriesTitle || 'this series'} (local preview).`
      );
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, { appearance_override: override }).then(
          (result: SeriesDetailsDbSyncResult) => {
            if (result.ok) {
              setNotice(
                useGlobal
                  ? `${seriesTitle || 'This series'} now follows the global appearance.`
                  : `Appearance saved for ${seriesTitle || 'this series'}.`
              );
              return;
            }
            setNotice(`Appearance saved locally, but database sync failed: ${result.error ?? 'unknown error'}`);
          }
        );
      }
    } else {
      setGlobalAppearanceMode(mode);
      setNotice('Global appearance saved.');
    }
    onChanged?.();
  };

  const reset = () => {
    if (isSeries && seriesId) {
      clearSeriesAppearanceOverride(seriesId);
      setUseGlobal(true);
      setMode(getGlobalAppearanceMode());
      setNotice('Series appearance override cleared — using global appearance.');
      if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
        void syncSeriesDetailsOverrideToDb(seriesId, { appearance_override: null });
      }
    } else {
      setGlobalAppearanceMode(null);
      setMode(APPEARANCE_DEFAULT);
      setNotice('Global appearance reset to default (Dark).');
    }
    onChanged?.();
  };

  return (
    <div className={compact ? 'space-y-3' : 'space-y-4'}>
      <div className="flex items-center gap-2">
        <Sun className="h-4 w-4 text-primary" aria-hidden />
        <Label className="text-sm font-semibold">
          {isSeries ? `Appearance for ${seriesTitle || 'this series'}` : 'Global appearance'}
        </Label>
      </div>
      <p className="text-xs text-muted-foreground">
        Resolution: series override → global appearance → system/default. Currently active:{' '}
        <strong className="capitalize">{previewResolved}</strong>
      </p>

      {isSeries && (
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={useGlobal}
            onChange={(e) => {
              setUseGlobal(e.target.checked);
              if (e.target.checked) setMode(getGlobalAppearanceMode());
            }}
            className="h-4 w-4 accent-primary"
          />
          Use global appearance
        </label>
      )}

      <div className={cn('grid gap-2', isSeries && useGlobal && 'pointer-events-none opacity-50')}>
        <div className="flex flex-wrap gap-2">
          {MODES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => {
                setMode(id);
                if (isSeries) setUseGlobal(false);
              }}
              aria-pressed={mode === id && !(isSeries && useGlobal)}
              className={cn(
                'flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium transition-colors',
                mode === id && !(isSeries && useGlobal)
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border/40 bg-card/50 hover:border-primary/30'
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {!hideActions && (
        <div className="flex flex-wrap gap-2">
          <Button type="button" className="min-h-11" onClick={save}>
            Save appearance
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

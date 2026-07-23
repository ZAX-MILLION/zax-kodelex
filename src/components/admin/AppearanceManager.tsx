import { useMemo, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, Monitor, Moon, Palette, RotateCcw, Save, Sun } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { appConfig } from '@/config/env';
import { SeriesAppearanceControls } from '@/components/series/SeriesAppearanceControls';
import { SeriesDesignLivePreview } from './SeriesDesignLivePreview';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';
import { getSamplePreviewSeriesId, readGlobalSeriesDesignDraft } from '@/features/series/seriesDesignAdmin';
import {
  APPEARANCE_DEFAULT,
  getGlobalAppearanceMode,
  getSeriesAppearanceOverride,
  setGlobalAppearanceMode,
  type AppearanceMode,
} from '@/features/appearance/appearanceMode';

const MODES: Array<{ id: AppearanceMode; label: string; description: string; icon: typeof Sun }> = [
  { id: 'light', label: 'Light', description: 'Bright surfaces, dark text. Best for well-lit rooms.', icon: Sun },
  { id: 'dark', label: 'Dark', description: 'The ZAX Million signature look. Easier on the eyes at night.', icon: Moon },
  { id: 'system', label: 'System', description: "Follows each reader's device setting automatically.", icon: Monitor },
];

interface SeriesOption {
  id: string;
  title: string;
}

export function AppearanceManager() {
  const { toast } = useToast();
  const [mode, setMode] = useState<AppearanceMode>(() => getGlobalAppearanceMode());
  const [savedMode, setSavedMode] = useState<AppearanceMode>(() => getGlobalAppearanceMode());
  const [notice, setNotice] = useState<string | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);

  const seriesOptions: SeriesOption[] = useMemo(
    () => getFeaturedDemoSeries().map((s) => ({ id: s.id, title: s.title })),
    []
  );
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(() => seriesOptions[0]?.id || '');
  const selectedSeries = seriesOptions.find((s) => s.id === selectedSeriesId);
  const [overrideTick, setOverrideTick] = useState(0);
  const hasSeriesOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(getSeriesAppearanceOverride(selectedSeriesId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, overrideTick]);

  const isDirty = mode !== savedMode;
  const previewSeriesId = getSamplePreviewSeriesId();
  const previewPath = `${appConfig.basePath}/series/${previewSeriesId}`.replace(/\/+/g, '/');
  const previewDraft = useMemo(() => ({ ...readGlobalSeriesDesignDraft(), appearance: mode }), [mode]);

  const handleSave = () => {
    setGlobalAppearanceMode(mode);
    setSavedMode(mode);
    setNotice('Global appearance saved for all pages.');
    toast({ title: 'Appearance saved', description: 'Global Light / Dark / System preference updated.' });
  };

  const handleConfirmedReset = () => {
    setGlobalAppearanceMode(null);
    setMode(APPEARANCE_DEFAULT);
    setSavedMode(APPEARANCE_DEFAULT);
    setNotice('Reset to the built-in default (Dark).');
    toast({ title: 'Reset complete', description: 'Global appearance restored to Dark.' });
    setConfirmResetOpen(false);
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <Palette className="h-6 w-6 text-primary" />
            Appearance
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Set the site-wide color scheme readers see by default. Looking for layout or
            backgrounds?{' '}
            <Link to="/admin/series-design" className="text-primary underline">
              Series Design
            </Link>{' '}
            ·{' '}
            <Link to="/admin/backgrounds" className="text-primary underline">
              Backgrounds
            </Link>
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          {isDirty ? (
            <span className="flex items-center gap-1.5 whitespace-nowrap text-amber-500">
              <AlertTriangle className="h-4 w-4" aria-hidden />
              Unsaved changes
            </span>
          ) : (
            <span className="whitespace-nowrap text-muted-foreground">All changes saved</span>
          )}
        </div>
      </div>

      {notice && (
        <p className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm" role="status">
          {notice}
        </p>
      )}

      {/* ---- Global mode ---- */}
      <section className="space-y-4" aria-labelledby="global-appearance-heading">
        <div>
          <h2 id="global-appearance-heading" className="text-lg font-semibold text-foreground">
            Global default
          </h2>
          <p className="text-sm text-muted-foreground">
            Applied everywhere unless a series below has its own override.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {MODES.map(({ id, label, description, icon: Icon }) => {
            const selected = mode === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => setMode(id)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col gap-4 rounded-2xl border-2 p-6 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-card hover:border-primary/30 hover:bg-accent/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={cn(
                      'inline-flex h-12 w-12 items-center justify-center rounded-xl',
                      selected ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                    )}
                  >
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  {selected && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </div>
                <div>
                  <p className="text-lg font-semibold text-foreground">{label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </button>
            );
          })}
        </div>
        <p className="text-xs text-muted-foreground">
          Accent color and surface density are not yet configurable — this build only ships
          Light / Dark / System, matching what the live site actually supports.
        </p>
      </section>

      {/* ---- Live preview ---- */}
      <section className="space-y-4" aria-labelledby="appearance-preview-heading">
        <div>
          <h2 id="appearance-preview-heading" className="text-lg font-semibold text-foreground">
            Live component preview
          </h2>
          <p className="text-sm text-muted-foreground">
            Unsaved preview using the current global layout and background —{' '}
            <Link to={previewPath} className="text-primary underline" target="_blank">
              open full page
            </Link>
          </p>
        </div>
        <SeriesDesignLivePreview draft={previewDraft} />
      </section>

      {/* ---- Per-series override ---- */}
      <section className="space-y-4" aria-labelledby="appearance-per-series-heading">
        <div>
          <h2 id="appearance-per-series-heading" className="text-lg font-semibold text-foreground">
            Per-series override
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick one series to pin its own appearance, independent of the global default above.
          </p>
        </div>

        <Card>
          <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 items-center gap-3">
              <Select value={selectedSeriesId} onValueChange={setSelectedSeriesId}>
                <SelectTrigger className="min-h-11 max-w-sm" aria-label="Choose a series to override">
                  <SelectValue placeholder="Choose a series" />
                </SelectTrigger>
                <SelectContent>
                  {seriesOptions.map((option) => (
                    <SelectItem key={option.id} value={option.id}>
                      {option.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {hasSeriesOverride ? (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Has override
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Using global default
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {selectedSeriesId && (
              <SeriesAppearanceControls
                key={selectedSeriesId}
                seriesId={selectedSeriesId}
                seriesTitle={selectedSeries?.title}
                onChanged={() => setOverrideTick((n) => n + 1)}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* ---- Sticky actions ---- */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 lg:-mx-6">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
          <div className="flex items-center gap-2 text-sm">
            {isDirty ? (
              <span className="flex items-center gap-1.5 text-amber-500">
                <AlertTriangle className="h-4 w-4" aria-hidden />
                Unsaved changes
              </span>
            ) : (
              <span className="text-muted-foreground">All changes saved</span>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-11 gap-2" asChild>
              <Link to={previewPath} target="_blank">
                <ExternalLink className="h-4 w-4" />
                Preview series page
              </Link>
            </Button>
            <Button type="button" className="min-h-11 gap-2" onClick={handleSave} disabled={!isDirty}>
              <Save className="h-4 w-4" />
              Save changes
            </Button>
            <AlertDialog open={confirmResetOpen} onOpenChange={setConfirmResetOpen}>
              <Button
                type="button"
                variant="outline"
                className="min-h-11 gap-2"
                onClick={() => setConfirmResetOpen(true)}
              >
                <RotateCcw className="h-4 w-4" />
                Reset to default
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset global appearance?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This restores the built-in default (Dark) for every page that doesn&apos;t
                    already have its own series override. This can&apos;t be undone automatically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmedReset}>Reset to default</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ExternalLink, Laptop, LayoutGrid, Moon, Palette, RotateCcw, Save, Smartphone, Sun, Wallpaper } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { appConfig } from '@/config/env';
import { supabase } from '@/integrations/supabase/client';
import { SeriesDetailsLayoutControls } from '@/components/series/SeriesDetailsLayoutControls';
import { SeriesAppearanceControls } from '@/components/series/SeriesAppearanceControls';
import { SeriesDetailsBackgroundControls } from '@/components/series/SeriesDetailsBackgroundControls';
import { SeriesDesignLivePreview } from './SeriesDesignLivePreview';
import { SeriesDesignOverridePanel } from './SeriesDesignOverridePanel';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';
import {
  getSamplePreviewSeriesId,
  readGlobalSeriesDesignDraft,
  resetGlobalSeriesDesign,
  saveGlobalSeriesDesign,
  type GlobalSeriesDesignDraft,
} from '@/features/series/seriesDesignAdmin';
import {
  clearSeriesDetailsLayoutOverride,
  getSeriesDetailsLayoutOverride,
} from '@/features/series/seriesDetailsLayout';
import { getSeriesAppearanceOverride, clearSeriesAppearanceOverride } from '@/features/appearance/appearanceMode';
import { getSeriesDetailsBackgroundOverride, clearSeriesDetailsBackgroundOverride } from '@/features/series/seriesDetailsBackground';

interface SeriesOption {
  id: string;
  title: string;
}

function useSeriesOptions(): { options: SeriesOption[]; loading: boolean } {
  const [options, setOptions] = useState<SeriesOption[]>(() =>
    getFeaturedDemoSeries().map((s) => ({ id: s.id, title: s.title }))
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!appConfig.hasSupabase) return;
    let cancelled = false;
    setLoading(true);
    supabase
      .from('manga_meta')
      .select('id, title')
      .order('title', { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return;
        setLoading(false);
        if (error || !data || data.length === 0) return;
        setOptions(data as SeriesOption[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options, loading };
}

export function SeriesDesignManager() {
  const { toast } = useToast();
  const location = useLocation();
  const [draft, setDraft] = useState<GlobalSeriesDesignDraft>(() => readGlobalSeriesDesignDraft());
  const [savedDraft, setSavedDraft] = useState<GlobalSeriesDesignDraft>(() => readGlobalSeriesDesignDraft());
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
  const [previewScheme, setPreviewScheme] = useState<'light' | 'dark'>(draft.appearance === 'light' ? 'light' : 'dark');
  const [previewViewport, setPreviewViewport] = useState<'desktop' | 'mobile'>('desktop');

  const { options: seriesOptions } = useSeriesOptions();
  const previewSeriesId = getSamplePreviewSeriesId();
  const previewPath = `${appConfig.basePath}/series/${previewSeriesId}`.replace(/\/+/g, '/');

  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(() => seriesOptions[0]?.id || previewSeriesId);
  useEffect(() => {
    if (!selectedSeriesId && seriesOptions[0]) setSelectedSeriesId(seriesOptions[0].id);
  }, [seriesOptions, selectedSeriesId]);
  const selectedSeries = seriesOptions.find((s) => s.id === selectedSeriesId);
  const [overrideTick, setOverrideTick] = useState(0);

  const hasAnyOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(
      getSeriesDetailsLayoutOverride(selectedSeriesId) ||
        getSeriesAppearanceOverride(selectedSeriesId) ||
        getSeriesDetailsBackgroundOverride(selectedSeriesId)
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, overrideTick]);

  // Deep-link support for /admin/series-design#appearance and #backgrounds
  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.slice(1);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [location.hash]);

  const isDirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(savedDraft), [draft, savedDraft]);

  const updateDraft = useCallback((patch: Partial<GlobalSeriesDesignDraft>) => {
    setDraft((prev) => {
      const next = { ...prev, ...patch };
      if (patch.appearance) setPreviewScheme(patch.appearance === 'light' ? 'light' : 'dark');
      return next;
    });
  }, []);

  const handleSave = () => {
    saveGlobalSeriesDesign(draft);
    setSavedDraft(draft);
    setNotice({ message: 'Global series design saved for all series pages.', tone: 'success' });
    toast({ title: 'Series design saved', description: 'Global defaults updated for all series pages.' });
  };

  const handleConfirmedReset = () => {
    try {
      const defaults = resetGlobalSeriesDesign();
      setDraft(defaults);
      setSavedDraft(defaults);
      setPreviewScheme(defaults.appearance === 'light' ? 'light' : 'dark');
      setNotice({ message: 'Reset to built-in defaults (Editorial layout, Dark appearance).', tone: 'success' });
      toast({ title: 'Reset complete', description: 'Global series design restored to defaults.' });
    } catch (error) {
      setNotice({ message: 'Reset failed. Please try again.', tone: 'error' });
    } finally {
      setConfirmResetOpen(false);
    }
  };

  const handlePreviewPage = () => {
    saveGlobalSeriesDesign(draft);
    setSavedDraft(draft);
    window.open(previewPath, '_blank', 'noopener,noreferrer');
    setNotice({ message: 'Draft applied and saved so the preview tab matches your choices.', tone: 'success' });
  };

  const handleResetSeriesOverrides = () => {
    if (!selectedSeriesId) return;
    clearSeriesDetailsLayoutOverride(selectedSeriesId);
    clearSeriesAppearanceOverride(selectedSeriesId);
    clearSeriesDetailsBackgroundOverride(selectedSeriesId);
    setOverrideTick((n) => n + 1);
    toast({
      title: 'Overrides cleared',
      description: `${selectedSeries?.title || 'This series'} now follows the global defaults.`,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground">
          <LayoutGrid className="h-6 w-6 text-primary" />
          Series Design
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Set the default layout, appearance, and background used by every series details page,
          preview changes live, and override any individual series.
        </p>
      </div>

      {notice && (
        <p
          className={
            notice.tone === 'success'
              ? 'rounded-lg border border-primary/30 bg-primary/10 px-4 py-3 text-sm'
              : 'rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive'
          }
          role="status"
        >
          {notice.message}
        </p>
      )}

      {/* ---- Global defaults ---- */}
      <section id="global-defaults" className="space-y-6" aria-labelledby="global-defaults-heading">
        <div>
          <h2 id="global-defaults-heading" className="text-lg font-semibold text-foreground">
            Global defaults
          </h2>
          <p className="text-sm text-muted-foreground">
            Applied to every series page unless a series has its own override below.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="text-foreground">Layout</CardTitle>
              <CardDescription>A Editorial · B Cinematic · C Compact · D Compact List</CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesDetailsLayoutControls
                layout={draft.layout}
                onLayoutChange={(layout) => updateDraft({ layout })}
                hideActions
              />
            </CardContent>
          </Card>

          <Card id="appearance">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
              <CardDescription>Light, Dark, or System for all series pages</CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesAppearanceControls
                mode={draft.appearance}
                onModeChange={(appearance) => updateDraft({ appearance })}
                hideActions
              />
            </CardContent>
          </Card>

          <Card id="backgrounds" className="xl:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Wallpaper className="h-4 w-4" />
                Background
              </CardTitle>
              <CardDescription>Global default image, overlay darkness, blur, and accent tint</CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesDetailsBackgroundControls
                url={draft.backgroundUrl}
                theme={draft.backgroundTheme}
                onUrlChange={(backgroundUrl) => updateDraft({ backgroundUrl })}
                onThemeChange={(backgroundTheme) => updateDraft({ backgroundTheme })}
                hideActions
              />
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ---- Preview ---- */}
      <section id="preview" className="space-y-4" aria-labelledby="preview-heading">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="preview-heading" className="text-lg font-semibold text-foreground">
              Preview
            </h2>
            <p className="text-sm text-muted-foreground">
              Live, unsaved preview —{' '}
              <Link to={previewPath} className="text-primary underline" target="_blank">
                open full page
              </Link>
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
              <Button
                type="button"
                size="sm"
                variant={previewScheme === 'light' ? 'default' : 'ghost'}
                onClick={() => setPreviewScheme('light')}
                aria-pressed={previewScheme === 'light'}
                aria-label="Preview in light mode"
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewScheme === 'dark' ? 'default' : 'ghost'}
                onClick={() => setPreviewScheme('dark')}
                aria-pressed={previewScheme === 'dark'}
                aria-label="Preview in dark mode"
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
              <Button
                type="button"
                size="sm"
                variant={previewViewport === 'desktop' ? 'default' : 'ghost'}
                onClick={() => setPreviewViewport('desktop')}
                aria-pressed={previewViewport === 'desktop'}
                aria-label="Preview desktop width"
              >
                <Laptop className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant={previewViewport === 'mobile' ? 'default' : 'ghost'}
                onClick={() => setPreviewViewport('mobile')}
                aria-pressed={previewViewport === 'mobile'}
                aria-label="Preview mobile width"
              >
                <Smartphone className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <SeriesDesignLivePreview
          draft={{ ...draft, appearance: previewScheme }}
          viewport={previewViewport}
        />
      </section>

      {/* ---- Per-series overrides ---- */}
      <section id="per-series-overrides" className="space-y-4" aria-labelledby="overrides-heading">
        <div>
          <h2 id="overrides-heading" className="text-lg font-semibold text-foreground">
            Per-series overrides
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick a series to override its layout, appearance, or background independently of the
            global defaults above.
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
              {hasAnyOverride ? (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Has overrides
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Using global defaults
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!hasAnyOverride}
              onClick={handleResetSeriesOverrides}
            >
              <RotateCcw className="h-4 w-4" />
              Reset this series
            </Button>
          </CardHeader>
          <CardContent>
            {selectedSeriesId && (
              <SeriesDesignOverridePanel
                key={selectedSeriesId}
                seriesId={selectedSeriesId}
                seriesTitle={selectedSeries?.title || 'Selected series'}
              />
            )}
          </CardContent>
        </Card>
      </section>

      {/* ---- Sticky actions ---- */}
      <div className="sticky bottom-0 z-30 -mx-4 -mb-6 border-t border-border bg-background/95 backdrop-blur-xl supports-[backdrop-filter]:bg-background/80 lg:-mx-6">
        <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between lg:px-6">
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
            <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={handlePreviewPage}>
              <ExternalLink className="h-4 w-4" />
              Preview series page
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
                Reset section
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset global series design?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This restores the built-in defaults (Editorial layout, Dark appearance, no
                    custom background) for every series page that doesn't already have its own
                    override. This can't be undone automatically.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleConfirmedReset}>Reset to defaults</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>
    </div>
  );
}

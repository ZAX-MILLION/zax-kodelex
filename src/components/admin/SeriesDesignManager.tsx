import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, Check, ExternalLink, Laptop, LayoutGrid, RotateCcw, Save, Smartphone } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { SeriesLayoutThumbnail } from '@/components/series/SeriesLayoutThumbnail';
import { SeriesDesignLivePreview } from './SeriesDesignLivePreview';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';
import {
  getSamplePreviewSeriesId,
  readGlobalSeriesDesignDraft,
  saveGlobalSeriesDesign,
  type GlobalSeriesDesignDraft,
} from '@/features/series/seriesDesignAdmin';
import {
  clearSeriesDetailsLayoutOverride,
  getGlobalSeriesDetailsLayout,
  getSeriesDetailsLayoutOverride,
  setGlobalSeriesDetailsLayout,
  setSeriesDetailsLayoutOverride,
  SERIES_DETAILS_LAYOUT_DEFAULT,
  SERIES_DETAILS_LAYOUT_META,
  type SeriesDetailsLayoutId,
} from '@/features/series/seriesDetailsLayout';
import {
  canSyncSeriesDetailsOverrideToDb,
  syncSeriesDetailsOverrideToDb,
} from '@/features/series/seriesDetailsAdminSync';

const LAYOUT_IDS: SeriesDetailsLayoutId[] = ['A', 'B', 'C', 'D'];

interface SeriesOption {
  id: string;
  title: string;
}

function useSeriesOptions(): { options: SeriesOption[] } {
  const [options, setOptions] = useState<SeriesOption[]>(() =>
    getFeaturedDemoSeries().map((s) => ({ id: s.id, title: s.title }))
  );

  useEffect(() => {
    if (!appConfig.hasSupabase) return;
    let cancelled = false;
    supabase
      .from('manga_meta')
      .select('id, title')
      .order('title', { ascending: true })
      .limit(200)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error || !data || data.length === 0) return;
        setOptions(data as SeriesOption[]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { options };
}

export function SeriesDesignManager() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<GlobalSeriesDesignDraft>(() => readGlobalSeriesDesignDraft());
  const [savedDraft, setSavedDraft] = useState<GlobalSeriesDesignDraft>(() => readGlobalSeriesDesignDraft());
  const [notice, setNotice] = useState<{ message: string; tone: 'success' | 'error' } | null>(null);
  const [confirmResetOpen, setConfirmResetOpen] = useState(false);
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
  const [seriesLayout, setSeriesLayout] = useState<SeriesDetailsLayoutId>(SERIES_DETAILS_LAYOUT_DEFAULT);

  useEffect(() => {
    if (!selectedSeriesId) return;
    const override = getSeriesDetailsLayoutOverride(selectedSeriesId);
    setSeriesLayout(override || getGlobalSeriesDetailsLayout() || SERIES_DETAILS_LAYOUT_DEFAULT);
  }, [selectedSeriesId, overrideTick]);

  const hasLayoutOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(getSeriesDetailsLayoutOverride(selectedSeriesId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, overrideTick]);

  const isDirty = useMemo(() => draft.layout !== savedDraft.layout, [draft, savedDraft]);

  const updateLayout = useCallback((layout: SeriesDetailsLayoutId) => {
    setDraft((prev) => ({ ...prev, layout }));
  }, []);

  const handleSave = () => {
    saveGlobalSeriesDesign(draft);
    setGlobalSeriesDetailsLayout(draft.layout);
    setSavedDraft(draft);
    setNotice({ message: 'Global layout saved for all series pages.', tone: 'success' });
    toast({ title: 'Series design saved', description: 'Global default layout updated for all series pages.' });
  };

  const handleConfirmedReset = () => {
    setGlobalSeriesDetailsLayout(null);
    const next = { ...draft, layout: SERIES_DETAILS_LAYOUT_DEFAULT };
    setDraft(next);
    setSavedDraft(next);
    setNotice({ message: 'Reset to the built-in default (Layout A — Editorial).', tone: 'success' });
    toast({ title: 'Reset complete', description: 'Global layout restored to Editorial (A).' });
    setConfirmResetOpen(false);
  };

  const handlePreviewPage = () => {
    saveGlobalSeriesDesign(draft);
    setSavedDraft(draft);
    window.open(previewPath, '_blank', 'noopener,noreferrer');
    setNotice({ message: 'Draft applied and saved so the preview tab matches your choice.', tone: 'success' });
  };

  const saveSeriesLayout = () => {
    if (!selectedSeriesId) return;
    setSeriesDetailsLayoutOverride(selectedSeriesId, seriesLayout);
    setOverrideTick((n) => n + 1);
    toast({ title: 'Layout saved', description: `${selectedSeries?.title || 'This series'} now uses ${SERIES_DETAILS_LAYOUT_META[seriesLayout].label}.` });
    if (canSyncSeriesDetailsOverrideToDb(selectedSeriesId)) {
      void syncSeriesDetailsOverrideToDb(selectedSeriesId, { details_layout_override: seriesLayout });
    }
  };

  const resetSeriesLayout = () => {
    if (!selectedSeriesId) return;
    clearSeriesDetailsLayoutOverride(selectedSeriesId);
    setOverrideTick((n) => n + 1);
    toast({
      title: 'Override cleared',
      description: `${selectedSeries?.title || 'This series'} now follows the global layout.`,
    });
    if (canSyncSeriesDetailsOverrideToDb(selectedSeriesId)) {
      void syncSeriesDetailsOverrideToDb(selectedSeriesId, { details_layout_override: null });
    }
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Series Design
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Choose the default layout used by every series details page, preview it live, and
            override any individual series. Looking for appearance or backgrounds?{' '}
            <Link to="/admin/appearance" className="text-primary underline">
              Appearance
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

      {/* ---- Global default layout ---- */}
      <section className="space-y-4" aria-labelledby="global-layout-heading">
        <div>
          <h2 id="global-layout-heading" className="text-lg font-semibold text-foreground">
            Global default layout
          </h2>
          <p className="text-sm text-muted-foreground">
            Applied to every series page unless a series below has its own override.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {LAYOUT_IDS.map((id) => {
            const meta = SERIES_DETAILS_LAYOUT_META[id];
            const selected = draft.layout === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => updateLayout(id)}
                aria-pressed={selected}
                className={cn(
                  'flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all',
                  selected
                    ? 'border-primary bg-primary/5 shadow-sm'
                    : 'border-border/50 bg-card hover:border-primary/30 hover:bg-accent/30'
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {id}
                  </span>
                  {selected && (
                    <Badge className="gap-1 bg-primary text-primary-foreground">
                      <Check className="h-3 w-3" />
                      Selected
                    </Badge>
                  )}
                </div>
                <SeriesLayoutThumbnail layoutId={id} selected={selected} />
                <div>
                  <p className="text-base font-semibold text-foreground">{meta.label}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{meta.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- Preview ---- */}
      <section className="space-y-4" aria-labelledby="preview-heading">
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
        <SeriesDesignLivePreview draft={draft} viewport={previewViewport} />
      </section>

      {/* ---- Per-series layout override ---- */}
      <section className="space-y-4" aria-labelledby="per-series-heading">
        <div>
          <h2 id="per-series-heading" className="text-lg font-semibold text-foreground">
            Per-series layout override
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick one series to give it its own layout, independent of the global default above.
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
              {hasLayoutOverride ? (
                <Badge variant="outline" className="border-primary/40 text-primary">
                  Has override
                </Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Using global default
                </Badge>
              )}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="gap-2"
              disabled={!hasLayoutOverride}
              onClick={resetSeriesLayout}
            >
              <RotateCcw className="h-4 w-4" />
              Reset this series
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {LAYOUT_IDS.map((id) => {
                const meta = SERIES_DETAILS_LAYOUT_META[id];
                const selected = seriesLayout === id;
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setSeriesLayout(id)}
                    aria-pressed={selected}
                    className={cn(
                      'flex flex-col gap-2 rounded-xl border p-3 text-left transition-colors',
                      selected ? 'border-primary bg-primary/5' : 'border-border/40 bg-card/50 hover:border-primary/30'
                    )}
                  >
                    <SeriesLayoutThumbnail layoutId={id} selected={selected} />
                    <p className="text-xs font-semibold">{meta.label}</p>
                  </button>
                );
              })}
            </div>
            <Button type="button" className="min-h-11" onClick={saveSeriesLayout}>
              <Save className="mr-2 h-4 w-4" />
              Save layout for {selectedSeries?.title || 'this series'}
            </Button>
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
                Reset to default
              </Button>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset global layout?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This restores the built-in default (Layout A — Editorial) for every series page
                    that doesn&apos;t already have its own override. This can&apos;t be undone
                    automatically.
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

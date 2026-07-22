import { useCallback, useState } from 'react';
import { ExternalLink, Eye, LayoutGrid, Palette, RotateCcw, Save } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { appConfig } from '@/config/env';
import { SeriesDetailsLayoutControls } from '@/components/series/SeriesDetailsLayoutControls';
import { SeriesAppearanceControls } from '@/components/series/SeriesAppearanceControls';
import { SeriesDetailsBackgroundControls } from '@/components/series/SeriesDetailsBackgroundControls';
import { SeriesDesignLivePreview } from './SeriesDesignLivePreview';
import {
  getSamplePreviewSeriesId,
  readGlobalSeriesDesignDraft,
  resetGlobalSeriesDesign,
  saveGlobalSeriesDesign,
  type GlobalSeriesDesignDraft,
} from '@/features/series/seriesDesignAdmin';

export function SeriesDesignManager() {
  const { toast } = useToast();
  const [draft, setDraft] = useState<GlobalSeriesDesignDraft>(() => readGlobalSeriesDesignDraft());
  const [notice, setNotice] = useState<string | null>(null);
  const previewSeriesId = getSamplePreviewSeriesId();
  const previewPath = `${appConfig.basePath}/series/${previewSeriesId}`.replace(/\/+/g, '/');

  const updateDraft = useCallback((patch: Partial<GlobalSeriesDesignDraft>) => {
    setDraft((prev) => ({ ...prev, ...patch }));
  }, []);

  const handleSave = () => {
    saveGlobalSeriesDesign(draft);
    setNotice('Global series design saved.');
    toast({ title: 'Series design saved', description: 'Global defaults updated for all series pages.' });
  };

  const handleReset = () => {
    const defaults = resetGlobalSeriesDesign();
    setDraft(defaults);
    setNotice('Reset to built-in defaults (Editorial layout, Dark appearance).');
    toast({ title: 'Reset complete', description: 'Global series design restored to defaults.' });
  };

  const handlePreviewPage = () => {
    saveGlobalSeriesDesign(draft);
    window.open(previewPath, '_blank', 'noopener,noreferrer');
    setNotice('Draft applied for preview — open tab shows current choices. Click Save to keep or Reset to undo.');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <LayoutGrid className="h-6 w-6 text-primary" />
            Series Design
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Choose the default layout, appearance, and background for every series details page.
            Per-series overrides are available in Series Manager.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={handlePreviewPage}>
            <ExternalLink className="h-4 w-4" />
            Preview Series Page
          </Button>
          <Button type="button" className="min-h-11 gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" />
            Save Changes
          </Button>
          <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={handleReset}>
            <RotateCcw className="h-4 w-4" />
            Reset to Default
          </Button>
        </div>
      </div>

      {notice && (
        <p className="text-sm rounded-lg border border-primary/30 bg-primary/10 px-4 py-3" role="status">
          {notice}
        </p>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Layout</CardTitle>
              <CardDescription>
                A Editorial · B Cinematic · C Compact · D Compact List
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SeriesDetailsLayoutControls
                layout={draft.layout}
                onLayoutChange={(layout) => updateDraft({ layout })}
                hideActions
              />
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
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

          <Card className="bg-slate-900/50 border-slate-800">
            <CardHeader>
              <CardTitle className="text-white">Background</CardTitle>
              <CardDescription>
                Global default image, overlay darkness, blur, and accent tint
              </CardDescription>
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

        <Card className="bg-slate-900/50 border-slate-800 xl:sticky xl:top-20 h-fit">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="h-4 w-4" />
              Live preview
            </CardTitle>
            <CardDescription>
              Sample series before saving —{' '}
              <Link to={previewPath} className="text-primary hover:underline" target="_blank">
                open full page
              </Link>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <SeriesDesignLivePreview draft={draft} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

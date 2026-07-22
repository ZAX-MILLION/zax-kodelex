import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ExternalLink, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { SeriesLayoutThumbnail } from '@/components/series/SeriesLayoutThumbnail';
import {
  SERIES_DETAILS_LAYOUT_META,
  setSeriesDetailsLayoutOverride,
  type SeriesDetailsLayoutId,
} from '@/features/series/seriesDetailsLayout';
import { getSamplePreviewSeriesId } from '@/features/series/seriesDesignAdmin';
import {
  applyEffectiveScheme,
  getGlobalAppearanceMode,
  resolveEffectiveScheme,
  type EffectiveScheme,
} from '@/features/appearance/appearanceMode';
import { appConfig } from '@/config/env';

const LAYOUT_IDS: SeriesDetailsLayoutId[] = ['A', 'B', 'C', 'D'];

/**
 * Public demo comparison page — four series-details layouts side by side on
 * the same sample series, with a Light/Dark preview switch. "Open full page"
 * sets a local (localStorage) demo override for that layout and navigates to
 * the real series page — zero Supabase requests either way.
 */
const DemoStylesCompare = () => {
  const sampleSeriesId = getSamplePreviewSeriesId();
  const previewPath = `${appConfig.basePath}/series/${sampleSeriesId}`.replace(/\/+/g, '/');
  const [scheme, setScheme] = useState<EffectiveScheme>(() => resolveEffectiveScheme(getGlobalAppearanceMode()));

  useEffect(() => {
    return () => {
      applyEffectiveScheme(resolveEffectiveScheme(getGlobalAppearanceMode()));
    };
  }, []);

  const applyPreviewScheme = (next: EffectiveScheme) => {
    setScheme(next);
    applyEffectiveScheme(next);
  };

  const openFullPage = (layout: SeriesDetailsLayoutId) => {
    setSeriesDetailsLayoutOverride(sampleSeriesId, layout);
    window.open(previewPath, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <EnhancedSEOHelmet title="Compare demo layouts" noindex />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground sm:text-3xl">Compare series layouts</h1>
          <p className="text-sm text-muted-foreground">
            Demo preview only — the same sample series in all four layouts. No account or purchase
            data is changed.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" asChild className="min-h-11">
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Return to website
            </Link>
          </Button>
          <div className="flex items-center gap-1 rounded-lg border border-border/60 p-1">
            <Button
              type="button"
              size="sm"
              variant={scheme === 'light' ? 'default' : 'ghost'}
              className="gap-2"
              aria-pressed={scheme === 'light'}
              onClick={() => applyPreviewScheme('light')}
            >
              <Sun className="h-4 w-4" />
              Light
            </Button>
            <Button
              type="button"
              size="sm"
              variant={scheme === 'dark' ? 'default' : 'ghost'}
              className="gap-2"
              aria-pressed={scheme === 'dark'}
              onClick={() => applyPreviewScheme('dark')}
            >
              <Moon className="h-4 w-4" />
              Dark
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {LAYOUT_IDS.map((id) => {
          const meta = SERIES_DETAILS_LAYOUT_META[id];
          return (
            <Card key={id}>
              <CardHeader>
                <CardTitle className="text-base">{meta.label}</CardTitle>
                <CardDescription>{meta.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <SeriesLayoutThumbnail layoutId={id} selected={false} />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full min-h-11 gap-2"
                  onClick={() => openFullPage(id)}
                >
                  <ExternalLink className="h-4 w-4" />
                  Open full page
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Opening a full page applies that layout to the sample series in this browser only
        (localStorage) and shows the complete page — chapters and comments included, nothing
        hidden behind tabs.
      </p>
    </div>
  );
};

export default DemoStylesCompare;

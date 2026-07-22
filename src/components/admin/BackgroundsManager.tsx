import { useMemo, useState } from 'react';
import { Wallpaper } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SeriesDetailsBackgroundControls } from '@/components/series/SeriesDetailsBackgroundControls';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';
import { getSeriesDetailsBackgroundOverride } from '@/features/series/seriesDetailsBackground';

interface SeriesOption {
  id: string;
  title: string;
  cover_image_url?: string | null;
}

export function BackgroundsManager() {
  const seriesOptions: SeriesOption[] = useMemo(
    () => getFeaturedDemoSeries().map((s) => ({ id: s.id, title: s.title, cover_image_url: s.cover_image_url })),
    []
  );
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(() => seriesOptions[0]?.id || '');
  const selectedSeries = seriesOptions.find((s) => s.id === selectedSeriesId);
  const [overrideTick, setOverrideTick] = useState(0);
  const hasSeriesOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(getSeriesDetailsBackgroundOverride(selectedSeriesId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, overrideTick]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <Wallpaper className="h-6 w-6 text-primary" />
          Backgrounds
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Set the default series-details background image and theme. Looking for layout or
          appearance?{' '}
          <Link to="/admin/series-design" className="text-primary underline">
            Series Design
          </Link>{' '}
          ·{' '}
          <Link to="/admin/appearance" className="text-primary underline">
            Appearance
          </Link>
        </p>
      </div>

      {/* ---- Global background ---- */}
      <section className="space-y-4" aria-labelledby="global-bg-heading">
        <div>
          <h2 id="global-bg-heading" className="text-lg font-semibold text-foreground">
            Global default
          </h2>
          <p className="text-sm text-muted-foreground">
            Applied to every series page unless a series below has its own override.
          </p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <SeriesDetailsBackgroundControls />
          </CardContent>
        </Card>
      </section>

      {/* ---- Per-series override ---- */}
      <section className="space-y-4" aria-labelledby="bg-per-series-heading">
        <div>
          <h2 id="bg-per-series-heading" className="text-lg font-semibold text-foreground">
            Per-series override
          </h2>
          <p className="text-sm text-muted-foreground">
            Pick one series to give it its own background, independent of the global default above.
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
              <SeriesDetailsBackgroundControls
                key={selectedSeriesId}
                seriesId={selectedSeriesId}
                seriesTitle={selectedSeries?.title}
                coverImageUrl={selectedSeries?.cover_image_url}
                onChanged={() => setOverrideTick((n) => n + 1)}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

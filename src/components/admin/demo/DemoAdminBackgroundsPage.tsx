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

export function DemoAdminBackgroundsPage() {
  const [tick, setTick] = useState(0);
  const seriesOptions = useMemo(() => getFeaturedDemoSeries().slice(0, 6), []);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(() => seriesOptions[0]?.id || '');
  const selectedSeries = seriesOptions.find((s) => s.id === selectedSeriesId);
  const hasOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(getSeriesDetailsBackgroundOverride(selectedSeriesId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, tick]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <Wallpaper className="h-6 w-6 text-primary" />
          Backgrounds (demo)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Same controls as production{' '}
          <Link to="/admin/backgrounds" className="text-primary underline">
            Backgrounds
          </Link>
          , stored in this browser only — nothing reaches a backend.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Global default</h2>
        <Card>
          <CardContent className="pt-6">
            <SeriesDetailsBackgroundControls onChanged={() => setTick((n) => n + 1)} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Per-series override</h2>
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
              {hasOverride ? (
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
                onChanged={() => setTick((n) => n + 1)}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

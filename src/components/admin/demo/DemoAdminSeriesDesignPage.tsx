import { useMemo, useState } from 'react';
import { LayoutGrid } from 'lucide-react';
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
import { SeriesDetailsLayoutControls } from '@/components/series/SeriesDetailsLayoutControls';
import { SeriesDesignLivePreview } from '@/components/admin/SeriesDesignLivePreview';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';
import { readGlobalSeriesDesignDraft } from '@/features/series/seriesDesignAdmin';
import { getSeriesDetailsLayoutOverride } from '@/features/series/seriesDetailsLayout';

export function DemoAdminSeriesDesignPage() {
  const [tick, setTick] = useState(0);
  const seriesOptions = useMemo(() => getFeaturedDemoSeries().slice(0, 6), []);
  const [selectedSeriesId, setSelectedSeriesId] = useState<string>(() => seriesOptions[0]?.id || '');
  const selectedSeries = seriesOptions.find((s) => s.id === selectedSeriesId);
  const hasOverride = useMemo(() => {
    if (!selectedSeriesId) return false;
    return Boolean(getSeriesDetailsLayoutOverride(selectedSeriesId));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSeriesId, tick]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const previewDraft = useMemo(() => readGlobalSeriesDesignDraft(), [tick]);

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold text-foreground sm:text-3xl">
          <LayoutGrid className="h-6 w-6 text-primary" />
          Series Design (demo)
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Same controls as production{' '}
          <Link to="/admin/series-design" className="text-primary underline">
            Series Design
          </Link>
          , stored in this browser only — nothing reaches a backend.
        </p>
      </div>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Global default layout</h2>
        <Card>
          <CardContent className="pt-6">
            <SeriesDetailsLayoutControls onChanged={() => setTick((n) => n + 1)} />
          </CardContent>
        </Card>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Preview</h2>
        <SeriesDesignLivePreview draft={previewDraft} />
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-semibold text-foreground">Per-series layout override</h2>
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
              <SeriesDetailsLayoutControls
                key={selectedSeriesId}
                seriesId={selectedSeriesId}
                seriesTitle={selectedSeries?.title}
                onChanged={() => setTick((n) => n + 1)}
              />
            )}
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

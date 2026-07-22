import { RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { SeriesDetailsLayoutControls } from '@/components/series/SeriesDetailsLayoutControls';
import { SeriesAppearanceControls } from '@/components/series/SeriesAppearanceControls';
import { SeriesDetailsBackgroundControls } from '@/components/series/SeriesDetailsBackgroundControls';
import { clearAllSeriesDesignOverrides } from '@/features/series/seriesDesignAdmin';
import {
  canSyncSeriesDetailsOverrideToDb,
  syncSeriesDetailsOverrideToDb,
} from '@/features/series/seriesDetailsAdminSync';
import { useToast } from '@/hooks/use-toast';

interface SeriesDesignOverridePanelProps {
  seriesId: string;
  seriesTitle: string;
  coverImageUrl?: string | null;
}

/**
 * Per-series design overrides on the Series Manager edit screen.
 */
export function SeriesDesignOverridePanel({
  seriesId,
  seriesTitle,
  coverImageUrl,
}: SeriesDesignOverridePanelProps) {
  const { toast } = useToast();

  const resetAll = async () => {
    clearAllSeriesDesignOverrides(seriesId);
    if (canSyncSeriesDetailsOverrideToDb(seriesId)) {
      const result = await syncSeriesDetailsOverrideToDb(seriesId, {
        details_layout_override: null,
        appearance_override: null,
        details_background_url: null,
        details_bg_position: null,
        details_bg_overlay_darkness: null,
        details_bg_blur: null,
        details_bg_accent_color: null,
        details_bg_attachment: null,
      });
      if (!result.ok) {
        toast({
          title: 'Local reset done',
          description: `Database sync failed: ${result.error ?? 'unknown error'}`,
          variant: 'destructive',
        });
        return;
      }
    }
    toast({
      title: 'Overrides cleared',
      description: `${seriesTitle} now follows global series design settings.`,
    });
    window.location.reload();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Series page design</CardTitle>
        <CardDescription>
          Override the global layout, appearance, or background for this series only.
          Leave each section at default to use the global design from{' '}
          <a href="/admin/series-design" className="text-primary hover:underline">
            Series Design
          </a>
          .
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <SeriesDetailsLayoutControls seriesId={seriesId} seriesTitle={seriesTitle} />
        <div className="border-t border-border/40 pt-6">
          <SeriesAppearanceControls seriesId={seriesId} seriesTitle={seriesTitle} />
        </div>
        <div className="border-t border-border/40 pt-6">
          <SeriesDetailsBackgroundControls
            seriesId={seriesId}
            seriesTitle={seriesTitle}
            coverImageUrl={coverImageUrl}
          />
        </div>
        <div className="border-t border-border/40 pt-4">
          <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={resetAll}>
            <RotateCcw className="h-4 w-4" />
            Reset all overrides
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

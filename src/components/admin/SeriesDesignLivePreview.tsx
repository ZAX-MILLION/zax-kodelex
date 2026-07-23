import { useMemo } from 'react';
import { SeriesDetailsBackground } from '@/components/series/SeriesDetailsBackground';
import { SeriesDetailsLayoutShell } from '@/components/series/layouts';
import {
  getDemoChaptersForSeries,
  getFeaturedDemoSeries,
  type DemoSeries,
} from '@/utils/demoLibraryData';
import {
  resolveEffectiveScheme,
  type AppearanceMode,
} from '@/features/appearance/appearanceMode';
import type { GlobalSeriesDesignDraft } from '@/features/series/seriesDesignAdmin';
import type { SeriesChapterItem } from '@/components/series/ModernChapterGrid';
import { cn } from '@/lib/utils';

function mapChapters(series: DemoSeries, seriesId: string): SeriesChapterItem[] {
  return getDemoChaptersForSeries(seriesId).slice(0, 4).map((chapter) => ({
    id: chapter.id,
    title: chapter.title,
    chapter_number: chapter.chapter_number,
    page_count: chapter.page_count,
    release_date: chapter.release_date,
    view_count: chapter.view_count,
    is_locked: chapter.is_locked,
    unlock_cost: chapter.unlock_cost,
    thumbnail_url: series.cover_image_url,
    access_type: chapter.access_type,
    comment_count: chapter.comment_count,
  }));
}

interface SeriesDesignLivePreviewProps {
  draft: GlobalSeriesDesignDraft;
  className?: string;
  /** Emulated viewport width — 'mobile' constrains the preview to a phone-sized column. */
  viewport?: 'desktop' | 'mobile';
}

/**
 * Embedded live preview — renders draft layout/appearance/background without persisting.
 */
export function SeriesDesignLivePreview({ draft, className, viewport = 'desktop' }: SeriesDesignLivePreviewProps) {
  const sample = getFeaturedDemoSeries()[0];
  const seriesId = sample?.id || '00000000-0000-4000-a000-000000000001';
  const scheme = resolveEffectiveScheme(draft.appearance as AppearanceMode);

  const chapters = useMemo(
    () => (sample ? mapChapters(sample, seriesId) : []),
    [sample, seriesId]
  );

  if (!sample) {
    return (
      <p className="text-sm text-muted-foreground">
        No sample series available for preview.
      </p>
    );
  }

  const seriesView = {
    id: sample.id,
    title: sample.title,
    alt_title: sample.alt_title,
    description: sample.description,
    author: sample.author,
    artist: sample.artist || sample.author,
    cover_image_url: sample.cover_image_url,
    status: sample.status,
    genres: sample.genres,
    content_type: sample.content_type,
    format: sample.format,
    rating_average: sample.rating_average,
    rating_count: sample.rating_count,
    view_count: sample.view_count,
    followers_count: sample.followers_count,
    language: sample.language,
    publication_date: sample.publication_date,
    updated_at: sample.updated_at,
    age_rating: sample.age_rating,
    details_background_url: null,
  };

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-border/50 bg-background transition-[max-width]',
        viewport === 'mobile' ? 'mx-auto max-w-[390px]' : 'max-w-full',
        scheme,
        className
      )}
      data-series-design-preview
      data-viewport={viewport}
    >
      <div className="max-h-[480px] overflow-y-auto pointer-events-none select-none">
        <SeriesDetailsBackground
          seriesId={seriesId}
          globalDefaultUrl={draft.backgroundUrl.trim() || null}
          coverImageUrl={sample.cover_image_url}
          layoutId={draft.layout}
          dbThemeOverride={draft.backgroundTheme}
        >
          <div className="scale-[0.85] origin-top">
            <SeriesDetailsLayoutShell
              key={draft.layout}
              layoutId={draft.layout}
              series={seriesView}
              chapters={chapters}
              relatedSeries={[]}
              isDemo
              seriesIndex={0}
              accessBadges={['free']}
              startChapter={1}
              continueLabel="Start reading"
              readingState={{
                continueChapter: null,
                readChapters: new Set<number>(),
                progressPercent: 0,
                isInLibrary: false,
              }}
              onContinue={() => {}}
              onLibraryToggle={() => {}}
              onShare={() => {}}
            />
          </div>
        </SeriesDetailsBackground>
      </div>
      <p className="border-t border-border/40 px-3 py-2 text-xs text-muted-foreground">
        Live preview · {sample.title} · changes apply after Save
      </p>
    </div>
  );
}

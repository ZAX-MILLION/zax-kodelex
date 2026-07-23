import { lazy, Suspense } from 'react';
import ModernChapterGrid, { type SeriesChapterItem } from './ModernChapterGrid';
import type { SeriesDetailViewModel } from './SeriesDetailHero';
import { DemoSeriesCommentsPanel } from './DemoSeriesCommentsPanel';
import { getChapterListVariant } from '@/features/series/seriesChapterVariant';
import type { SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';
import { cn } from '@/lib/utils';
import type { DemoSeries } from '@/utils/demoLibraryData';
import type { RelatedTitlesVariant } from './SeriesRelatedTitles';

export type { RelatedTitlesVariant };
export type SecondaryBlockOrder = 'reviews-related' | 'related-reviews';

const SeriesReviews = lazy(() =>
  import('./SeriesReviews').then((m) => ({ default: m.SeriesReviews }))
);
const SeriesRelatedTitles = lazy(() =>
  import('./SeriesRelatedTitles').then((m) => ({ default: m.SeriesRelatedTitles }))
);
const SeriesComments = lazy(() =>
  import('./SeriesComments').then((m) => ({ default: m.SeriesComments }))
);

function SectionSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl border border-border/20 bg-muted/20',
        tall ? 'h-48' : 'h-32'
      )}
      aria-hidden
    />
  );
}

export interface SeriesDetailSectionsProps {
  series: SeriesDetailViewModel;
  chapters: SeriesChapterItem[];
  relatedSeries: DemoSeries[];
  isDemo: boolean;
  seriesIndex: number;
  /** Drives per-layout chapter + comments presentation. */
  layoutId: SeriesDetailsLayoutId;
  showSynopsis?: boolean;
  denseChapters?: boolean;
  className?: string;
  /** Visually de-emphasize reviews + related (smaller headings, muted). */
  deemphasizeSecondary?: boolean;
  /** How Related Titles render after comments. */
  relatedVariant?: RelatedTitlesVariant;
  /** Order of reviews vs related after comments. */
  secondaryOrder?: SecondaryBlockOrder;
}

export function SeriesDetailSynopsis({ description }: { description?: string | null }) {
  if (!description) return null;
  return (
    <section
      id="series-synopsis"
      aria-labelledby="synopsis-heading"
      className="border-b border-border/20 pb-4 sm:pb-5"
    >
      <h2 id="synopsis-heading" className="mb-2 text-base font-semibold sm:text-lg">
        Synopsis
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
    </section>
  );
}

export function SeriesDetailSections({
  series,
  chapters,
  relatedSeries,
  isDemo,
  seriesIndex,
  layoutId,
  showSynopsis = true,
  denseChapters = false,
  className,
  deemphasizeSecondary = false,
  relatedVariant = 'rail',
  secondaryOrder = 'reviews-related',
}: SeriesDetailSectionsProps) {
  void denseChapters;
  const presentationVariant = getChapterListVariant(layoutId);

  const chaptersSection = (
    <section id="series-chapters" aria-labelledby="chapters-section-heading">
      <h2 id="chapters-section-heading" className="sr-only">
        Chapters
      </h2>
      <ModernChapterGrid chapters={chapters} seriesId={series.id} variant={presentationVariant} />
    </section>
  );

  const commentsSection = (
    <section id="series-comments" aria-labelledby="comments-section-heading">
      <Suspense fallback={<SectionSkeleton tall />}>
        {isDemo ? (
          <DemoSeriesCommentsPanel
            seriesId={series.id}
            seriesTitle={series.title}
            variant={presentationVariant}
          />
        ) : (
          <>
            <h2 id="comments-section-heading" className="mb-4 text-xl font-bold sm:text-2xl">
              Comments
            </h2>
            <div className="rounded-lg border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
              <SeriesComments seriesId={series.id} seriesTitle={series.title} />
            </div>
          </>
        )}
      </Suspense>
    </section>
  );

  const reviewsBlock = (
    <section id="series-reviews" aria-labelledby="reviews-section-heading">
      <h2
        id="reviews-section-heading"
        className={
          deemphasizeSecondary
            ? 'mb-3 text-sm font-semibold text-muted-foreground sm:text-base'
            : 'mb-4 text-xl font-bold sm:text-2xl'
        }
      >
        Reviews
      </h2>
      <Suspense fallback={<SectionSkeleton tall />}>
        <SeriesReviews seriesId={series.id} seriesIndex={seriesIndex} />
      </Suspense>
    </section>
  );

  const relatedBlock =
    relatedVariant === 'omit' ? null : (
      <section id="series-related" aria-labelledby="related-section-heading">
        <h2
          id="related-section-heading"
          className={cn(
            'mb-3 font-semibold',
            deemphasizeSecondary || relatedVariant === 'text-list' || relatedVariant === 'rail'
              ? 'text-sm text-muted-foreground sm:text-base'
              : 'mb-4 text-xl font-bold sm:text-2xl'
          )}
        >
          Related Titles
        </h2>
        <Suspense fallback={<SectionSkeleton />}>
          <SeriesRelatedTitles
            series={relatedSeries}
            currentTitle={series.title}
            variant={relatedVariant}
          />
        </Suspense>
      </section>
    );

  const secondarySection = (
    <div
      className={cn(
        'space-y-5 border-t border-border/15 pt-5 sm:space-y-6 sm:pt-6',
        deemphasizeSecondary && 'opacity-90'
      )}
    >
      {secondaryOrder === 'related-reviews' ? (
        <>
          {relatedBlock}
          {reviewsBlock}
        </>
      ) : (
        <>
          {reviewsBlock}
          {relatedBlock}
        </>
      )}
    </div>
  );

  // Required order everywhere: series info (hero/synopsis) → chapters → comments → secondary
  return (
    <div className={cn('relative z-10 space-y-5 sm:space-y-6', className)}>
      {showSynopsis && <SeriesDetailSynopsis description={series.description} />}
      {chaptersSection}
      {commentsSection}
      {secondarySection}
    </div>
  );
}

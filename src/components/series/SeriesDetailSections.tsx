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
  /** Optional chapter list heading override. */
  chaptersHeading?: string;
  /** When false, omit chapters (shell already rendered them). */
  showChapters?: boolean;
  /** When false, omit comments. */
  showComments?: boolean;
  /** When false, omit reviews + related. */
  showSecondary?: boolean;
}

export function SeriesDetailSynopsis({
  description,
  className,
}: {
  description?: string | null;
  className?: string;
}) {
  if (!description) return null;
  return (
    <section
      id="series-synopsis"
      aria-labelledby="synopsis-heading"
      className={cn('border-b border-border/20 pb-4 sm:pb-5', className)}
    >
      <h2 id="synopsis-heading" className="mb-2 text-base font-semibold sm:text-lg">
        Synopsis
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
    </section>
  );
}

export function SeriesChaptersBlock({
  seriesId,
  chapters,
  layoutId,
  heading = 'Chapters',
  className,
}: {
  seriesId: string;
  chapters: SeriesChapterItem[];
  layoutId: SeriesDetailsLayoutId;
  heading?: string;
  className?: string;
}) {
  const presentationVariant = getChapterListVariant(layoutId);
  return (
    <section id="series-chapters" aria-labelledby="chapters-section-heading" className={className}>
      <h2 id="chapters-section-heading" className="sr-only">
        Chapters
      </h2>
      <ModernChapterGrid
        chapters={chapters}
        seriesId={seriesId}
        variant={presentationVariant}
        heading={heading}
      />
    </section>
  );
}

export function SeriesCommentsBlock({
  series,
  isDemo,
  layoutId,
  className,
}: {
  series: SeriesDetailViewModel;
  isDemo: boolean;
  layoutId: SeriesDetailsLayoutId;
  className?: string;
}) {
  const presentationVariant = getChapterListVariant(layoutId);
  return (
    <section id="series-comments" aria-labelledby="comments-section-heading" className={className}>
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
}

export function SeriesReviewsBlock({
  seriesId,
  seriesIndex,
  deemphasize = false,
  className,
}: {
  seriesId: string;
  seriesIndex: number;
  deemphasize?: boolean;
  className?: string;
}) {
  return (
    <section id="series-reviews" aria-labelledby="reviews-section-heading" className={className}>
      <h2
        id="reviews-section-heading"
        className={
          deemphasize
            ? 'mb-3 text-sm font-semibold text-muted-foreground sm:text-base'
            : 'mb-4 text-xl font-bold sm:text-2xl'
        }
      >
        Reviews
      </h2>
      <Suspense fallback={<SectionSkeleton tall />}>
        <SeriesReviews seriesId={seriesId} seriesIndex={seriesIndex} />
      </Suspense>
    </section>
  );
}

export function SeriesRelatedBlock({
  relatedSeries,
  currentTitle,
  relatedVariant = 'rail',
  deemphasize = false,
  className,
}: {
  relatedSeries: DemoSeries[];
  currentTitle: string;
  relatedVariant?: RelatedTitlesVariant;
  deemphasize?: boolean;
  className?: string;
}) {
  if (relatedVariant === 'omit') return null;
  return (
    <section id="series-related" aria-labelledby="related-section-heading" className={className}>
      <h2
        id="related-section-heading"
        className={cn(
          'mb-3 font-semibold',
          deemphasize || relatedVariant === 'text-list' || relatedVariant === 'rail'
            ? 'text-sm text-muted-foreground sm:text-base'
            : 'mb-4 text-xl font-bold sm:text-2xl'
        )}
      >
        Related Titles
      </h2>
      <Suspense fallback={<SectionSkeleton />}>
        <SeriesRelatedTitles
          series={relatedSeries}
          currentTitle={currentTitle}
          variant={relatedVariant}
        />
      </Suspense>
    </section>
  );
}

export function SeriesSecondaryBlocks({
  series,
  relatedSeries,
  seriesIndex,
  relatedVariant = 'rail',
  secondaryOrder = 'reviews-related',
  deemphasizeSecondary = false,
  className,
}: {
  series: SeriesDetailViewModel;
  relatedSeries: DemoSeries[];
  seriesIndex: number;
  relatedVariant?: RelatedTitlesVariant;
  secondaryOrder?: SecondaryBlockOrder;
  deemphasizeSecondary?: boolean;
  className?: string;
}) {
  const reviewsBlock = (
    <SeriesReviewsBlock
      seriesId={series.id}
      seriesIndex={seriesIndex}
      deemphasize={deemphasizeSecondary}
    />
  );
  const relatedBlock = (
    <SeriesRelatedBlock
      relatedSeries={relatedSeries}
      currentTitle={series.title}
      relatedVariant={relatedVariant}
      deemphasize={deemphasizeSecondary}
    />
  );

  return (
    <div
      className={cn(
        'space-y-5 border-t border-border/15 pt-5 sm:space-y-6 sm:pt-6',
        deemphasizeSecondary && 'opacity-90',
        className
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
}

/**
 * Shared body composer: synopsis → chapters → comments → secondary.
 * Layout shells own page chrome; they may also compose the exported blocks
 * directly when structure must diverge beyond props.
 */
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
  chaptersHeading,
  showChapters = true,
  showComments = true,
  showSecondary = true,
}: SeriesDetailSectionsProps) {
  void denseChapters;

  return (
    <div className={cn('relative z-10 space-y-5 sm:space-y-6', className)}>
      {showSynopsis && <SeriesDetailSynopsis description={series.description} />}
      {showChapters && (
        <SeriesChaptersBlock
          seriesId={series.id}
          chapters={chapters}
          layoutId={layoutId}
          heading={chaptersHeading}
        />
      )}
      {showComments && (
        <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />
      )}
      {showSecondary && (
        <SeriesSecondaryBlocks
          series={series}
          relatedSeries={relatedSeries}
          seriesIndex={seriesIndex}
          relatedVariant={relatedVariant}
          secondaryOrder={secondaryOrder}
          deemphasizeSecondary={deemphasizeSecondary}
        />
      )}
    </div>
  );
}

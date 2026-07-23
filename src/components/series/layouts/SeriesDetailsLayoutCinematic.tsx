import LazyImage from '@/components/LazyImage';
import { getFallbackCoverImage } from '@/utils/imageOptimization';
import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import {
  SeriesChaptersBlock,
  SeriesCommentsBlock,
  SeriesRelatedBlock,
  SeriesReviewsBlock,
} from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout B — Streaming Title (Netflix-style).
 * First viewport is almost only artwork + Start. Chapters appear below the fold
 * as large episode posters — never competing with the hero.
 */
export function SeriesDetailsLayoutCinematic(props: SeriesDetailLayoutShellProps) {
  const {
    series,
    chapters,
    relatedSeries,
    isDemo,
    seriesIndex,
    layoutId,
    accessBadges,
    startChapter,
    continueLabel,
    readingState,
    onContinue,
    onLibraryToggle,
    onShare,
  } = props;

  const heroArt = series.details_background_url || series.cover_image_url || getFallbackCoverImage(series.id);

  return (
    <>
      <div className="relative z-30">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      {/* Immersive title billboard — owns the first viewport */}
      <section
        className="relative isolate min-h-[78vh] w-full overflow-hidden sm:min-h-[85vh]"
        aria-label="Series title"
        data-series-layout="cinematic"
      >
        <div className="absolute inset-0">
          <LazyImage src={heroArt} alt="" priority className="object-cover object-top" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/55 to-background/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/50 to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[78vh] flex-col justify-end px-4 pb-10 pt-24 sm:min-h-[85vh] sm:px-8 sm:pb-14 lg:px-12 lg:pb-16">
          <div className="max-w-xl space-y-4 sm:space-y-5">
            <SeriesDetailTitleBlock
              series={series}
              chapterCount={chapters.length}
              accessBadges={[]}
              presentation="cinematic"
            />
            {series.description && (
              <p className="line-clamp-3 text-sm leading-relaxed text-foreground/85 sm:text-[15px]">
                {series.description}
              </p>
            )}
            <SeriesDetailReadingActions
              seriesId={series.id}
              seriesTitle={series.title}
              startChapter={startChapter}
              continueLabel={continueLabel}
              progressPercent={readingState.progressPercent}
              isInLibrary={readingState.isInLibrary}
              hasChapters={chapters.length > 0}
              accessBadges={accessBadges}
              onContinue={onContinue}
              onLibraryToggle={onLibraryToggle}
              onShare={onShare}
              variant="inline"
              iconOnlyLibrary
            />
          </div>
        </div>
      </section>

      {/* Below the fold: episodes → comments → more like this → reviews */}
      <div className="relative z-10 space-y-12 bg-background px-4 pb-24 pt-8 sm:space-y-14 sm:px-8 sm:pt-10 lg:px-12 lg:pb-12">
        <SeriesChaptersBlock
          seriesId={series.id}
          chapters={chapters}
          layoutId={layoutId}
          heading="Episodes"
        />

        <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />

        <SeriesRelatedBlock
          relatedSeries={relatedSeries}
          currentTitle={series.title}
          relatedVariant="visual-grid"
        />

        <SeriesReviewsBlock seriesId={series.id} seriesIndex={seriesIndex} />
      </div>

      <SeriesDetailReadingActions
        seriesId={series.id}
        seriesTitle={series.title}
        startChapter={startChapter}
        continueLabel={continueLabel}
        progressPercent={readingState.progressPercent}
        isInLibrary={readingState.isInLibrary}
        hasChapters={chapters.length > 0}
        accessBadges={accessBadges}
        onContinue={onContinue}
        onLibraryToggle={onLibraryToggle}
        onShare={onShare}
        variant="mobile-bar"
      />
    </>
  );
}

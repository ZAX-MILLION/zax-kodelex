import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout A — Editorial.
 * Magazine masthead: large cover left, typographic column, inline metadata
 * with separators (no chips/boxes). Calm vertical rhythm.
 */
export function SeriesDetailsLayoutEditorial(props: SeriesDetailLayoutShellProps) {
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

  return (
    <>
      <SeriesDetailBreadcrumb title={series.title} />

      <section
        className="relative border-b border-border/20"
        aria-label="Series overview"
        data-series-layout="editorial"
      >
        <div className="container relative mx-auto px-4 py-6 sm:py-8 lg:py-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-10 xl:gap-12">
            <div className="mx-auto w-full max-w-[200px] shrink-0 lg:mx-0 lg:w-[220px] lg:max-w-none">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="md"
                className="mx-auto lg:mx-0"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-4 lg:pt-1">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                {(series.format || series.content_type || 'Series').toString()}
              </p>

              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={[]}
                presentation="editorial"
              />

              {series.description && (
                <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {series.description.length > 280
                    ? `${series.description.slice(0, 280).trim()}…`
                    : series.description}
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
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-6 sm:pt-8 lg:pb-10">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          relatedVariant="rail"
          secondaryOrder="reviews-related"
          className="space-y-8 sm:space-y-10"
        />
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

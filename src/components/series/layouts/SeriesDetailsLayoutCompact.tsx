import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout C — Compact Catalogue.
 * Dense horizontal strip: small cover + genre/access chips. Library browse hub.
 * Distinct from D: chips + catalogue tiles, not a text index.
 */
export function SeriesDetailsLayoutCompact(props: SeriesDetailLayoutShellProps) {
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
        className="border-y border-border/25 bg-muted/20"
        aria-label="Series catalogue header"
        data-series-layout="catalogue"
      >
        <div className="container mx-auto px-4 py-3 sm:py-3.5">
          <div className="flex flex-row items-start gap-3 sm:gap-4">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="sm"
              className="mx-0 max-w-[72px] shrink-0 sm:max-w-[84px]"
            />

            <div className="min-w-0 flex-1 space-y-2">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={accessBadges}
                presentation="catalogue"
              />

              <SeriesDetailReadingActions
                seriesId={series.id}
                seriesTitle={series.title}
                startChapter={startChapter}
                continueLabel={continueLabel}
                progressPercent={readingState.progressPercent}
                isInLibrary={readingState.isInLibrary}
                hasChapters={chapters.length > 0}
                accessBadges={[]}
                onContinue={onContinue}
                onLibraryToggle={onLibraryToggle}
                onShare={onShare}
                variant="inline"
                dense
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-3 sm:pt-4 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          relatedVariant="tile-grid"
          secondaryOrder="related-reviews"
          className="space-y-4 sm:space-y-5"
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

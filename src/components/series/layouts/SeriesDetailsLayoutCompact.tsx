import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout C — Compact Catalogue.
 * Dense info header with a small thumbnail cover, no synopsis up top —
 * instead a structured catalogue metadata block (type/status/language/
 * updated) leads straight into the chapter catalogue. Organized library
 * feel, distinct from Layout D's list-first, metadata-free approach.
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

      <section className="border-b border-border/15" aria-label="Series overview">
        <div className="container mx-auto px-4 py-3">
          <div className="flex flex-row items-start gap-3">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="sm"
              className="mx-0 max-w-[76px] shrink-0 xs:max-w-[86px]"
            />

            <div className="min-w-0 flex-1 space-y-1.5">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={accessBadges}
                compact
                showStats
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

      <div className="container mx-auto px-4 pb-24 pt-4 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          showMetaStats
          denseChapters
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

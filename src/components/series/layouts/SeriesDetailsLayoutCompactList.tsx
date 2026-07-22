import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout D — Compact List.
 * Cover + full info side-by-side, no hero/tabs, chapters directly after info,
 * comments directly below chapters. Reviews + related are secondary and
 * de-emphasized below comments. Built for browsing long catalogues quickly.
 */
export function SeriesDetailsLayoutCompactList(props: SeriesDetailLayoutShellProps) {
  const {
    series,
    chapters,
    relatedSeries,
    isDemo,
    seriesIndex,
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
        <div className="container mx-auto px-4 py-4 sm:py-5">
          <div className="flex flex-row items-start gap-4 sm:gap-5">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="sm"
              className="mx-0 max-w-[104px] shrink-0 xs:max-w-[128px] sm:max-w-[144px]"
            />

            <div className="min-w-0 flex-1 space-y-3">
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

      <div className="container mx-auto px-4 pb-24 pt-4 sm:pt-5 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          showSynopsis
          showMetaStats={false}
          denseChapters
          commentsBeforeSecondary
          deemphasizeSecondary
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

import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout D — Chapter Index.
 * Utility strip (~15% viewport identity). Dense chapter list dominates immediately.
 * Related titles as a plain text list; reviews muted.
 */
export function SeriesDetailsLayoutCompactList(props: SeriesDetailLayoutShellProps) {
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
      <div className="border-b border-border/15">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      <section
        className="max-h-[15vh] min-h-[4.5rem] overflow-hidden border-b border-border/20"
        aria-label="Series index header"
        data-series-layout="chapter-index"
      >
        <div className="container mx-auto px-4 py-2">
          <div className="flex flex-row items-center gap-2.5">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="sm"
              className="mx-0 max-w-[44px] shrink-0 sm:max-w-[52px]"
            />

            <div className="min-w-0 flex-1">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={[]}
                presentation="index"
              />
            </div>

            <div className="hidden shrink-0 sm:block">
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
                iconOnlyLibrary
              />
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-2 sm:pt-2.5 lg:pb-8">
        <div className="mb-2 sm:hidden">
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
            iconOnlyLibrary
          />
        </div>

        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          relatedVariant="text-list"
          secondaryOrder="reviews-related"
          deemphasizeSecondary
          className="space-y-3 sm:space-y-4"
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

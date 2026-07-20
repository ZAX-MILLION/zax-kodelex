import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections, SeriesDetailSynopsis } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

export function SeriesDetailsLayoutCinematic(props: SeriesDetailLayoutShellProps) {
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

      <section
        className="relative border-b border-border/30"
        aria-label="Series hero"
      >
        <div className="container mx-auto px-4 py-6 sm:py-10 lg:py-14">
          <div className="mx-auto flex max-w-4xl flex-col items-center gap-5 text-center sm:gap-7">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="lg"
              className="mx-auto"
            />

            <SeriesDetailTitleBlock
              series={series}
              chapterCount={chapters.length}
              accessBadges={accessBadges}
              className="text-center [&_h1]:text-center [&_.flex-wrap]:justify-center"
            />

            <div className="w-full max-w-md">
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

      {series.description && (
        <div className="container mx-auto px-4 pt-6 sm:pt-8">
          <SeriesDetailSynopsis description={series.description} />
        </div>
      )}

      <div className="container mx-auto px-4 pb-24 pt-6 sm:pt-8 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          showSynopsis={false}
          showMetaStats
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

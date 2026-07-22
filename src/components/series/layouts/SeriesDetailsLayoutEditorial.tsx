import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout A — Editorial.
 * Magazine-style masthead: cover beside title with strong type hierarchy,
 * compact actions sit under the synopsis (not the loudest element on the
 * page), restrained background. Chapters render as publication-style rows.
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

      <section className="relative border-b border-border/25" aria-label="Series overview">
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/25 via-background/55 to-background"
          aria-hidden
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

        <div className="container relative mx-auto px-4 py-5 sm:py-6 lg:py-7">
          <div className="flex flex-col gap-5 sm:gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
            <div className="mx-auto shrink-0 lg:mx-0 lg:w-[200px] xl:w-[220px]">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="md"
                className="mx-auto max-w-[180px] sm:max-w-[200px] lg:mx-0 lg:max-w-none"
              />
            </div>

            <div className="min-w-0 flex-1 space-y-3 sm:space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary/80">
                {series.format || series.content_type || 'Series'}
              </p>

              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={accessBadges}
              />

              {series.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-base sm:leading-relaxed">
                  {series.description.length > 320
                    ? `${series.description.slice(0, 320).trim()}…`
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

      <div className="container mx-auto px-4 pb-24 pt-4 sm:pt-5 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          showMetaStats={false}
          compactRelated
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

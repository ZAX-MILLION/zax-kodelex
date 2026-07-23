import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
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
 * Layout C — Store Catalogue (Steam / shop listing).
 * Sticky product sidebar + chapter tile grid dominating the main pane from
 * first paint. Not a hero page and not a TOC — a browse hub.
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
      <div className="border-b border-border/20 bg-muted/30">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      <div
        className="relative z-10 mx-auto flex w-full max-w-[1400px] flex-col gap-0 lg:flex-row lg:items-start"
        data-series-layout="catalogue"
      >
        {/* Product sidebar */}
        <aside className="w-full shrink-0 border-b border-border/25 bg-muted/25 lg:sticky lg:top-0 lg:max-h-screen lg:w-[280px] lg:overflow-y-auto lg:border-b-0 lg:border-r xl:w-[300px]">
          <div className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-row items-start gap-3 lg:flex-col lg:items-stretch">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="sm"
                className="mx-0 max-w-[88px] shrink-0 lg:mx-auto lg:max-w-[180px]"
              />
              <div className="min-w-0 flex-1 space-y-3 lg:space-y-4">
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

            {series.description && (
              <details className="rounded-md border border-border/20 bg-background/40 p-3 text-sm">
                <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  About
                </summary>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{series.description}</p>
              </details>
            )}
          </div>
        </aside>

        {/* Browse pane — chapters first and loud */}
        <main className="min-w-0 flex-1 space-y-8 px-4 py-4 pb-24 sm:px-6 sm:py-5 lg:pb-10">
          <SeriesChaptersBlock
            seriesId={series.id}
            chapters={chapters}
            layoutId={layoutId}
            heading="Browse chapters"
          />

          <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />

          <SeriesRelatedBlock
            relatedSeries={relatedSeries}
            currentTitle={series.title}
            relatedVariant="tile-grid"
          />

          <SeriesReviewsBlock seriesId={series.id} seriesIndex={seriesIndex} />
        </main>
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

import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import {
  SeriesChaptersBlock,
  SeriesCommentsBlock,
  SeriesDetailSynopsis,
  SeriesRelatedBlock,
} from '../SeriesDetailSections';
import { SeriesRelatedTitles } from '../SeriesRelatedTitles';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout A — Magazine Profile (Webtoon / Lezhin-style series page).
 * Sticky cover column + long-form typographic article. Chapters are a calm
 * publication list — not tiles, not episode posters, not a TOC tool.
 */
export function SeriesDetailsLayoutEditorial(props: SeriesDetailLayoutShellProps) {
  const {
    series,
    chapters,
    relatedSeries,
    isDemo,
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

      <div
        className="container relative z-10 mx-auto px-4 pb-24 pt-4 sm:pt-6 lg:pb-12"
        data-series-layout="editorial"
      >
        <div className="grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[260px_minmax(0,42rem)_minmax(0,1fr)] xl:gap-10">
          {/* Cover masthead — sticky identity column */}
          <aside className="mx-auto w-full max-w-[200px] lg:sticky lg:top-24 lg:mx-0 lg:max-w-none lg:self-start">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="md"
              className="mx-auto lg:mx-0"
            />
            <div className="mt-4 hidden lg:block">
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
          </aside>

          {/* Magazine article column */}
          <article className="min-w-0 space-y-8 sm:space-y-10" aria-label="Series overview">
            <header className="space-y-4 border-b border-border/25 pb-6 sm:pb-8">
              <p className="font-serif text-[11px] font-semibold uppercase tracking-[0.28em] text-muted-foreground">
                {(series.format || series.content_type || 'Series').toString()}
              </p>
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={[]}
                presentation="editorial"
              />
              <div className="lg:hidden">
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
            </header>

            <SeriesDetailSynopsis
              description={series.description}
              className="border-border/15 font-serif [&_p]:text-[15px] [&_p]:leading-[1.75] sm:[&_p]:text-base"
            />

            <SeriesChaptersBlock
              seriesId={series.id}
              chapters={chapters}
              layoutId={layoutId}
              heading="Chapter list"
            />

            <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />

            <SeriesRelatedBlock
              relatedSeries={relatedSeries}
              currentTitle={series.title}
              relatedVariant="rail"
            />
          </article>

          {/* Desktop-only related peek (no duplicate section id) */}
          <aside className="hidden min-w-0 xl:block xl:pt-2" aria-label="Also reading">
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Also reading
            </p>
            <SeriesRelatedTitles
              series={relatedSeries.slice(0, 4)}
              currentTitle={series.title}
              variant="text-list"
            />
          </aside>
        </div>
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

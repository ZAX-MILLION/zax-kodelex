import LazyImage from '@/components/LazyImage';
import { getFallbackCoverImage } from '@/utils/imageOptimization';
import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import {
  SeriesChaptersBlock,
  SeriesCommentsBlock,
  SeriesRelatedBlock,
} from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout B — Streaming Title.
 * Immersive full-bleed billboard owns the first viewport. Cover poster
 * overlaps the hero edge. Episodes and “More like this” live below the fold.
 */
export function SeriesDetailsLayoutCinematic(props: SeriesDetailLayoutShellProps) {
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

  const heroArt =
    series.details_background_url || series.cover_image_url || getFallbackCoverImage(series.id);

  const genres = (series.genres || []).slice(0, 4);

  return (
    <>
      <div className="relative z-30 bg-gradient-to-b from-background/90 to-transparent">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      <section
        className="relative isolate -mt-2 min-h-[82vh] w-full overflow-hidden sm:min-h-[88vh]"
        aria-label="Series title"
        data-series-layout="cinematic"
      >
        <div className="absolute inset-0">
          <LazyImage src={heroArt} alt="" priority className="object-cover object-center" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/15" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background via-background/55 to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-background to-transparent" />
        </div>

        <div className="relative z-10 flex min-h-[82vh] flex-col justify-end px-4 pb-8 pt-28 sm:min-h-[88vh] sm:px-8 sm:pb-12 lg:px-12 lg:pb-14">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-7 lg:gap-8">
            <div className="w-[120px] shrink-0 drop-shadow-2xl sm:w-[148px] lg:w-[176px]">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="sm"
                className="mx-0 max-w-none"
              />
            </div>

            <div className="min-w-0 max-w-2xl flex-1 space-y-3 sm:space-y-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-primary">
                Streaming Title
              </p>
              <h1 className="text-3xl font-black tracking-tight text-foreground drop-shadow-sm xs:text-4xl sm:text-5xl lg:text-[3.25rem] lg:leading-[1.05]">
                {series.title}
              </h1>
              {series.alt_title && (
                <p className="text-sm text-foreground/70 sm:text-base">{series.alt_title}</p>
              )}

              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-foreground/80 sm:text-sm">
                {series.rating_average != null && series.rating_average > 0 && (
                  <span className="font-semibold text-foreground">
                    {series.rating_average.toFixed(1)}★
                  </span>
                )}
                {series.status && <span className="capitalize">{series.status}</span>}
                {chapters.length > 0 && <span>{chapters.length} episodes</span>}
                {series.author && <span>{series.author}</span>}
              </div>

              {genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {genres.map((genre) => (
                    <span
                      key={genre}
                      className="rounded-full border border-white/15 bg-black/25 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-foreground/90 backdrop-blur-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {series.description && (
                <p className="max-w-xl text-sm leading-relaxed text-foreground/80 sm:text-[15px]">
                  {series.description.length > 200
                    ? `${series.description.slice(0, 200).trim()}…`
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
                iconOnlyLibrary
              />
            </div>
          </div>
        </div>
      </section>

      <div className="relative z-10 space-y-12 bg-background px-4 pb-24 pt-6 sm:space-y-14 sm:px-8 sm:pt-8 lg:px-12 lg:pb-12">
        <SeriesChaptersBlock
          seriesId={series.id}
          chapters={chapters}
          layoutId={layoutId}
          heading="Episodes"
        />

        <SeriesRelatedBlock
          relatedSeries={relatedSeries}
          currentTitle={series.title}
          relatedVariant="visual-grid"
        />

        <details className="rounded-2xl border border-border/20 bg-card/30 p-4 sm:p-5">
          <summary className="cursor-pointer text-sm font-semibold text-foreground">
            Show discussion
          </summary>
          <div className="mt-4 border-t border-border/15 pt-4">
            <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />
          </div>
        </details>
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

import LazyImage from '@/components/LazyImage';
import { getFallbackCoverImage } from '@/utils/imageOptimization';
import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout B — Cinematic.
 * Full-bleed artwork hero, cover overlapping the lower edge, compact floating
 * glass panel. Immersive and image-driven — no empty centered column.
 */
export function SeriesDetailsLayoutCinematic(props: SeriesDetailLayoutShellProps) {
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

  const heroArt = series.details_background_url || series.cover_image_url || getFallbackCoverImage(series.id);

  return (
    <>
      <div className="relative z-20 bg-background/80 backdrop-blur-sm">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      <section className="relative" aria-label="Series hero" data-series-layout="cinematic">
        <div className="relative h-[42vh] min-h-[260px] overflow-hidden sm:h-[52vh] sm:min-h-[340px] lg:h-[58vh] lg:min-h-[420px]">
          <LazyImage src={heroArt} alt="" priority className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/80 via-background/20 to-transparent" />
        </div>

        <div className="container relative z-10 mx-auto px-4">
          <div className="-mt-16 flex flex-col gap-4 sm:-mt-20 sm:flex-row sm:items-end sm:gap-6 lg:-mt-24">
            <div className="shrink-0 self-start drop-shadow-2xl sm:self-auto">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="sm"
                className="mx-0 w-[112px] sm:w-[140px] lg:w-[168px]"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-2xl border border-white/10 bg-background/75 p-4 shadow-2xl backdrop-blur-xl sm:p-5 lg:max-w-xl">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={[]}
                presentation="cinematic"
              />
              <div className="mt-3">
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
                  dense
                  iconOnlyLibrary
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <div className="container relative z-10 mx-auto px-4 pb-24 pt-8 sm:pt-10 lg:pb-10">
        {series.description && (
          <p className="mb-8 max-w-3xl text-sm leading-relaxed text-muted-foreground sm:mb-10 sm:text-base">
            {series.description}
          </p>
        )}
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          relatedVariant="visual-grid"
          secondaryOrder="related-reviews"
          className="space-y-10 sm:space-y-12"
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

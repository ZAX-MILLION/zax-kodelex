import LazyImage from '@/components/LazyImage';
import { getFallbackCoverImage } from '@/utils/imageOptimization';
import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections, SeriesDetailSynopsis } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout B — Cinematic.
 * Full-bleed artwork hero with the cover overlapping its lower edge and a
 * compact floating glass panel (title + small inline actions) sitting on
 * top — no large empty centered column.
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
      <SeriesDetailBreadcrumb title={series.title} />

      <section className="relative" aria-label="Series hero">
        <div className="relative h-[34vh] min-h-[220px] overflow-hidden sm:h-[42vh] sm:min-h-[300px] lg:h-[48vh] lg:min-h-[380px]">
          <LazyImage src={heroArt} alt="" priority className="object-cover" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-transparent lg:from-background/70" />
        </div>

        <div className="container relative mx-auto px-4">
          <div className="-mt-14 flex flex-col gap-3 sm:-mt-16 sm:flex-row sm:items-end sm:gap-5 lg:-mt-20">
            <div className="shrink-0 self-start sm:self-auto">
              <SeriesDetailCover
                seriesId={series.id}
                title={series.title}
                coverUrl={series.cover_image_url}
                status={series.status}
                ageRating={series.age_rating}
                size="sm"
                className="mx-0 w-[104px] shrink-0 drop-shadow-2xl sm:w-[128px] lg:w-[150px]"
              />
            </div>

            <div className="min-w-0 flex-1 rounded-2xl border border-border/30 bg-card/85 p-3.5 shadow-2xl backdrop-blur-xl sm:p-4 lg:p-5">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={accessBadges}
                compact
              />
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
      </section>

      {series.description && (
        <div className="container mx-auto px-4 pt-5 sm:pt-6">
          <SeriesDetailSynopsis description={series.description} />
        </div>
      )}

      <div className="container mx-auto px-4 pb-24 pt-5 sm:pt-6 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
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

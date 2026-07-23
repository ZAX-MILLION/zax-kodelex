import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import {
  SeriesChaptersBlock,
  SeriesCommentsBlock,
  SeriesReviewsBlock,
} from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout D — Chapter Index (docs / TOC utility).
 * Almost no art. Title + Start in a one-line chrome bar; the chapter TOC
 * fills the viewport immediately. No related rail. Reviews muted at the end.
 */
export function SeriesDetailsLayoutCompactList(props: SeriesDetailLayoutShellProps) {
  const {
    series,
    chapters,
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
  // Layout D intentionally omits related titles — utility TOC only.
  void props.relatedSeries;

  const metaBits: string[] = [];
  if (series.author) metaBits.push(series.author);
  if (series.status) metaBits.push(series.status);
  if (chapters.length > 0) metaBits.push(`${chapters.length} ch`);

  return (
    <>
      <div className="border-b border-border/15 bg-background">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      {/* Utility chrome — text-first, no cover art */}
      <header
        className="sticky top-0 z-20 border-b border-border/25 bg-background/95 backdrop-blur-md"
        aria-label="Chapter index"
        data-series-layout="chapter-index"
      >
        <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-2.5 sm:py-3">
          <div className="min-w-0 flex-1">
            <h1 className="truncate text-sm font-semibold tracking-tight sm:text-base">
              {series.title}
            </h1>
            <p className="truncate text-[11px] text-muted-foreground">{metaBits.join(' · ')}</p>
          </div>
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
      </header>

      {/* TOC fills the page */}
      <div className="relative z-10 mx-auto max-w-3xl px-4 pb-24 pt-3 sm:pt-4 lg:pb-10">
        <SeriesChaptersBlock
          seriesId={series.id}
          chapters={chapters}
          layoutId={layoutId}
          heading="Table of contents"
          className="min-h-[55vh]"
        />

        <div className="mt-8 space-y-6 border-t border-border/20 pt-6">
          <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />
          <SeriesReviewsBlock
            seriesId={series.id}
            seriesIndex={seriesIndex}
            deemphasize
            className="opacity-80"
          />
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

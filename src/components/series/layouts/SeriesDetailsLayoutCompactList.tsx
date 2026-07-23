import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesChaptersBlock, SeriesCommentsBlock } from '../SeriesDetailSections';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout D — Reader Archive.
 * Premium chapter archive with a compact identity panel and a strong
 * single-column chapter timeline. No related, no reviews.
 */
export function SeriesDetailsLayoutCompactList(props: SeriesDetailLayoutShellProps) {
  const {
    series,
    chapters,
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
  void props.relatedSeries;
  void props.seriesIndex;

  const metaBits: string[] = [];
  if (series.author) metaBits.push(series.author);
  if (series.status) metaBits.push(series.status);
  if (chapters.length > 0) metaBits.push(`${chapters.length} ch`);
  if (series.rating_average != null && series.rating_average > 0) {
    metaBits.push(`${series.rating_average.toFixed(1)}★`);
  }

  return (
    <>
      <div className="border-b border-border/15 bg-background">
        <SeriesDetailBreadcrumb title={series.title} />
      </div>

      <div data-series-layout="chapter-index" className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-4 sm:pt-6 lg:pb-10">
        <section
          aria-label="Reader archive header"
          className="mb-6 overflow-hidden rounded-3xl border border-border/20 bg-card/45 shadow-[0_24px_80px_-48px_rgba(0,0,0,0.55)] backdrop-blur-sm"
        >
          <div className="grid gap-6 p-4 sm:p-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8 lg:p-8">
            <div className="min-w-0 space-y-4">
              <div className="flex items-start gap-4">
                <div className="w-[88px] shrink-0 sm:w-[108px]">
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
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
                    Reader Archive
                  </p>
                  <h1 className="text-xl font-black tracking-tight sm:text-2xl lg:text-3xl">
                    {series.title}
                  </h1>
                  {series.alt_title && (
                    <p className="line-clamp-1 text-sm text-muted-foreground">{series.alt_title}</p>
                  )}
                  <p className="flex flex-wrap gap-x-2 gap-y-1 text-xs text-muted-foreground sm:text-sm">
                    {metaBits.map((bit, index) => (
                      <span key={`${bit}-${index}`} className="inline-flex items-center gap-2">
                        {index > 0 && <span aria-hidden className="text-border">|</span>}
                        <span>{bit}</span>
                      </span>
                    ))}
                  </p>
                </div>
              </div>

              {series.description && (
                <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {series.description.length > 220
                    ? `${series.description.slice(0, 220).trim()}…`
                    : series.description}
                </p>
              )}
            </div>

            <aside className="rounded-2xl border border-border/20 bg-background/55 p-4 sm:p-5 lg:sticky lg:top-24 lg:self-start">
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                Continue reading
              </p>
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
              />
            </aside>
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <SeriesChaptersBlock
              seriesId={series.id}
              chapters={chapters}
              layoutId={layoutId}
              heading="Chapter archive"
              className="min-h-[50vh]"
            />
          </div>

          <aside className="space-y-4 lg:pt-16">
            <div className="rounded-2xl border border-border/20 bg-card/35 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Archive notes
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Start from the latest chapter or pick any earlier entry from the archive below.
                Filters and sorting stay focused on chapters first.
              </p>
            </div>

            <details className="rounded-2xl border border-border/20 bg-card/30 p-4">
              <summary className="cursor-pointer text-sm font-semibold text-foreground">
                Show discussion
              </summary>
              <div className="mt-4 border-t border-border/15 pt-4">
                <SeriesCommentsBlock series={series} isDemo={isDemo} layoutId={layoutId} />
              </div>
            </details>
          </aside>
        </section>
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

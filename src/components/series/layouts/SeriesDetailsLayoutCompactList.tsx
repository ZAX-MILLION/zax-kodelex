import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { SeriesDetailBreadcrumb } from '../SeriesDetailBreadcrumb';
import { SeriesDetailCover } from '../SeriesDetailCover';
import { SeriesDetailTitleBlock } from '../SeriesDetailTitleBlock';
import { SeriesDetailReadingActions } from '../SeriesDetailReadingActions';
import { SeriesDetailSections } from '../SeriesDetailSections';
import { cn } from '@/lib/utils';
import type { SeriesDetailLayoutShellProps } from './types';

/**
 * Layout D — Compact List.
 * The smallest possible header: tiny thumb beside title, a tiny action
 * row, and a short expandable synopsis — everything else is deferred so
 * chapters are the main focus immediately below. Reviews + related are
 * secondary and de-emphasized below comments. Built for browsing long
 * catalogues quickly.
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

  const [synopsisExpanded, setSynopsisExpanded] = useState(false);
  const synopsis = series.description || '';
  const isLongSynopsis = synopsis.length > 140;

  return (
    <>
      <SeriesDetailBreadcrumb title={series.title} />

      <section className="border-b border-border/15" aria-label="Series overview">
        <div className="container mx-auto px-4 py-2.5">
          <div className="flex flex-row items-start gap-2.5">
            <SeriesDetailCover
              seriesId={series.id}
              title={series.title}
              coverUrl={series.cover_image_url}
              status={series.status}
              ageRating={series.age_rating}
              size="sm"
              className="mx-0 max-w-[64px] shrink-0"
            />

            <div className="min-w-0 flex-1 space-y-1.5">
              <SeriesDetailTitleBlock
                series={series}
                chapterCount={chapters.length}
                accessBadges={accessBadges}
                compact
                showStats
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
                iconOnlyLibrary
              />

              {synopsis && (
                <div className="max-w-2xl text-xs text-muted-foreground">
                  <p className={cn(!synopsisExpanded && 'line-clamp-1')}>{synopsis}</p>
                  {isLongSynopsis && (
                    <button
                      type="button"
                      onClick={() => setSynopsisExpanded((v) => !v)}
                      className="mt-0.5 inline-flex items-center gap-0.5 text-[11px] font-medium text-primary"
                    >
                      {synopsisExpanded ? 'Show less' : 'Show more'}
                      <ChevronDown className={cn('h-3 w-3 transition-transform', synopsisExpanded && 'rotate-180')} />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 pb-24 pt-3 lg:pb-8">
        <SeriesDetailSections
          series={series}
          chapters={chapters}
          relatedSeries={relatedSeries}
          isDemo={isDemo}
          seriesIndex={seriesIndex}
          layoutId={layoutId}
          showSynopsis={false}
          showMetaStats={false}
          denseChapters
          commentsBeforeSecondary
          deemphasizeSecondary
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

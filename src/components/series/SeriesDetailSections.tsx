import { lazy, Suspense } from 'react';
import { formatDistanceToNow, format } from 'date-fns';
import { Star, Eye, BookOpen, Heart, Users, Globe, Calendar, Tag } from 'lucide-react';
import ModernChapterGrid, { type SeriesChapterItem } from './ModernChapterGrid';
import type { SeriesDetailViewModel } from './SeriesDetailHero';
import { DemoSeriesCommentsPanel } from './DemoSeriesCommentsPanel';
import { cn } from '@/lib/utils';

const SeriesReviews = lazy(() =>
  import('./SeriesReviews').then((m) => ({ default: m.SeriesReviews }))
);
const SeriesRelatedTitles = lazy(() =>
  import('./SeriesRelatedTitles').then((m) => ({ default: m.SeriesRelatedTitles }))
);
const SeriesComments = lazy(() =>
  import('./SeriesComments').then((m) => ({ default: m.SeriesComments }))
);

function SectionSkeleton({ tall }: { tall?: boolean }) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-xl border border-border/20 bg-muted/20',
        tall ? 'h-48' : 'h-32'
      )}
      aria-hidden
    />
  );
}

function MetaStat({
  icon: Icon,
  label,
  value,
  iconClass,
  bgClass,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  iconClass: string;
  bgClass: string;
}) {
  return (
    <div className="rounded-xl border border-border/25 bg-card/70 p-3 backdrop-blur-sm sm:p-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className={`rounded-lg p-1.5 sm:p-2 ${bgClass}`}>
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${iconClass}`} />
        </div>
        <div className="min-w-0">
          <div className="truncate text-base font-bold sm:text-xl">{value}</div>
          <div className="text-[10px] text-muted-foreground sm:text-xs">{label}</div>
        </div>
      </div>
    </div>
  );
}

import type { DemoSeries } from '@/utils/demoLibraryData';

export interface SeriesDetailSectionsProps {
  series: SeriesDetailViewModel;
  chapters: SeriesChapterItem[];
  relatedSeries: DemoSeries[];
  isDemo: boolean;
  seriesIndex: number;
  showSynopsis?: boolean;
  showMetaStats?: boolean;
  denseChapters?: boolean;
  compactRelated?: boolean;
  className?: string;
  /**
   * When true, comments render immediately after chapters and reviews/related
   * move below as a secondary, de-emphasized block (Layout D — Compact List).
   * Default order keeps reviews → related → comments (Layouts A/B/C).
   */
  commentsBeforeSecondary?: boolean;
  /** Visually de-emphasize the reviews + related block (smaller headings, muted). */
  deemphasizeSecondary?: boolean;
}

export function SeriesDetailSynopsis({ description }: { description?: string | null }) {
  if (!description) return null;
  return (
    <section
      id="series-synopsis"
      aria-labelledby="synopsis-heading"
      className="rounded-xl border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6"
    >
      <h2 id="synopsis-heading" className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
        <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
        Synopsis
      </h2>
      <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">{description}</p>
    </section>
  );
}

export function SeriesDetailMetaPanel({
  series,
  chapterCount,
  compact,
}: {
  series: SeriesDetailViewModel;
  chapterCount: number;
  compact?: boolean;
}) {
  const stats: Array<{
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string;
    iconClass: string;
    bgClass: string;
  }> = [];

  if (series.rating_average != null && series.rating_average > 0) {
    stats.push({
      icon: Star,
      label: 'Rating',
      value: series.rating_average.toFixed(1),
      iconClass: 'fill-yellow-500 text-yellow-500',
      bgClass: 'bg-yellow-500/15',
    });
  }
  if (series.view_count != null && series.view_count > 0) {
    stats.push({
      icon: Eye,
      label: 'Views',
      value: series.view_count.toLocaleString(),
      iconClass: 'text-blue-500',
      bgClass: 'bg-blue-500/15',
    });
  }
  if (chapterCount > 0) {
    stats.push({
      icon: BookOpen,
      label: 'Chapters',
      value: String(chapterCount),
      iconClass: 'text-green-500',
      bgClass: 'bg-green-500/15',
    });
  }
  if (series.rating_count != null && series.rating_count > 0) {
    stats.push({
      icon: Heart,
      label: 'Reviews',
      value: series.rating_count.toLocaleString(),
      iconClass: 'text-purple-500',
      bgClass: 'bg-purple-500/15',
    });
  }
  if (series.followers_count != null && series.followers_count > 0) {
    stats.push({
      icon: Users,
      label: 'Followers',
      value: series.followers_count.toLocaleString(),
      iconClass: 'text-pink-500',
      bgClass: 'bg-pink-500/15',
    });
  }

  const detailRows: Array<{
    label: string;
    value: string;
    icon?: React.ComponentType<{ className?: string }>;
  }> = [];
  if (series.format || series.content_type) {
    detailRows.push({
      label: 'Type',
      value: (series.format || series.content_type || '').replace(/^\w/, (c) => c.toUpperCase()),
      icon: Tag,
    });
  }
  if (series.language) {
    detailRows.push({ label: 'Language', value: series.language, icon: Globe });
  }
  if (series.publication_date) {
    detailRows.push({
      label: 'Year',
      value: format(new Date(series.publication_date), 'yyyy'),
      icon: Calendar,
    });
  }
  if (series.updated_at) {
    detailRows.push({
      label: 'Last updated',
      value: formatDistanceToNow(new Date(series.updated_at), { addSuffix: true }),
      icon: Calendar,
    });
  }

  if (stats.length === 0 && detailRows.length === 0) return null;

  return (
    <section aria-labelledby="series-meta-heading" className="space-y-3 sm:space-y-4">
      <h2 id="series-meta-heading" className="sr-only">
        Series metadata
      </h2>
      {stats.length > 0 && (
        <div
          className={cn(
            'grid gap-2 sm:gap-3',
            compact
              ? 'grid-cols-2 sm:grid-cols-4'
              : stats.length >= 4
                ? 'grid-cols-2 md:grid-cols-4'
                : 'grid-cols-2 sm:grid-cols-3'
          )}
        >
          {stats.map((stat) => (
            <MetaStat key={stat.label} {...stat} />
          ))}
        </div>
      )}
      {detailRows.length > 0 && (
        <dl className="grid grid-cols-1 gap-2 rounded-xl border border-border/25 bg-card/60 p-4 backdrop-blur-sm sm:grid-cols-2 sm:gap-3">
          {detailRows.map(({ label, value, icon: Icon }) => (
            <div key={label} className="flex items-start gap-2 text-sm">
              <dt className="flex items-center gap-2 text-xs text-muted-foreground">
                {Icon && <Icon className="h-4 w-4 shrink-0" aria-hidden />}
                {label}
              </dt>
              <dd className="font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
}

export function SeriesDetailSections({
  series,
  chapters,
  relatedSeries,
  isDemo,
  seriesIndex,
  showSynopsis = true,
  showMetaStats = true,
  denseChapters = false,
  compactRelated = false,
  className,
  commentsBeforeSecondary = false,
  deemphasizeSecondary = false,
}: SeriesDetailSectionsProps) {
  const chaptersSection = (
    <section id="series-chapters" aria-labelledby="chapters-section-heading">
      <h2 id="chapters-section-heading" className="sr-only">
        Chapters
      </h2>
      <ModernChapterGrid chapters={chapters} seriesId={series.id} />
    </section>
  );

  const secondarySection = (
    <div className={cn(deemphasizeSecondary && 'space-y-5 sm:space-y-6 opacity-90')}>
      <section id="series-reviews" aria-labelledby="reviews-section-heading">
        <h2
          id="reviews-section-heading"
          className={
            deemphasizeSecondary
              ? 'mb-3 text-sm font-semibold text-muted-foreground sm:text-base'
              : 'mb-4 text-xl font-bold sm:text-2xl'
          }
        >
          Reviews
        </h2>
        <Suspense fallback={<SectionSkeleton tall />}>
          <SeriesReviews seriesId={series.id} seriesIndex={seriesIndex} />
        </Suspense>
      </section>

      <section id="series-related" aria-labelledby="related-section-heading" className="mt-5 sm:mt-6">
        <h2
          id="related-section-heading"
          className={cn(
            'mb-3 font-semibold text-muted-foreground',
            compactRelated || deemphasizeSecondary ? 'text-sm sm:text-base' : 'mb-4 text-xl font-bold sm:text-2xl'
          )}
        >
          Related Titles
        </h2>
        <Suspense fallback={<SectionSkeleton />}>
          <SeriesRelatedTitles
            series={relatedSeries}
            currentTitle={series.title}
            compact={compactRelated || deemphasizeSecondary}
          />
        </Suspense>
      </section>
    </div>
  );

  const commentsSection = (
    <section id="series-comments" aria-labelledby="comments-section-heading">
      <Suspense fallback={<SectionSkeleton tall />}>
        {isDemo ? (
          <DemoSeriesCommentsPanel seriesId={series.id} seriesTitle={series.title} />
        ) : (
          <>
            <h2 id="comments-section-heading" className="mb-4 text-xl font-bold sm:text-2xl">
              Comments
            </h2>
            <div className="rounded-lg border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
              <SeriesComments seriesId={series.id} seriesTitle={series.title} />
            </div>
          </>
        )}
      </Suspense>
    </section>
  );

  return (
    <div className={cn('space-y-5 sm:space-y-6', className)}>
      {showSynopsis && <SeriesDetailSynopsis description={series.description} />}

      {showMetaStats && (
        <SeriesDetailMetaPanel series={series} chapterCount={chapters.length} compact={denseChapters} />
      )}

      {chaptersSection}

      {commentsBeforeSecondary ? (
        <>
          {commentsSection}
          <div className="border-t border-border/15 pt-5 sm:pt-6">{secondarySection}</div>
        </>
      ) : (
        <>
          {secondarySection}
          {commentsSection}
        </>
      )}
    </div>
  );
}

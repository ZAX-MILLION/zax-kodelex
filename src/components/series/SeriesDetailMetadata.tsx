import { Star, Eye, BookOpen, Heart, Users, Globe, Calendar, Tag } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { SeriesDetailViewModel } from './SeriesDetailHero';

interface SeriesDetailMetadataProps {
  series: SeriesDetailViewModel;
  chapterCount: number;
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

export function SeriesDetailMetadata({ series, chapterCount }: SeriesDetailMetadataProps) {
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

  const detailRows: Array<{ label: string; value: string; icon?: React.ComponentType<{ className?: string }> }> = [];
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

  return (
    <div className="space-y-4 sm:space-y-5">
      {stats.length > 0 && (
        <div
          className={`grid gap-2 sm:gap-3 ${
            stats.length >= 4 ? 'grid-cols-2 md:grid-cols-4' : 'grid-cols-2 sm:grid-cols-3'
          }`}
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
              {Icon && <Icon className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
              <div>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      )}

      {series.description && (
        <div className="rounded-xl border border-border/25 bg-card/70 p-4 backdrop-blur-sm sm:p-6">
          <h2 className="mb-2 flex items-center gap-2 text-base font-semibold sm:mb-3 sm:text-lg">
            <span className="h-5 w-1 rounded-full bg-gradient-to-b from-primary to-secondary" />
            Synopsis
          </h2>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-base">
            {series.description}
          </p>
        </div>
      )}
    </div>
  );
}

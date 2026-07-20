import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import LazyImage from '@/components/LazyImage';
import { getOptimizedImageUrl, getFallbackCoverImage } from '@/utils/imageOptimization';
import { cn } from '@/lib/utils';

export interface SeriesDetailViewModel {
  id: string;
  title: string;
  alt_title?: string | null;
  description?: string | null;
  author?: string | null;
  artist?: string | null;
  cover_image_url?: string | null;
  status?: string | null;
  genres?: string[] | null;
  tags?: string[] | null;
  content_type?: string | null;
  format?: string | null;
  rating_average?: number | null;
  rating_count?: number | null;
  view_count?: number | null;
  followers_count?: number | null;
  language?: string | null;
  publication_date?: string | null;
  updated_at?: string | null;
  age_rating?: string | null;
}

interface SeriesDetailHeroProps {
  series: SeriesDetailViewModel;
  accessBadges: Array<'free' | 'coins' | 'premium'>;
}

export function SeriesDetailHero({ series, accessBadges }: SeriesDetailHeroProps) {
  const coverSrc = getOptimizedImageUrl(
    series.cover_image_url || getFallbackCoverImage(series.id),
    480,
    720
  );

  return (
    <section className="border-b border-border/20">
      <div className="container mx-auto px-4 py-5 sm:py-7 lg:py-10">
        <div className="grid grid-cols-1 items-start gap-5 sm:gap-7 lg:grid-cols-12 lg:gap-8">
          <div className="mx-auto w-full max-w-[168px] xs:max-w-[200px] sm:max-w-[220px] lg:col-span-3 lg:mx-0 lg:max-w-none xl:col-span-3">
            <div className="group relative">
              <div className="pointer-events-none absolute -inset-2 rounded-2xl bg-gradient-to-r from-primary/15 to-secondary/15 opacity-50 blur-lg sm:-inset-3 sm:rounded-3xl sm:opacity-60" />
              <div className="relative overflow-hidden rounded-xl border border-border/30 shadow-xl sm:rounded-2xl">
                <LazyImage
                  src={coverSrc}
                  alt={series.title}
                  width={480}
                  height={720}
                  className="aspect-[3/4] w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                />
                {series.status && (
                  <div className="absolute right-2 top-2">
                    <Badge
                      className={cn(
                        'border border-white/20 px-2 py-0.5 text-[10px] font-semibold text-white shadow-lg sm:text-xs',
                        series.status === 'ongoing' && 'bg-gradient-to-r from-emerald-500 to-green-600',
                        series.status === 'completed' && 'bg-gradient-to-r from-blue-500 to-cyan-600',
                        series.status !== 'ongoing' &&
                          series.status !== 'completed' &&
                          'bg-gradient-to-r from-orange-500 to-amber-600'
                      )}
                    >
                      {series.status.charAt(0).toUpperCase() + series.status.slice(1)}
                    </Badge>
                  </div>
                )}
                {series.age_rating && (
                  <div className="absolute bottom-2 left-2">
                    <Badge className="border-0 bg-black/75 px-2 py-0.5 text-[10px] text-white backdrop-blur-sm">
                      {series.age_rating}
                    </Badge>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="min-w-0 space-y-3 sm:space-y-4 lg:col-span-9 xl:col-span-9">
            <div className="space-y-2 sm:space-y-3">
              <h1 className="break-words text-xl font-black leading-tight text-foreground xs:text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                {series.title}
              </h1>
              {series.alt_title && (
                <p className="text-sm text-muted-foreground sm:text-base">{series.alt_title}</p>
              )}

              <div className="flex flex-col gap-1.5 text-sm sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-4 sm:text-base">
                {series.author && (
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span className="text-muted-foreground">
                      By <span className="font-semibold text-foreground">{series.author}</span>
                    </span>
                  </div>
                )}
                {series.artist && series.artist !== series.author && (
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-secondary" />
                    <span className="text-muted-foreground">
                      Art by{' '}
                      <span className="font-semibold text-foreground">{series.artist}</span>
                    </span>
                  </div>
                )}
              </div>

              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {series.genres.slice(0, 8).map((genre) => (
                    <Link
                      key={genre}
                      to={`/series?genre=${encodeURIComponent(genre)}`}
                      className="rounded-full border border-primary/20 bg-primary/10 px-2.5 py-0.5 text-[11px] font-medium text-primary transition-colors hover:bg-primary/20 sm:px-3 sm:py-1 sm:text-xs"
                    >
                      {genre}
                    </Link>
                  ))}
                </div>
              )}

              {accessBadges.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1 lg:hidden">
                  {accessBadges.includes('free') && (
                    <Badge variant="secondary" className="text-[11px]">
                      Free chapter
                    </Badge>
                  )}
                  {accessBadges.includes('coins') && (
                    <Badge variant="outline" className="text-[11px]">
                      Coin chapter
                    </Badge>
                  )}
                  {accessBadges.includes('premium') && (
                    <Badge variant="outline" className="text-[11px]">
                      Premium chapter
                    </Badge>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

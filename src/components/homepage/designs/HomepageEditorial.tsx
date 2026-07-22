import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import DemoModeBanner from '../DemoModeBanner';
import { EnhancedMangaCard } from '@/components/manga/EnhancedMangaCard';
import { useSeriesData } from '@/hooks/useSeriesData';
import { isDemoSeriesId } from '@/utils/demoLibraryData';
import { appConfig } from '@/config/env';
import { LoadingState } from '@/components/LoadingSpinner';
import {
  HomepageBrowseCta,
  HomepageFeedAndBlog,
  HomepageMembershipBlock,
  HomepageRoleLabBlock,
  HomepageTrustBlock,
} from './HomepageSharedSections';

/** Layout A — Editorial Premium: typographic hero, three refined spotlights, horizontal continuum. */
export function HomepageEditorial() {
  const { series: latestSeries, fetchSeries, loading } = useSeriesData();

  useEffect(() => {
    void fetchSeries('latest', 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemoBanner =
    !loading && latestSeries.length > 0 && latestSeries.every((s) => isDemoSeriesId(s.id));
  const featured = latestSeries.slice(0, 3);
  const continuum = latestSeries.slice(3, 8);

  if (loading && latestSeries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Opening the library…" />
      </div>
    );
  }

  return (
    <div className="homepage-design homepage-design--editorial" data-homepage-design="A">
      <div className="relative overflow-hidden border-b border-border/40">
        <div className="container relative mx-auto px-4 pb-2 pt-6 sm:px-6 lg:px-8">
          <DemoModeBanner visible={showDemoBanner || appConfig.isDemo} />
          <header className="mb-6 max-w-3xl sm:mb-8">
            <p className="mb-3 text-xs uppercase tracking-[0.2em] text-primary/90 sm:text-sm">Zax Million</p>
            <h1 className="font-serif text-3xl font-light leading-[1.15] tracking-tight text-foreground sm:text-4xl lg:text-5xl">
              Stories worth slowing down for.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
              Editorial picks, quiet lists, and a reader that stays out of your way.
            </p>
            <div className="mt-6">
              <HomepageBrowseCta label="Browse the journal" />
            </div>
          </header>
        </div>
      </div>

      <section className="container mx-auto border-b border-border/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h2 className="text-2xl font-bold sm:text-3xl">Editor&apos;s pick</h2>
        <div className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-3">
          {featured.map((series, i) => (
            <article key={series.id} className="group border-b border-border/20 pb-6 last:border-b-0 md:border-b-0">
              <Link to={`/series/${series.id}`} className="block">
                <div className="mb-3 aspect-[4/5] overflow-hidden rounded-lg bg-muted">
                  {series.cover_image_url ? (
                    <img src={series.cover_image_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-[1.02]" />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <Badge variant="outline" className="mb-2 font-serif text-[10px] uppercase tracking-widest">
                  №{i + 1}
                </Badge>
                <h3 className="text-lg font-semibold group-hover:text-primary">{series.title}</h3>
                {series.description && <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{series.description}</p>}
              </Link>
            </article>
          ))}
        </div>
        {continuum.length > 0 && (
          <div className="mt-10 flex gap-4 overflow-x-auto pb-2">
            {continuum.map((series) => (
              <div key={series.id} className="w-[130px] shrink-0">
                <EnhancedMangaCard series={series} showMetadata={false} size="small" />
              </div>
            ))}
          </div>
        )}
      </section>

      <HomepageMembershipBlock compact />
      <HomepageRoleLabBlock />
      <HomepageTrustBlock />
      <HomepageFeedAndBlog />
    </div>
  );
}

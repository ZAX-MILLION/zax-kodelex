import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import DemoModeBanner from '../DemoModeBanner';
import { HeroSlider } from '../HeroSlider';
import { EnhancedMangaCard } from '@/components/manga/EnhancedMangaCard';
import { useSeriesData, useTrendingSeries } from '@/hooks/useSeriesData';
import { isDemoSeriesId } from '@/utils/demoLibraryData';
import { appConfig } from '@/config/env';
import { LoadingState } from '@/components/LoadingSpinner';
import {
  HomepageFeedAndBlog,
  HomepageMembershipBlock,
  HomepageRoleLabBlock,
  HomepageTrustBlock,
} from './HomepageSharedSections';

/** Layout B — Cinematic Showcase: full-bleed hero, film-strip carousel, wide progress cards. */
export function HomepageCinematic() {
  const { series: latestSeries, fetchSeries, loading } = useSeriesData();
  const { trendingSeries } = useTrendingSeries();

  useEffect(() => {
    void fetchSeries('latest', 12);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemoBanner =
    !loading && latestSeries.length > 0 && latestSeries.every((s) => isDemoSeriesId(s.id));
  const spotlight = latestSeries.slice(0, 8);

  if (loading && latestSeries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading spotlight…" />
      </div>
    );
  }

  const heroCover = spotlight[0]?.cover_image_url;

  return (
    <div className="homepage-design homepage-design--cinematic" data-homepage-design="B">
      <div className="relative min-h-[42vh] overflow-hidden border-b border-border/30 sm:min-h-[52vh]">
        {heroCover && (
          <img src={heroCover} alt="" className="absolute inset-0 h-full w-full object-cover" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="container relative mx-auto flex min-h-[42vh] flex-col justify-end px-4 pb-8 pt-24 sm:min-h-[52vh] sm:px-6 lg:px-8">
          <DemoModeBanner visible={showDemoBanner || appConfig.isDemo} />
          <h1 className="max-w-2xl text-3xl font-bold text-foreground drop-shadow sm:text-4xl lg:text-5xl">
            {spotlight[0]?.title || 'Featured tonight'}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground sm:text-base">
            Cinematic spotlight — start reading in one tap.
          </p>
          {spotlight[0] && (
            <Button asChild size="lg" className="mt-6 w-fit min-h-11 gap-2">
              <Link to={`/series/${spotlight[0].id}`}>
                <Play className="h-4 w-4" />
                Start reading
              </Link>
            </Button>
          )}
        </div>
      </div>

      <section className="border-b border-border/30 py-6">
        <HeroSlider slidesCount={5} autoSlideInterval={7000} showFilters={false} />
      </section>

      <section className="container mx-auto border-b border-border/30 px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Now streaming</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2 snap-x">
          {spotlight.map((series) => (
            <div key={series.id} className="w-[200px] shrink-0 snap-start">
              <div className="group relative aspect-[16/9] overflow-hidden rounded-xl border border-white/10 shadow-lg">
                {series.cover_image_url && (
                  <img src={series.cover_image_url} alt="" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                <p className="absolute bottom-2 left-2 right-2 line-clamp-1 text-sm font-bold text-white">{series.title}</p>
              </div>
            </div>
          ))}
        </div>
        {trendingSeries.length > 0 && (
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {trendingSeries.slice(0, 4).map((series) => (
              <EnhancedMangaCard key={series.id} series={series} size="small" />
            ))}
          </div>
        )}
      </section>

      <HomepageMembershipBlock />
      <HomepageRoleLabBlock />
      <HomepageTrustBlock />
      <HomepageFeedAndBlog />
    </div>
  );
}

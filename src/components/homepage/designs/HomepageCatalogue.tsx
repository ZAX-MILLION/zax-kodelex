import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DemoModeBanner from '../DemoModeBanner';
import { SeriesGrid } from '../SeriesGrid';
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

const GENRE_CHIPS = ['Action', 'Romance', 'Fantasy', 'Sci-Fi', 'Slice of Life', 'Horror'];

/** Layout C — Catalogue / Product (default): search, chips, tabbed dense grid. */
export function HomepageCatalogue() {
  const { series: latestSeries, fetchSeries, loading } = useSeriesData();
  const { trendingSeries } = useTrendingSeries();
  const [query, setQuery] = useState('');

  useEffect(() => {
    void fetchSeries('latest', 16);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemoBanner =
    !loading && latestSeries.length > 0 && latestSeries.every((s) => isDemoSeriesId(s.id));

  if (loading && latestSeries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading catalogue…" />
      </div>
    );
  }

  const filtered = query.trim()
    ? latestSeries.filter((s) => s.title.toLowerCase().includes(query.trim().toLowerCase()))
    : latestSeries;

  return (
    <div className="homepage-design homepage-design--catalogue" data-homepage-design="C">
      <div className="border-b border-border/30 bg-muted/20">
        <div className="container mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <DemoModeBanner visible={showDemoBanner || appConfig.isDemo} />
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">Browse the library</h1>
              <p className="mt-1 text-sm text-muted-foreground">Search, filter, and jump into a series.</p>
            </div>
            <Input
              type="search"
              placeholder="Search series…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="max-w-md min-h-11"
              aria-label="Search series"
            />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            {GENRE_CHIPS.map((genre) => (
              <Badge key={genre} variant="secondary" className="cursor-default">
                {genre}
              </Badge>
            ))}
            <Link to="/categories" className="inline-flex">
              <Badge variant="outline">All genres</Badge>
            </Link>
          </div>
        </div>
      </div>

      <section className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <Tabs defaultValue="latest">
          <TabsList className="mb-6">
            <TabsTrigger value="latest">Latest</TabsTrigger>
            <TabsTrigger value="trending">Trending</TabsTrigger>
            <TabsTrigger value="top">Top rated</TabsTrigger>
          </TabsList>
          <TabsContent value="latest">
            <SeriesGrid series={filtered} title="" columns={4} showPagination={false} />
          </TabsContent>
          <TabsContent value="trending">
            <SeriesGrid series={trendingSeries.slice(0, 12)} title="" columns={4} showPagination={false} />
          </TabsContent>
          <TabsContent value="top">
            <SeriesGrid series={[...latestSeries].slice(0, 12)} title="" columns={4} showPagination={false} />
          </TabsContent>
        </Tabs>
        <p className="mt-4 text-xs text-muted-foreground">{filtered.length} titles shown</p>
      </section>

      <HomepageMembershipBlock />
      <HomepageRoleLabBlock />
      <HomepageTrustBlock />
      <HomepageFeedAndBlog />
    </div>
  );
}

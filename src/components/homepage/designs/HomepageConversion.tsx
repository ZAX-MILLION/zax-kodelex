import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DemoModeBanner from '../DemoModeBanner';
import { EnhancedMangaCard } from '@/components/manga/EnhancedMangaCard';
import { useSeriesData } from '@/hooks/useSeriesData';
import { isDemoSeriesId } from '@/utils/demoLibraryData';
import { appConfig } from '@/config/env';
import { SUBSCRIPTION_PLANS } from '@/payments/catalog';
import { LoadingState } from '@/components/LoadingSpinner';
import { HomepageFeedAndBlog, HomepageTrustBlock } from './HomepageSharedSections';

/** Layout D — Hybrid Conversion: value-prop hero, pricing, coin band, Role Lab block. */
export function HomepageConversion() {
  const { series: latestSeries, fetchSeries, loading } = useSeriesData();

  useEffect(() => {
    void fetchSeries('latest', 8);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemoBanner =
    !loading && latestSeries.length > 0 && latestSeries.every((s) => isDemoSeriesId(s.id));

  if (loading && latestSeries.length === 0) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <LoadingState message="Loading…" />
      </div>
    );
  }

  return (
    <div className="homepage-design homepage-design--conversion" data-homepage-design="D">
      <div className="border-b border-border/30 bg-gradient-to-br from-primary/10 via-background to-background">
        <div className="container mx-auto grid grid-cols-1 items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-16">
          <div>
            <DemoModeBanner visible={showDemoBanner || appConfig.isDemo} />
            <Badge className="mb-4">Join free — read smarter</Badge>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl lg:text-5xl">
              Premium manga reading with honest pricing.
            </h1>
            <ul className="mt-6 space-y-2 text-sm text-muted-foreground">
              {['Smooth reader on every device', 'Coins or membership — your choice', 'Demo-safe Role Lab preview'].map((line) => (
                <li key={line} className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 shrink-0 text-primary" />
                  {line}
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-11">
                <Link to="/browse">Start reading free</Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="min-h-11">
                <Link to="/premium">See plans</Link>
              </Button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {latestSeries.slice(0, 4).map((series) => (
              <EnhancedMangaCard key={series.id} series={series} size="small" />
            ))}
          </div>
        </div>
      </div>

      <section className="container mx-auto border-b border-border/30 px-4 py-10 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-bold">Popular now</h2>
        <div className="mt-6 flex gap-4 overflow-x-auto pb-2">
          {latestSeries.slice(0, 6).map((series) => (
            <div key={series.id} className="w-[140px] shrink-0">
              <EnhancedMangaCard series={series} size="small" />
            </div>
          ))}
        </div>
        <Button asChild variant="link" className="mt-4 h-auto p-0">
          <Link to="/browse">
            Browse full library
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </section>

      <section className="border-b border-border/30 bg-muted/15">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <h2 className="text-center text-2xl font-bold">Choose your plan</h2>
          <div className="mx-auto mt-8 grid max-w-4xl grid-cols-1 gap-4 sm:grid-cols-3">
            {SUBSCRIPTION_PLANS.filter((p) => p.active).map((plan, i) => (
              <div
                key={plan.id}
                className={`rounded-2xl border p-6 ${i === 1 ? 'border-primary bg-primary/5 shadow-md' : 'border-border/50 bg-card/50'}`}
              >
                {i === 1 && <Badge className="mb-2">Most popular</Badge>}
                <h3 className="font-semibold">{plan.label}</h3>
                <p className="mt-2 text-2xl font-bold tabular-nums">${plan.amountUsd.toFixed(2)}</p>
                <p className="text-xs text-muted-foreground">per {plan.interval}</p>
                <Button asChild className="mt-4 w-full min-h-10" variant={i === 1 ? 'default' : 'outline'}>
                  <Link to={appConfig.disablePayments ? '/demo' : '/subscribe'}>Select</Link>
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {appConfig.features.roleLab && (
        <section className="container mx-auto border-b border-border/30 px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-8 rounded-2xl border border-primary/30 bg-primary/5 p-8 lg:grid-cols-2">
            <div>
              <h2 className="flex items-center gap-2 text-2xl font-bold">
                <FlaskConical className="h-6 w-6 text-primary" />
                Try Role Lab first
              </h2>
              <p className="mt-3 text-muted-foreground">
                Switch roles in one click — no signup, no backend, perfect for evaluating the product.
              </p>
            </div>
            <Button asChild size="lg" className="min-h-11 justify-self-start lg:justify-self-end">
              <Link to="/demo">Launch demo</Link>
            </Button>
          </div>
        </section>
      )}

      <HomepageTrustBlock />
      <HomepageFeedAndBlog />
    </div>
  );
}

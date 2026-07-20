import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, FlaskConical, ShieldCheck, Sparkles, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { appConfig } from '@/config/env';
import { COIN_PACKAGES, SUBSCRIPTION_PLANS, LICENSE_PRODUCTS } from '@/payments/catalog';
import DemoModeBanner from '../DemoModeBanner';
import { HeroSlider } from '../HeroSlider';
import { FeedSection } from '../FeedSection';
import { BlogSection } from '../BlogSection';
import { EnhancedMangaCard } from '@/components/manga/EnhancedMangaCard';
import TrendingSidebarWidget from '../TrendingSidebarWidget';
import { useSeriesData, useTrendingSeries } from '@/hooks/useSeriesData';
import { isDemoSeriesId } from '@/utils/demoLibraryData';
import { LoadingState } from '@/components/LoadingSpinner';

/**
 * Seamless V2 public homepage — editorial flow, not the old card-grid stack.
 * Hierarchy: Hero → Discovery → Membership → Role Lab → Trust → Library/Feed → Blog
 */
export function SeamlessHomepage({ className = '' }: { className?: string }) {
  const { series: latestSeries, fetchSeries, loading } = useSeriesData();
  const { trendingSeries } = useTrendingSeries();

  useEffect(() => {
    void fetchSeries('latest', 8);
    // Intentionally once on mount — fetchSeries is not memoized in useSeriesData
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const showDemoBanner =
    !loading && latestSeries.length > 0 && latestSeries.every((s) => isDemoSeriesId(s.id));

  const featured = latestSeries.slice(0, 3);
  const continuum = latestSeries.slice(3, 8);

  if (loading && latestSeries.length === 0) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <LoadingState message="Opening the library…" />
      </div>
    );
  }

  return (
    <div className={`seamless-home ${className}`}>
      <div className="relative overflow-hidden border-b border-border/40">
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 20% 0%, hsl(25 95% 53% / 0.18), transparent 55%), radial-gradient(ellipse 60% 50% at 90% 20%, hsl(210 100% 60% / 0.12), transparent 50%)',
          }}
          aria-hidden
        />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-2 relative">
          <DemoModeBanner visible={showDemoBanner || appConfig.isDemo} />
          <header className="max-w-3xl mb-6 sm:mb-8">
            <p className="text-xs sm:text-sm uppercase tracking-[0.2em] text-primary/90 mb-3">
              Zax Million
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.1]">
              Read with presence.
              <span className="block text-muted-foreground font-semibold mt-1 text-2xl sm:text-3xl lg:text-4xl">
                A darker, quieter manga desk.
              </span>
            </h1>
            <p className="mt-4 text-sm sm:text-base text-muted-foreground max-w-xl leading-relaxed">
              Curated series, a smooth reader, and honest membership — no cluttered storefront of
              identical cards fighting for attention.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild size="lg" className="min-h-11 px-6">
                <Link to="/browse">
                  Explore library
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {appConfig.features.roleLab && (
                <Button asChild size="lg" variant="outline" className="min-h-11 px-6">
                  <Link to="/demo">
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Try Role Lab
                  </Link>
                </Button>
              )}
              <Button asChild size="lg" variant="ghost" className="min-h-11">
                <Link to="/premium">Membership</Link>
              </Button>
            </div>
          </header>
        </div>

        <section aria-label="Featured slides" className="pb-2">
          <HeroSlider slidesCount={5} autoSlideInterval={6000} showFilters={false} />
        </section>
      </div>

      <section
        aria-labelledby="discovery-heading"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/30"
      >
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-8">
          <div>
            <h2 id="discovery-heading" className="text-2xl sm:text-3xl font-bold">
              Start here
            </h2>
            <p className="text-muted-foreground mt-1 max-w-lg">
              Three picks in focus — then a quiet continuum of recent titles.
            </p>
          </div>
          <Button variant="outline" asChild className="self-start min-h-11">
            <Link to="/browse?sort=latest">
              Full catalogue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {featured.map((series, i) => (
            <article
              key={series.id}
              className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/40 hover:border-primary/40 transition-colors"
            >
              <Link
                to={`/series/${series.id}`}
                className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="aspect-[16/10] overflow-hidden bg-muted">
                  {series.cover_image_url ? (
                    <img
                      src={series.cover_image_url}
                      alt={`${series.title} cover`}
                      width={640}
                      height={400}
                      loading={i === 0 ? 'eager' : 'lazy'}
                      className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:transform-none"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                      <BookOpen className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4 sm:p-5">
                  <Badge variant="secondary" className="mb-2">
                    Spotlight {i + 1}
                  </Badge>
                  <h3 className="text-lg font-semibold leading-snug group-hover:text-primary transition-colors">
                    {series.title}
                  </h3>
                  {series.description && (
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                      {series.description}
                    </p>
                  )}
                </div>
              </Link>
            </article>
          ))}
        </div>

        {continuum.length > 0 && (
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {continuum.map((series) => (
              <div key={series.id} className="snap-start shrink-0 w-[140px] sm:w-[160px]">
                <EnhancedMangaCard series={series} showMetadata={false} size="small" />
              </div>
            ))}
          </div>
        )}
      </section>

      <section
        aria-labelledby="membership-heading"
        className="border-b border-border/30 bg-gradient-to-b from-muted/20 to-transparent"
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 items-start">
            <div>
              <div className="flex items-center gap-2 text-primary mb-3">
                <Crown className="h-5 w-5" />
                <span className="text-xs uppercase tracking-[0.18em]">Membership</span>
              </div>
              <h2 id="membership-heading" className="text-2xl sm:text-3xl font-bold">
                Premium access, plainly priced
              </h2>
              <p className="mt-3 text-muted-foreground max-w-xl leading-relaxed">
                Support Membership unlocks premium reading perks. Coins buy chapter unlocks. Theme
                licenses are separate digital products — not donations.
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {SUBSCRIPTION_PLANS.filter((p) => p.active).map((plan) => (
                  <li
                    key={plan.id}
                    className="flex items-center justify-between gap-4 border-b border-border/40 py-3"
                  >
                    <span className="font-medium">{plan.label}</span>
                    <span className="text-muted-foreground tabular-nums">
                      ${plan.amountUsd.toFixed(2)} USD / {plan.interval}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-6 flex flex-wrap gap-3">
                {appConfig.disablePayments ? (
                  <Button asChild className="min-h-11">
                    <Link to="/demo">Preview in Role Lab</Link>
                  </Button>
                ) : (
                  <Button asChild className="min-h-11">
                    <Link to="/subscribe">View Premium</Link>
                  </Button>
                )}
                <Button asChild variant="outline" className="min-h-11">
                  <Link to="/terms">Terms & refund posture</Link>
                </Button>
              </div>
              {appConfig.disablePayments && (
                <p className="mt-3 text-xs text-muted-foreground" role="status">
                  Live checkout is off on this demo host. No PayPal SDK loads here.
                </p>
              )}
            </div>
            <aside className="rounded-2xl border border-border/50 bg-card/50 p-5 sm:p-6 space-y-5">
              <div>
                <h3 className="font-semibold flex items-center gap-2">
                  <Sparkles className="h-4 w-4 text-primary" />
                  Coin packs
                </h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {COIN_PACKAGES.slice(0, 3).map((pack) => (
                    <li key={pack.id} className="flex justify-between gap-2">
                      <span>{pack.label}</span>
                      <span className="tabular-nums text-foreground">${pack.amountUsd.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="border-t border-border/40 pt-4">
                <h3 className="font-semibold">Theme licenses</h3>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {LICENSE_PRODUCTS.map((lic) => (
                    <li key={lic.id} className="flex justify-between gap-2">
                      <span>{lic.label}</span>
                      <span className="tabular-nums text-foreground">${lic.amountUsd.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {appConfig.features.roleLab && (
        <section
          aria-labelledby="rolelab-heading"
          className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/30"
        >
          <div className="rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8 flex flex-col md:flex-row md:items-center gap-6 justify-between">
            <div className="max-w-xl">
              <h2 id="rolelab-heading" className="text-xl sm:text-2xl font-bold flex items-center gap-2">
                <FlaskConical className="h-6 w-6 text-primary" />
                Role Lab
              </h2>
              <p className="mt-2 text-muted-foreground text-sm sm:text-base leading-relaxed">
                One click to preview Guest, Member, Paid, Buyer, Uploader, and Admin UI states —
                session-only, no passwords, no production data.
              </p>
            </div>
            <Button asChild size="lg" className="min-h-11 shrink-0">
              <Link to="/demo">Open Role Lab</Link>
            </Button>
          </div>
        </section>
      )}

      <section
        aria-labelledby="trust-heading"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 border-b border-border/30"
      >
        <h2 id="trust-heading" className="text-2xl font-bold mb-6 flex items-center gap-2">
          <ShieldCheck className="h-6 w-6 text-primary" />
          Trust & support
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/privacy', title: 'Privacy', body: 'How we handle account and reading data.' },
            { to: '/terms', title: 'Terms', body: 'Digital goods, membership, and final-sale notes.' },
            { to: '/support', title: 'Support', body: 'Contact and membership help surfaces.' },
            { to: '/dmca', title: 'DMCA', body: 'Copyright notices and takedown process.' },
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="block rounded-xl border border-border/50 p-4 hover:border-primary/40 transition-colors min-h-[7rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <h3 className="font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.body}</p>
            </Link>
          ))}
        </div>
      </section>

      <section
        aria-labelledby="library-heading"
        className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14"
      >
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-10">
          <div className="space-y-10">
            <div>
              <h2 id="library-heading" className="text-2xl font-bold mb-2">
                Recent chapters
              </h2>
              <p className="text-sm text-muted-foreground mb-6">Live feed of what just dropped.</p>
              <FeedSection />
            </div>
          </div>
          <div className="space-y-6 lg:sticky lg:top-24 lg:self-start" role="complementary" aria-label="Trending">
            <TrendingSidebarWidget
              todaySeries={trendingSeries.slice(0, 3)}
              weekSeries={trendingSeries.slice(0, 5)}
              allTimeSeries={trendingSeries}
            />
          </div>
        </div>
      </section>

      <div className="border-t border-border/30">
        <BlogSection />
      </div>
    </div>
  );
}

export default SeamlessHomepage;

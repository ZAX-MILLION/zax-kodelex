import { Link } from 'react-router-dom';
import { ArrowRight, Crown, FlaskConical, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { appConfig } from '@/config/env';
import { COIN_PACKAGES, SUBSCRIPTION_PLANS, LICENSE_PRODUCTS } from '@/payments/catalog';
import { BlogSection } from '../BlogSection';
import { FeedSection } from '../FeedSection';

/** Shared blocks reused across homepage design variants. */
export function HomepageMembershipBlock({ compact }: { compact?: boolean }) {
  return (
    <section
      aria-labelledby="membership-heading"
      className="border-b border-border/30 bg-gradient-to-b from-muted/20 to-transparent"
    >
      <div className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <div className={compact ? 'max-w-3xl' : 'grid grid-cols-1 items-start gap-10 lg:grid-cols-[1.1fr_0.9fr]'}>
          <div>
            <div className="mb-3 flex items-center gap-2 text-primary">
              <Crown className="h-5 w-5" />
              <span className="text-xs uppercase tracking-[0.18em]">Membership</span>
            </div>
            <h2 id="membership-heading" className="text-2xl font-bold sm:text-3xl">
              Premium access, plainly priced
            </h2>
            <p className="mt-3 max-w-xl leading-relaxed text-muted-foreground">
              Support Membership unlocks premium reading perks. Coins buy chapter unlocks.
            </p>
            {!compact && (
              <ul className="mt-6 space-y-3 text-sm">
                {SUBSCRIPTION_PLANS.filter((p) => p.active).map((plan) => (
                  <li key={plan.id} className="flex items-center justify-between gap-4 border-b border-border/40 py-3">
                    <span className="font-medium">{plan.label}</span>
                    <span className="tabular-nums text-muted-foreground">
                      ${plan.amountUsd.toFixed(2)} / {plan.interval}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-6 flex flex-wrap gap-3">
              <Button asChild className="min-h-11">
                <Link to={appConfig.disablePayments ? '/demo' : '/subscribe'}>
                  {appConfig.disablePayments ? 'Preview in Role Lab' : 'View Premium'}
                </Link>
              </Button>
              <Button asChild variant="outline" className="min-h-11">
                <Link to="/terms">Terms</Link>
              </Button>
            </div>
          </div>
          {!compact && (
            <div className="space-y-5 rounded-2xl border border-border/50 bg-card/50 p-5 sm:p-6">
              <div>
                <h3 className="flex items-center gap-2 font-semibold">
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
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function HomepageRoleLabBlock() {
  if (!appConfig.features.roleLab) return null;
  return (
    <section className="container mx-auto border-b border-border/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="flex flex-col justify-between gap-6 rounded-2xl border border-primary/25 bg-primary/5 p-6 sm:p-8 md:flex-row md:items-center">
        <div className="max-w-xl">
          <h2 className="flex items-center gap-2 text-xl font-bold sm:text-2xl">
            <FlaskConical className="h-6 w-6 text-primary" />
            Role Lab
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
            Preview Guest, Member, Paid, Buyer, Uploader, and Admin UI — session-only, no production data.
          </p>
        </div>
        <Button asChild size="lg" className="min-h-11 shrink-0">
          <Link to="/demo">Open Role Lab</Link>
        </Button>
      </div>
    </section>
  );
}

export function HomepageTrustBlock() {
  return (
    <section className="container mx-auto border-b border-border/30 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <h2 className="mb-6 flex items-center gap-2 text-2xl font-bold">
        <ShieldCheck className="h-6 w-6 text-primary" />
        Trust & support
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: '/privacy', title: 'Privacy', body: 'How we handle account and reading data.' },
          { to: '/terms', title: 'Terms', body: 'Digital goods, membership, and refund posture.' },
          { to: '/support', title: 'Support', body: 'Contact and membership help.' },
          { to: '/dmca', title: 'DMCA', body: 'Copyright notices and takedown process.' },
        ].map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="block min-h-[7rem] rounded-xl border border-border/50 p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <h3 className="font-semibold">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.body}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HomepageFeedAndBlog() {
  return (
    <>
      <section className="container mx-auto px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <h2 className="mb-2 text-2xl font-bold">Recent chapters</h2>
        <p className="mb-6 text-sm text-muted-foreground">Live feed of what just dropped.</p>
        <FeedSection />
      </section>
      <div className="border-t border-border/30">
        <BlogSection />
      </div>
    </>
  );
}

export function HomepageBrowseCta({ label = 'Explore library' }: { label?: string }) {
  return (
    <Button asChild size="lg" className="min-h-11 px-6">
      <Link to="/browse">
        {label}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Link>
    </Button>
  );
}

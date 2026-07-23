import { useState } from 'react';
import { Link } from 'react-router-dom';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';
import { SelectableHomepage } from '@/components/homepage/designs/SelectableHomepage';
import {
  HOMEPAGE_DESIGN_META,
  setGlobalHomepageDesign,
  type HomepageDesignId,
} from '@/features/homepage/homepageDesign';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const DESIGN_IDS: HomepageDesignId[] = ['A', 'B', 'C', 'D'];

/**
 * Demo page to compare all four homepage designs side-by-side via tabs.
 * Mounted at `/demo/home-styles`.
 */
export default function DemoHomeStyles() {
  const [active, setActive] = useState<HomepageDesignId>('C');

  const applyGlobally = () => {
    setGlobalHomepageDesign(active);
  };

  return (
    <>
      <EnhancedSEOHelmet title="Homepage styles (demo)" noindex />
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-xl">
        <div className="container mx-auto flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Demo preview</p>
            <h1 className="text-lg font-bold">Homepage design compare</h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {DESIGN_IDS.map((id) => (
              <Button
                key={id}
                type="button"
                size="sm"
                variant={active === id ? 'default' : 'outline'}
                onClick={() => setActive(id)}
                className={cn('min-h-9')}
              >
                {id} — {HOMEPAGE_DESIGN_META[id].label.split(' ')[0]}
              </Button>
            ))}
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={applyGlobally}>
              Set {active} as site default
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link to="/">View live home</Link>
            </Button>
          </div>
        </div>
      </div>
      <SelectableHomepage designId={active} />
    </>
  );
}

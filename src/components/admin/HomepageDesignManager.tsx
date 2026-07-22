import { useState } from 'react';
import { Check, Home, RotateCcw, Save } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import {
  getGlobalHomepageDesign,
  HOMEPAGE_DESIGN_DEFAULT,
  HOMEPAGE_DESIGN_META,
  setGlobalHomepageDesign,
  type HomepageDesignId,
} from '@/features/homepage/homepageDesign';

const DESIGN_IDS: HomepageDesignId[] = ['A', 'B', 'C', 'D'];

export function HomepageDesignManager() {
  const { toast } = useToast();
  const [design, setDesign] = useState<HomepageDesignId>(() => getGlobalHomepageDesign());
  const [saved, setSaved] = useState<HomepageDesignId>(() => getGlobalHomepageDesign());
  const isDirty = design !== saved;

  const handleSave = () => {
    setGlobalHomepageDesign(design);
    setSaved(design);
    toast({ title: 'Homepage design saved', description: `Site default is now ${HOMEPAGE_DESIGN_META[design].label}.` });
  };

  const handleReset = () => {
    setGlobalHomepageDesign(null);
    setDesign(HOMEPAGE_DESIGN_DEFAULT);
    setSaved(HOMEPAGE_DESIGN_DEFAULT);
    toast({ title: 'Reset complete', description: `Default restored to ${HOMEPAGE_DESIGN_META[HOMEPAGE_DESIGN_DEFAULT].label}.` });
  };

  return (
    <div className="mx-auto w-full max-w-[1400px] space-y-8">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold sm:text-3xl">
          <Home className="h-6 w-6 text-primary" />
          Homepage design
        </h1>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          Choose the default public homepage layout. Preview all four on{' '}
          <Link to="/demo/home-styles" className="text-primary underline" target="_blank">
            /demo/home-styles
          </Link>
          .
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {DESIGN_IDS.map((id) => {
          const meta = HOMEPAGE_DESIGN_META[id];
          const selected = design === id;
          return (
            <button
              key={id}
              type="button"
              onClick={() => setDesign(id)}
              aria-pressed={selected}
              className={cn(
                'flex flex-col gap-3 rounded-2xl border-2 p-5 text-left transition-all',
                selected ? 'border-primary bg-primary/5' : 'border-border/50 hover:border-primary/30'
              )}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Layout {id}</span>
                {selected && (
                  <Badge className="gap-1">
                    <Check className="h-3 w-3" />
                    Selected
                  </Badge>
                )}
                {id === HOMEPAGE_DESIGN_DEFAULT && (
                  <Badge variant="outline" className="text-muted-foreground">
                    Built-in default
                  </Badge>
                )}
              </div>
              <p className="text-lg font-semibold">{meta.label}</p>
              <p className="text-sm text-muted-foreground">{meta.description}</p>
            </button>
          );
        })}
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-3 pt-6">
          <span className="text-sm text-muted-foreground">
            {isDirty ? 'Unsaved changes' : 'All changes saved'}
          </span>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" className="min-h-11 gap-2" onClick={handleReset}>
              <RotateCcw className="h-4 w-4" />
              Reset to default (C)
            </Button>
            <Button type="button" className="min-h-11 gap-2" onClick={handleSave} disabled={!isDirty}>
              <Save className="h-4 w-4" />
              Save global design
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

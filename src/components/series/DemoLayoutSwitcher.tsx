import { useState } from 'react';
import { Palette, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { SeriesLayoutThumbnail } from './SeriesLayoutThumbnail';
import { SERIES_DETAILS_LAYOUT_META, type SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';

const LAYOUT_IDS: SeriesDetailsLayoutId[] = ['A', 'B', 'C', 'D'];

interface DemoLayoutSwitcherProps {
  currentLayout: SeriesDetailsLayoutId;
  onSelect: (layout: SeriesDetailsLayoutId) => void;
  onReset: () => void;
  hasOverride: boolean;
}

/**
 * Public-demo-only "Try another layout" control. Instantly swaps the
 * series-details layout for this browser (localStorage), never touches
 * Supabase, and is only ever rendered when the page is running in demo
 * mode (see ModernSeriesDetail's `isDemo` gate).
 */
export function DemoLayoutSwitcher({ currentLayout, onSelect, onReset, hasOverride }: DemoLayoutSwitcherProps) {
  const [open, setOpen] = useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          size="sm"
          className="fixed bottom-5 right-5 z-40 gap-2 rounded-full shadow-xl sm:bottom-6 sm:right-6"
          aria-label="Try another layout (demo preview only)"
        >
          <Palette className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Try another layout</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-[min(92vw,360px)] space-y-3">
        <div>
          <p className="text-sm font-semibold text-foreground">Try another layout</p>
          <p className="text-xs text-muted-foreground">
            Demo preview only — saved to this browser, never sent to a server. Chapters, comments,
            and your light/dark and column choices stay the same.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {LAYOUT_IDS.map((id) => {
            const meta = SERIES_DETAILS_LAYOUT_META[id];
            const selected = currentLayout === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  onSelect(id);
                }}
                aria-pressed={selected}
                className={cn(
                  'rounded-lg border p-2 text-left transition-colors',
                  selected ? 'border-primary bg-primary/5' : 'border-border/40 hover:border-primary/30'
                )}
              >
                <SeriesLayoutThumbnail layoutId={id} selected={selected} />
                <p className="mt-1.5 text-[11px] font-medium text-foreground">{meta.label}</p>
              </button>
            );
          })}
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="w-full min-h-9 gap-2"
          disabled={!hasOverride}
          onClick={() => {
            onReset();
          }}
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          Reset to site default
        </Button>
      </PopoverContent>
    </Popover>
  );
}

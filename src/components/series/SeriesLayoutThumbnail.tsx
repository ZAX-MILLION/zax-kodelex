import { cn } from '@/lib/utils';
import type { SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';

/** Small visual preview of layout A/B/C/D — shared by admin controls, the
 * demo layout switcher, and the demo styles comparison page. */
export function SeriesLayoutThumbnail({
  layoutId,
  selected,
}: {
  layoutId: SeriesDetailsLayoutId;
  selected: boolean;
}) {
  return (
    <div
      className={cn(
        'relative h-20 w-full overflow-hidden rounded-lg border bg-muted/30 sm:h-24',
        selected ? 'border-primary ring-2 ring-primary/40' : 'border-border/40'
      )}
      aria-hidden
    >
      {layoutId === 'A' && (
        <div className="flex h-full gap-1 p-2">
          <div className="w-1/3 rounded bg-primary/30" />
          <div className="flex flex-1 flex-col gap-1">
            <div className="h-2 w-3/4 rounded bg-foreground/20" />
            <div className="h-1.5 w-1/2 rounded bg-muted-foreground/30" />
            <div className="mt-auto h-4 rounded bg-primary/20" />
          </div>
        </div>
      )}
      {layoutId === 'B' && (
        <div className="relative h-full">
          <div className="absolute inset-0 bg-gradient-to-b from-primary/25 to-background/80" />
          <div className="relative flex h-full flex-col items-center justify-end gap-1 p-2 pb-3">
            <div className="h-10 w-8 rounded bg-primary/40" />
            <div className="h-2 w-2/3 rounded bg-foreground/25" />
            <div className="h-3 w-1/2 rounded-full bg-primary/50" />
          </div>
        </div>
      )}
      {layoutId === 'C' && (
        <div className="flex h-full flex-col gap-1 p-2">
          <div className="flex gap-1">
            <div className="h-8 w-6 shrink-0 rounded bg-primary/30" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full rounded bg-foreground/20" />
              <div className="h-1 w-2/3 rounded bg-muted-foreground/25" />
            </div>
          </div>
          <div className="mt-1 space-y-0.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-2 rounded bg-muted-foreground/15" />
            ))}
          </div>
        </div>
      )}
      {layoutId === 'D' && (
        <div className="flex h-full flex-col gap-1 p-2">
          <div className="flex gap-1">
            <div className="h-7 w-5 shrink-0 rounded bg-primary/30" />
            <div className="flex flex-1 flex-col gap-0.5">
              <div className="h-1.5 w-full rounded bg-foreground/20" />
              <div className="h-1 w-1/2 rounded bg-muted-foreground/25" />
              <div className="h-1 w-3/4 rounded bg-primary/25" />
            </div>
          </div>
          <div className="mt-0.5 space-y-0.5">
            {[1, 2].map((i) => (
              <div key={i} className="h-1.5 rounded bg-muted-foreground/15" />
            ))}
          </div>
          <div className="mt-0.5 h-2.5 rounded bg-secondary/30" />
        </div>
      )}
    </div>
  );
}

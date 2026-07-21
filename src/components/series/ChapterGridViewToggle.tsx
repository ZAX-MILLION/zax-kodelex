import { LayoutGrid, LayoutList, Rows3 } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  type SeriesChapterGridView,
  setSeriesChapterGridView,
} from '@/features/series/seriesChapterGridView';
import { cn } from '@/lib/utils';

const OPTIONS: Array<{
  value: SeriesChapterGridView;
  icon: typeof LayoutList;
  label: string;
  tooltip: string;
}> = [
  {
    value: 1,
    icon: LayoutList,
    label: 'List view',
    tooltip: 'One chapter per row — detailed list',
  },
  {
    value: 2,
    icon: Rows3,
    label: 'Compact cards',
    tooltip: 'Two chapters per row — compact cards',
  },
  {
    value: 3,
    icon: LayoutGrid,
    label: 'Dense cards',
    tooltip: 'Three chapters per row — dense cards',
  },
];

interface ChapterGridViewToggleProps {
  value: SeriesChapterGridView;
  onChange: (view: SeriesChapterGridView) => void;
  className?: string;
}

export function ChapterGridViewToggle({ value, onChange, className }: ChapterGridViewToggleProps) {
  return (
    <TooltipProvider delayDuration={300}>
      <ToggleGroup
        type="single"
        value={String(value)}
        onValueChange={(next) => {
          if (!next) return;
          const parsed = parseInt(next, 10) as SeriesChapterGridView;
          setSeriesChapterGridView(parsed);
          onChange(parsed);
        }}
        aria-label="Chapter list layout"
        className={cn('shrink-0 rounded-lg border border-border/40 bg-muted/30 p-0.5', className)}
        data-testid="chapter-grid-view-toggle"
      >
        {OPTIONS.map(({ value: optionValue, icon: Icon, label, tooltip }) => (
          <Tooltip key={optionValue}>
            <TooltipTrigger asChild>
              <ToggleGroupItem
                value={String(optionValue)}
                aria-label={label}
                className={cn(
                  'min-h-9 min-w-9 px-2 data-[state=on]:bg-background data-[state=on]:text-primary data-[state=on]:shadow-sm'
                )}
              >
                <Icon className="h-4 w-4" />
              </ToggleGroupItem>
            </TooltipTrigger>
            <TooltipContent side="bottom">{tooltip}</TooltipContent>
          </Tooltip>
        ))}
      </ToggleGroup>
    </TooltipProvider>
  );
}

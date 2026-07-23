import { Badge } from '@/components/ui/badge';
import { CheckCircle, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChapterStatus } from '@/features/series/seriesChapterTypes';

export function ChapterAccessBadge({
  status,
  unlockCost,
  compact,
}: {
  status: ChapterStatus;
  unlockCost: number;
  compact?: boolean;
}) {
  const className = compact ? 'gap-0.5 text-[10px] px-1.5 py-0' : 'gap-1 text-xs';
  if (status === 'locked') {
    return (
      <Badge variant="destructive" className={className}>
        <Lock className="h-3 w-3" />
        {unlockCost} coins
      </Badge>
    );
  }
  if (status === 'locked-premium') {
    return (
      <Badge variant="destructive" className={className}>
        <Lock className="h-3 w-3" />
        Premium
      </Badge>
    );
  }
  if (status === 'unlocked') {
    return (
      <Badge variant="secondary" className={cn(className, 'border-blue-500/30 bg-blue-500/20 text-blue-600')}>
        <Unlock className="h-3 w-3" />
        Unlocked
      </Badge>
    );
  }
  return (
    <Badge variant="default" className={cn(className, 'bg-green-700 text-white hover:bg-green-800')}>
      <CheckCircle className="h-3 w-3" />
      Free
    </Badge>
  );
}

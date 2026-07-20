import type { SeriesDetailsLayoutId } from '@/features/series/seriesDetailsLayout';
import type { SeriesDetailViewModel } from '../SeriesDetailHero';
import type { SeriesChapterItem } from '../ModernChapterGrid';
import type { SeriesReadingState } from '@/features/series/seriesReadingProgress';

import type { DemoSeries } from '@/utils/demoLibraryData';

export interface SeriesDetailLayoutShellProps {
  series: SeriesDetailViewModel & { details_background_url?: string | null };
  chapters: SeriesChapterItem[];
  relatedSeries: DemoSeries[];
  layoutId: SeriesDetailsLayoutId;
  isDemo: boolean;
  seriesIndex: number;
  accessBadges: Array<'free' | 'coins' | 'premium'>;
  startChapter: number;
  continueLabel: string;
  readingState: SeriesReadingState;
  onContinue: () => void;
  onLibraryToggle: () => void;
  onShare: () => void;
}

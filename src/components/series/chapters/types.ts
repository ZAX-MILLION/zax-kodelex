import type { ChapterItemDisplayState, SeriesChapterItem } from '@/features/series/seriesChapterTypes';
import type { SeriesChapterGridView } from '@/features/series/seriesChapterGridView';

export interface ChapterListRendererProps {
  items: ChapterItemDisplayState[];
  gridView: SeriesChapterGridView;
  columnClassName: string;
  onChapterClick: (chapter: SeriesChapterItem) => void;
}

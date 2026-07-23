import type { SeriesDetailsLayoutId } from './seriesDetailsLayout';
import type { ChapterListVariant } from './seriesChapterTypes';

/** Maps a series-details layout to its chapter/comments presentation identity. */
export const LAYOUT_PRESENTATION_VARIANT: Record<SeriesDetailsLayoutId, ChapterListVariant> = {
  A: 'editorial',
  B: 'cinematic',
  C: 'catalogue',
  D: 'compact',
};

export function getChapterListVariant(layoutId: SeriesDetailsLayoutId): ChapterListVariant {
  return LAYOUT_PRESENTATION_VARIANT[layoutId];
}

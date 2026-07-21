/**
 * Series details chapter list column preference (1 / 2 / 3 per row).
 * Persisted for returning visitors; responsive caps apply in CSS helpers below.
 */

export type SeriesChapterGridView = 1 | 2 | 3;

export const SERIES_CHAPTER_GRID_VIEW_DEFAULT: SeriesChapterGridView = 1;

const STORAGE_KEY = 'zax-series-chapter-grid-view';

const VALID: SeriesChapterGridView[] = [1, 2, 3];

export function isSeriesChapterGridView(value: unknown): value is SeriesChapterGridView {
  const n = typeof value === 'string' ? parseInt(value, 10) : value;
  return typeof n === 'number' && VALID.includes(n as SeriesChapterGridView);
}

export function getSeriesChapterGridView(): SeriesChapterGridView {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw == null) return SERIES_CHAPTER_GRID_VIEW_DEFAULT;
    const parsed = parseInt(raw, 10);
    return isSeriesChapterGridView(parsed) ? parsed : SERIES_CHAPTER_GRID_VIEW_DEFAULT;
  } catch {
    return SERIES_CHAPTER_GRID_VIEW_DEFAULT;
  }
}

export function setSeriesChapterGridView(view: SeriesChapterGridView) {
  try {
    localStorage.setItem(STORAGE_KEY, String(view));
  } catch {
    /* ignore quota */
  }
}

/** Tailwind grid classes: mobile always 1 col; tablet up to 2; desktop up to 3. */
export function getChapterGridColumnClasses(view: SeriesChapterGridView): string {
  switch (view) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 md:grid-cols-2';
    case 3:
      return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
    default:
      return 'grid-cols-1';
  }
}

export { STORAGE_KEY as SERIES_CHAPTER_GRID_VIEW_KEY };

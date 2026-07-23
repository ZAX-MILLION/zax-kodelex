import type { SeriesDetailsLayoutId } from './seriesDetailsLayout';
import type { SeriesDetailsBgTheme } from './seriesDetailsBackground';

/** Per-layout background defaults merged before global/series theme overrides. */
export const SERIES_DETAILS_LAYOUT_BG_PRESETS: Record<
  SeriesDetailsLayoutId,
  Partial<SeriesDetailsBgTheme>
> = {
  A: {
    position: 'center',
    overlayDarkness: 62,
    blur: 4,
    attachment: 'fixed',
    accentColor: null,
  },
  B: {
    position: 'center',
    overlayDarkness: 52,
    blur: 5,
    attachment: 'fixed',
    accentColor: null,
  },
  C: {
    position: 'top',
    overlayDarkness: 90,
    blur: 0,
    attachment: 'scroll',
    accentColor: null,
  },
  D: {
    position: 'top',
    overlayDarkness: 93,
    blur: 0,
    attachment: 'scroll',
    accentColor: null,
  },
};

export function getLayoutBgPreset(layoutId: SeriesDetailsLayoutId): Partial<SeriesDetailsBgTheme> {
  return { ...SERIES_DETAILS_LAYOUT_BG_PRESETS[layoutId] };
}

/**
 * Admin helpers for global series-details design (layout, appearance, background).
 * Global defaults persist in localStorage; per-series overrides use the existing
 * layout/appearance/background modules plus `seriesDetailsAdminSync` for DB writes.
 */
import {
  APPEARANCE_DEFAULT,
  getGlobalAppearanceMode,
  setGlobalAppearanceMode,
  clearSeriesAppearanceOverride,
  type AppearanceMode,
} from '@/features/appearance/appearanceMode';
import {
  clearSeriesDetailsLayoutOverride,
  getGlobalSeriesDetailsLayout,
  SERIES_DETAILS_LAYOUT_DEFAULT,
  setGlobalSeriesDetailsLayout,
  type SeriesDetailsLayoutId,
} from './seriesDetailsLayout';
import {
  clearSeriesDetailsBackgroundOverride,
  clearSeriesDetailsBgThemeOverride,
  DEFAULT_SERIES_DETAILS_BG_THEME,
  getGlobalSeriesDetailsBackground,
  getGlobalSeriesDetailsBgTheme,
  setGlobalSeriesDetailsBackground,
  setGlobalSeriesDetailsBgTheme,
  type SeriesDetailsBgTheme,
} from './seriesDetailsBackground';
import { getFeaturedDemoSeries } from '@/utils/demoLibraryData';

export interface GlobalSeriesDesignDraft {
  layout: SeriesDetailsLayoutId;
  appearance: AppearanceMode;
  backgroundUrl: string;
  backgroundTheme: SeriesDetailsBgTheme;
}

export function readGlobalSeriesDesignDraft(): GlobalSeriesDesignDraft {
  return {
    layout: getGlobalSeriesDetailsLayout() || SERIES_DETAILS_LAYOUT_DEFAULT,
    appearance: getGlobalAppearanceMode(),
    backgroundUrl: getGlobalSeriesDetailsBackground() || '',
    backgroundTheme: { ...getGlobalSeriesDetailsBgTheme() },
  };
}

export function saveGlobalSeriesDesign(draft: GlobalSeriesDesignDraft): void {
  setGlobalSeriesDetailsLayout(draft.layout);
  setGlobalAppearanceMode(draft.appearance);
  setGlobalSeriesDetailsBackground(draft.backgroundUrl.trim() || null);
  setGlobalSeriesDetailsBgTheme(draft.backgroundTheme);
}

export function resetGlobalSeriesDesign(): GlobalSeriesDesignDraft {
  setGlobalSeriesDetailsLayout(null);
  setGlobalAppearanceMode(null);
  setGlobalSeriesDetailsBackground(null);
  setGlobalSeriesDetailsBgTheme(DEFAULT_SERIES_DETAILS_BG_THEME);
  return readGlobalSeriesDesignDraft();
}

/** Clears all per-series design overrides (layout, appearance, background). */
export function clearAllSeriesDesignOverrides(seriesId: string): void {
  clearSeriesDetailsLayoutOverride(seriesId);
  clearSeriesAppearanceOverride(seriesId);
  clearSeriesDetailsBackgroundOverride(seriesId);
  clearSeriesDetailsBgThemeOverride(seriesId);
}

/** Sample series used for admin live preview and “Preview series page”. */
export function getSamplePreviewSeriesId(): string {
  const featured = getFeaturedDemoSeries();
  return featured[0]?.id || '00000000-0000-4000-a000-000000000001';
}

export function getDefaultGlobalSeriesDesign(): GlobalSeriesDesignDraft {
  return {
    layout: SERIES_DETAILS_LAYOUT_DEFAULT,
    appearance: APPEARANCE_DEFAULT,
    backgroundUrl: '',
    backgroundTheme: { ...DEFAULT_SERIES_DETAILS_BG_THEME },
  };
}

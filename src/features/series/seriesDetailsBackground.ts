/**
 * Manga / series details page background resolution.
 * Priority: per-series override → catalogue custom → global theme → blurred cover → built-in JPG.
 * Demo/local overrides persist in session-friendly localStorage without requiring migrations.
 */

export const SERIES_DETAILS_BG_FALLBACK = '/assets/series-details-bg-default.jpg';

const GLOBAL_KEY = 'zax-series-details-bg-global';
const OVERRIDES_KEY = 'zax-series-details-bg-overrides';
const GLOBAL_THEME_KEY = 'zax-series-details-bg-theme-global';
const THEME_OVERRIDES_KEY = 'zax-series-details-bg-theme-overrides';

export type SeriesDetailsBgSource = 'series' | 'global' | 'cover' | 'fallback';

export type SeriesDetailsBgPosition = 'center' | 'top' | 'bottom';
export type SeriesDetailsBgAttachment = 'fixed' | 'scroll';

export interface SeriesDetailsBgTheme {
  position: SeriesDetailsBgPosition;
  overlayDarkness: number;
  blur: number;
  accentColor: string | null;
  attachment: SeriesDetailsBgAttachment;
}

export const DEFAULT_SERIES_DETAILS_BG_THEME: SeriesDetailsBgTheme = {
  position: 'center',
  overlayDarkness: 72,
  blur: 3,
  accentColor: null,
  attachment: 'fixed',
};

export interface ResolvedSeriesDetailsBackground {
  url: string;
  source: SeriesDetailsBgSource;
  theme: SeriesDetailsBgTheme;
}

function readOverrides(): Record<string, string> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, string> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (typeof v === 'string' && v.trim()) out[k] = v.trim();
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(map: Record<string, string>) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

function readThemeOverrides(): Record<string, Partial<SeriesDetailsBgTheme>> {
  try {
    const raw = localStorage.getItem(THEME_OVERRIDES_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, Partial<SeriesDetailsBgTheme>>;
  } catch {
    return {};
  }
}

function writeThemeOverrides(map: Record<string, Partial<SeriesDetailsBgTheme>>) {
  try {
    localStorage.setItem(THEME_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore */
  }
}

function mergeTheme(
  ...layers: Array<Partial<SeriesDetailsBgTheme> | null | undefined>
): SeriesDetailsBgTheme {
  const out = { ...DEFAULT_SERIES_DETAILS_BG_THEME };
  for (const layer of layers) {
    if (!layer) continue;
    if (layer.position) out.position = layer.position;
    if (typeof layer.overlayDarkness === 'number') {
      out.overlayDarkness = Math.min(95, Math.max(40, layer.overlayDarkness));
    }
    if (typeof layer.blur === 'number') {
      out.blur = Math.min(12, Math.max(0, layer.blur));
    }
    if (layer.accentColor !== undefined) out.accentColor = layer.accentColor;
    if (layer.attachment) out.attachment = layer.attachment;
  }
  return out;
}

export function getGlobalSeriesDetailsBackground(): string | null {
  try {
    const v = localStorage.getItem(GLOBAL_KEY)?.trim();
    return v || null;
  } catch {
    return null;
  }
}

export function setGlobalSeriesDetailsBackground(url: string | null) {
  try {
    if (!url?.trim()) localStorage.removeItem(GLOBAL_KEY);
    else localStorage.setItem(GLOBAL_KEY, url.trim());
  } catch {
    /* ignore */
  }
}

export function getSeriesDetailsBackgroundOverride(seriesId: string): string | null {
  const map = readOverrides();
  return map[seriesId] || null;
}

export function setSeriesDetailsBackgroundOverride(seriesId: string, url: string | null) {
  const map = readOverrides();
  if (!url?.trim()) delete map[seriesId];
  else map[seriesId] = url.trim();
  writeOverrides(map);
}

export function clearSeriesDetailsBackgroundOverride(seriesId: string) {
  setSeriesDetailsBackgroundOverride(seriesId, null);
}

export function getGlobalSeriesDetailsBgTheme(): SeriesDetailsBgTheme {
  try {
    const raw = localStorage.getItem(GLOBAL_THEME_KEY);
    if (!raw) return { ...DEFAULT_SERIES_DETAILS_BG_THEME };
    return mergeTheme(DEFAULT_SERIES_DETAILS_BG_THEME, JSON.parse(raw) as Partial<SeriesDetailsBgTheme>);
  } catch {
    return { ...DEFAULT_SERIES_DETAILS_BG_THEME };
  }
}

export function setGlobalSeriesDetailsBgTheme(theme: Partial<SeriesDetailsBgTheme>) {
  try {
    localStorage.setItem(GLOBAL_THEME_KEY, JSON.stringify(mergeTheme(DEFAULT_SERIES_DETAILS_BG_THEME, theme)));
  } catch {
    /* ignore */
  }
}

export function getSeriesDetailsBgThemeOverride(seriesId: string): Partial<SeriesDetailsBgTheme> | null {
  const map = readThemeOverrides();
  return map[seriesId] || null;
}

export function setSeriesDetailsBgThemeOverride(seriesId: string, theme: Partial<SeriesDetailsBgTheme> | null) {
  const map = readThemeOverrides();
  if (!theme || Object.keys(theme).length === 0) delete map[seriesId];
  else map[seriesId] = theme;
  writeThemeOverrides(map);
}

export function clearSeriesDetailsBgThemeOverride(seriesId: string) {
  setSeriesDetailsBgThemeOverride(seriesId, null);
}

export function resolveSeriesDetailsBgTheme(
  seriesId?: string,
  layoutPreset?: Partial<SeriesDetailsBgTheme> | null,
  dbThemeOverride?: Partial<SeriesDetailsBgTheme> | null
): SeriesDetailsBgTheme {
  const global = getGlobalSeriesDetailsBgTheme();
  if (!seriesId) {
    return mergeTheme(DEFAULT_SERIES_DETAILS_BG_THEME, global, layoutPreset, dbThemeOverride);
  }
  const seriesOverride = getSeriesDetailsBgThemeOverride(seriesId);
  return mergeTheme(
    DEFAULT_SERIES_DETAILS_BG_THEME,
    global,
    layoutPreset,
    dbThemeOverride,
    seriesOverride
  );
}

/**
 * Resolve the background URL for a series details page.
 * `seriesCustomUrl` is metadata from the series record (demo catalogue / future DB field).
 * Local URL overrides win over catalogue metadata so theme users can preview without migrations.
 */
export function resolveSeriesDetailsBackground(options: {
  seriesId: string;
  seriesCustomUrl?: string | null;
  globalDefaultUrl?: string | null;
  coverImageUrl?: string | null;
  layoutPreset?: Partial<SeriesDetailsBgTheme> | null;
  /** Per-series theme persisted in the database (staging/production). */
  dbThemeOverride?: Partial<SeriesDetailsBgTheme> | null;
}): ResolvedSeriesDetailsBackground {
  const theme = resolveSeriesDetailsBgTheme(
    options.seriesId,
    options.layoutPreset,
    options.dbThemeOverride
  );

  const localOverride = getSeriesDetailsBackgroundOverride(options.seriesId);
  if (localOverride) {
    return { url: localOverride, source: 'series', theme };
  }

  const seriesCustom = options.seriesCustomUrl?.trim();
  if (seriesCustom) {
    return { url: seriesCustom, source: 'series', theme };
  }

  const global =
    options.globalDefaultUrl?.trim() || getGlobalSeriesDetailsBackground() || null;
  if (global) {
    return { url: global, source: 'global', theme };
  }

  const cover = options.coverImageUrl?.trim();
  if (cover) {
    return { url: cover, source: 'cover', theme };
  }

  return { url: SERIES_DETAILS_BG_FALLBACK, source: 'fallback', theme };
}

/** Optimize remote URLs for a soft background; leave local assets unchanged. */
export function getOptimizedSeriesDetailsBgUrl(url: string, maxWidth = 1600): string {
  if (!url || url.startsWith('/') || url.startsWith('./') || url.endsWith('.svg')) {
    return url;
  }
  if (url.includes('picsum.photos')) {
    try {
      const u = new URL(url);
      const parts = u.pathname.split('/').filter(Boolean);
      if (parts.includes('seed')) {
        const seed = parts[parts.indexOf('seed') + 1];
        return `https://picsum.photos/seed/${seed}/${maxWidth}/${Math.round(maxWidth * 0.56)}`;
      }
    } catch {
      /* fall through */
    }
  }
  if (url.includes('images.unsplash.com')) {
    const joiner = url.includes('?') ? '&' : '?';
    return `${url}${joiner}w=${maxWidth}&q=60&auto=format&fit=crop`;
  }
  return url;
}

export function getSeriesDetailsBgPositionStyle(
  position: SeriesDetailsBgPosition
): string {
  switch (position) {
    case 'top':
      return 'center top';
    case 'bottom':
      return 'center bottom';
    default:
      return 'center center';
  }
}


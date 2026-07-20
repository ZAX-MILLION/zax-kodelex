/**
 * Manga / series details page background resolution.
 * Priority: per-series override → global theme default → built-in fallback.
 * Demo/local overrides persist in session-friendly localStorage without requiring migrations.
 */

export const SERIES_DETAILS_BG_FALLBACK = '/assets/series-details-bg-default.jpg';

const GLOBAL_KEY = 'zax-series-details-bg-global';
const OVERRIDES_KEY = 'zax-series-details-bg-overrides';

export type SeriesDetailsBgSource = 'series' | 'global' | 'fallback';

export interface ResolvedSeriesDetailsBackground {
  url: string;
  source: SeriesDetailsBgSource;
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

/**
 * Resolve the background URL for a series details page.
 * `seriesCustomUrl` is metadata from the series record (demo catalogue / future DB field).
 * Local overrides win over catalogue metadata so theme users can preview without migrations.
 */
export function resolveSeriesDetailsBackground(options: {
  seriesId: string;
  seriesCustomUrl?: string | null;
  globalDefaultUrl?: string | null;
}): ResolvedSeriesDetailsBackground {
  const localOverride = getSeriesDetailsBackgroundOverride(options.seriesId);
  if (localOverride) {
    return { url: localOverride, source: 'series' };
  }

  const seriesCustom = options.seriesCustomUrl?.trim();
  if (seriesCustom) {
    return { url: seriesCustom, source: 'series' };
  }

  const global =
    options.globalDefaultUrl?.trim() || getGlobalSeriesDetailsBackground() || null;
  if (global) {
    return { url: global, source: 'global' };
  }

  return { url: SERIES_DETAILS_BG_FALLBACK, source: 'fallback' };
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

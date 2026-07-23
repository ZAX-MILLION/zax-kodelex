/**
 * Site-wide Light / Dark / System appearance.
 *
 * Resolution priority (matches the series-details layout/background pattern):
 *   database-persisted per-series override (staging/production)
 *     → local per-series override (demo/admin preview, localStorage)
 *     → global user preference (localStorage)
 *     → built-in default ('dark', preserving ZAX Million's existing brand look
 *       for anyone who has never chosen a preference).
 *
 * IMPORTANT: the storage keys below are duplicated verbatim in the inline
 * anti-FOUC script in `index.html` so the very first paint already has the
 * right class before React hydrates. Keep both in sync if you rename a key.
 */

export type AppearanceMode = 'light' | 'dark' | 'system';
export type EffectiveScheme = 'light' | 'dark';

export const APPEARANCE_DEFAULT: AppearanceMode = 'dark';

const GLOBAL_KEY = 'zax-appearance-global';
const SERIES_OVERRIDES_KEY = 'zax-appearance-series-overrides';

const VALID_MODES: AppearanceMode[] = ['light', 'dark', 'system'];

function isAppearanceMode(value: unknown): value is AppearanceMode {
  return typeof value === 'string' && VALID_MODES.includes(value as AppearanceMode);
}

function readOverrides(): Record<string, AppearanceMode> {
  try {
    const raw = localStorage.getItem(SERIES_OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, AppearanceMode> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (isAppearanceMode(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(map: Record<string, AppearanceMode>) {
  try {
    localStorage.setItem(SERIES_OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function getGlobalAppearanceMode(): AppearanceMode {
  try {
    const v = localStorage.getItem(GLOBAL_KEY);
    return isAppearanceMode(v) ? v : APPEARANCE_DEFAULT;
  } catch {
    return APPEARANCE_DEFAULT;
  }
}

export function setGlobalAppearanceMode(mode: AppearanceMode | null) {
  try {
    if (!mode) localStorage.removeItem(GLOBAL_KEY);
    else localStorage.setItem(GLOBAL_KEY, mode);
  } catch {
    /* ignore */
  }
}

export function getSeriesAppearanceOverride(seriesId: string): AppearanceMode | null {
  return readOverrides()[seriesId] || null;
}

export function setSeriesAppearanceOverride(seriesId: string, mode: AppearanceMode | null) {
  const map = readOverrides();
  if (!mode) delete map[seriesId];
  else map[seriesId] = mode;
  writeOverrides(map);
}

export function clearSeriesAppearanceOverride(seriesId: string) {
  setSeriesAppearanceOverride(seriesId, null);
}

/**
 * Resolve the appearance *mode* (may still be 'system') for a context.
 * Priority: dbOverride (real per-series DB value) → local series override
 * (demo/admin preview) → global preference → built-in default.
 */
export function resolveAppearanceMode(seriesId?: string, dbOverride?: string | null): AppearanceMode {
  if (isAppearanceMode(dbOverride)) return dbOverride;
  if (seriesId) {
    const seriesOverride = getSeriesAppearanceOverride(seriesId);
    if (seriesOverride) return seriesOverride;
  }
  return getGlobalAppearanceMode();
}

export function getSystemPrefersDark(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return APPEARANCE_DEFAULT === 'dark';
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

/** Collapse a possibly-'system' mode into a concrete 'light' | 'dark' scheme. */
export function resolveEffectiveScheme(mode: AppearanceMode): EffectiveScheme {
  if (mode === 'system') return getSystemPrefersDark() ? 'dark' : 'light';
  return mode;
}

/** Apply a concrete scheme to the document root (matches ThemeCustomizer's classList pattern). */
export function applyEffectiveScheme(scheme: EffectiveScheme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.classList.remove('light', 'dark');
  root.classList.add(scheme);
  root.style.colorScheme = scheme;
}

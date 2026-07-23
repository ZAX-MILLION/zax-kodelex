/**
 * Manga / series details page layout selection.
 * Priority: per-series override → global default → Layout A (Editorial).
 */

export type SeriesDetailsLayoutId = 'A' | 'B' | 'C' | 'D';

export const SERIES_DETAILS_LAYOUT_DEFAULT: SeriesDetailsLayoutId = 'A';

export const SERIES_DETAILS_LAYOUT_META: Record<
  SeriesDetailsLayoutId,
  { label: string; description: string }
> = {
  A: {
    label: 'Layout A — Editorial',
    description: 'Cover beside title, dense chapters, restrained background.',
  },
  B: {
    label: 'Layout B — Cinematic',
    description: 'Large hero with cinematic background, prominent start action.',
  },
  C: {
    label: 'Layout C — Compact Catalogue',
    description: 'Dense catalogue strip with genre chips and tile browsing.',
  },
  D: {
    label: 'Layout D — Chapter Index',
    description: 'Minimal identity strip; dense chapter list dominates immediately.',
  },
};

const GLOBAL_KEY = 'zax-series-details-layout-global';
const OVERRIDES_KEY = 'zax-series-details-layout-overrides';

const VALID: SeriesDetailsLayoutId[] = ['A', 'B', 'C', 'D'];

function isLayoutId(value: unknown): value is SeriesDetailsLayoutId {
  return typeof value === 'string' && VALID.includes(value as SeriesDetailsLayoutId);
}

function readOverrides(): Record<string, SeriesDetailsLayoutId> {
  try {
    const raw = localStorage.getItem(OVERRIDES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const out: Record<string, SeriesDetailsLayoutId> = {};
    for (const [k, v] of Object.entries(parsed)) {
      if (isLayoutId(v)) out[k] = v;
    }
    return out;
  } catch {
    return {};
  }
}

function writeOverrides(map: Record<string, SeriesDetailsLayoutId>) {
  try {
    localStorage.setItem(OVERRIDES_KEY, JSON.stringify(map));
  } catch {
    /* ignore quota */
  }
}

export function getGlobalSeriesDetailsLayout(): SeriesDetailsLayoutId | null {
  try {
    const v = localStorage.getItem(GLOBAL_KEY);
    return isLayoutId(v) ? v : null;
  } catch {
    return null;
  }
}

export function setGlobalSeriesDetailsLayout(layout: SeriesDetailsLayoutId | null) {
  try {
    if (!layout) localStorage.removeItem(GLOBAL_KEY);
    else localStorage.setItem(GLOBAL_KEY, layout);
  } catch {
    /* ignore */
  }
}

export function getSeriesDetailsLayoutOverride(seriesId: string): SeriesDetailsLayoutId | null {
  return readOverrides()[seriesId] || null;
}

export function setSeriesDetailsLayoutOverride(
  seriesId: string,
  layout: SeriesDetailsLayoutId | null
) {
  const map = readOverrides();
  if (!layout) delete map[seriesId];
  else map[seriesId] = layout;
  writeOverrides(map);
}

export function clearSeriesDetailsLayoutOverride(seriesId: string) {
  setSeriesDetailsLayoutOverride(seriesId, null);
}

/**
 * Resolve layout for a series details page.
 * Priority: database-persisted series override (staging/production) → local preview
 * series override (demo/admin preview) → global default → A (Editorial).
 */
export function resolveSeriesDetailsLayout(
  seriesId?: string,
  dbOverride?: string | null
): SeriesDetailsLayoutId {
  if (isLayoutId(dbOverride)) return dbOverride;
  if (seriesId) {
    const seriesOverride = getSeriesDetailsLayoutOverride(seriesId);
    if (seriesOverride) return seriesOverride;
  }
  const global = getGlobalSeriesDetailsLayout();
  if (global) return global;
  return SERIES_DETAILS_LAYOUT_DEFAULT;
}

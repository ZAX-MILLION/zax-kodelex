import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSeriesDetailsLayoutOverride,
  getGlobalSeriesDetailsLayout,
  getSeriesDetailsLayoutOverride,
  resolveSeriesDetailsLayout,
  SERIES_DETAILS_LAYOUT_DEFAULT,
  setGlobalSeriesDetailsLayout,
  setSeriesDetailsLayoutOverride,
} from '../../src/features/series/seriesDetailsLayout';

function createStorageMock() {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => (store.has(key) ? store.get(key)! : null),
    setItem: (key: string, value: string) => {
      store.set(key, value);
    },
    removeItem: (key: string) => {
      store.delete(key);
    },
    clear: () => {
      store.clear();
    },
  };
}

describe('resolveSeriesDetailsLayout', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('defaults to Layout A when nothing configured', () => {
    expect(resolveSeriesDetailsLayout('demo-series-1')).toBe(SERIES_DETAILS_LAYOUT_DEFAULT);
    expect(SERIES_DETAILS_LAYOUT_DEFAULT).toBe('A');
  });

  it('uses global default before fallback A', () => {
    setGlobalSeriesDetailsLayout('B');
    expect(resolveSeriesDetailsLayout('demo-series-1')).toBe('B');
  });

  it('prefers per-series override over global', () => {
    setGlobalSeriesDetailsLayout('B');
    setSeriesDetailsLayoutOverride('demo-series-1', 'C');
    expect(resolveSeriesDetailsLayout('demo-series-1')).toBe('C');
  });

  it('clears series override and falls back to global', () => {
    setGlobalSeriesDetailsLayout('B');
    setSeriesDetailsLayoutOverride('demo-series-1', 'C');
    clearSeriesDetailsLayoutOverride('demo-series-1');
    expect(getSeriesDetailsLayoutOverride('demo-series-1')).toBeNull();
    expect(resolveSeriesDetailsLayout('demo-series-1')).toBe('B');
  });

  it('reset global returns to Layout A', () => {
    setGlobalSeriesDetailsLayout('C');
    setGlobalSeriesDetailsLayout(null);
    expect(getGlobalSeriesDetailsLayout()).toBeNull();
    expect(resolveSeriesDetailsLayout()).toBe('A');
  });

  it('accepts Layout D — Chapter Index as a valid override', () => {
    setSeriesDetailsLayoutOverride('demo-series-1', 'D');
    expect(resolveSeriesDetailsLayout('demo-series-1')).toBe('D');
  });

  it('maps A/B/C/D to four distinct layout shell component references', async () => {
    const {
      SERIES_DETAILS_LAYOUT_SHELLS,
      SERIES_DETAILS_LAYOUT_SHELL_FILES,
      getSeriesDetailsLayoutShellLazy,
    } = await import('../../src/components/series/layouts');

    const ids = ['A', 'B', 'C', 'D'] as const;
    const shells = ids.map((id) => getSeriesDetailsLayoutShellLazy(id));
    const unique = new Set(shells);
    expect(unique.size).toBe(4);
    expect(SERIES_DETAILS_LAYOUT_SHELLS.A).not.toBe(SERIES_DETAILS_LAYOUT_SHELLS.B);
    expect(SERIES_DETAILS_LAYOUT_SHELLS.B).not.toBe(SERIES_DETAILS_LAYOUT_SHELLS.C);
    expect(SERIES_DETAILS_LAYOUT_SHELLS.C).not.toBe(SERIES_DETAILS_LAYOUT_SHELLS.D);
    expect(SERIES_DETAILS_LAYOUT_SHELL_FILES).toEqual({
      A: 'SeriesDetailsLayoutEditorial',
      B: 'SeriesDetailsLayoutCinematic',
      C: 'SeriesDetailsLayoutCompact',
      D: 'SeriesDetailsLayoutCompactList',
    });
  });

  it('database-persisted override wins over local override and global default', () => {
    setGlobalSeriesDetailsLayout('B');
    setSeriesDetailsLayoutOverride('demo-series-1', 'C');
    expect(resolveSeriesDetailsLayout('demo-series-1', 'D')).toBe('D');
  });

  it('ignores an invalid database override and falls back through the normal chain', () => {
    setGlobalSeriesDetailsLayout('B');
    expect(resolveSeriesDetailsLayout('demo-series-1', 'not-a-layout')).toBe('B');
    expect(resolveSeriesDetailsLayout('demo-series-1', null)).toBe('B');
  });
});

describe('layout bg presets merge', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('applies cinematic preset for layout B', async () => {
    const { resolveSeriesDetailsBackground } = await import(
      '../../src/features/series/seriesDetailsBackground'
    );
    const { getLayoutBgPreset } = await import(
      '../../src/features/series/seriesDetailsLayoutBgPresets'
    );
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      layoutPreset: getLayoutBgPreset('B'),
    });
    expect(result.theme.attachment).toBe('fixed');
    expect(result.theme.overlayDarkness).toBeLessThan(70);
  });

  it('applies compact minimal preset for layout C', async () => {
    const { resolveSeriesDetailsBackground } = await import(
      '../../src/features/series/seriesDetailsBackground'
    );
    const { getLayoutBgPreset } = await import(
      '../../src/features/series/seriesDetailsLayoutBgPresets'
    );
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      layoutPreset: getLayoutBgPreset('C'),
    });
    expect(result.theme.blur).toBe(0);
    expect(result.theme.overlayDarkness).toBeGreaterThanOrEqual(88);
  });

  it('applies a non-fixed, high-readability preset for layout D (Chapter Index)', async () => {
    const { resolveSeriesDetailsBackground } = await import(
      '../../src/features/series/seriesDetailsBackground'
    );
    const { getLayoutBgPreset } = await import(
      '../../src/features/series/seriesDetailsLayoutBgPresets'
    );
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      layoutPreset: getLayoutBgPreset('D'),
    });
    expect(result.theme.attachment).toBe('scroll');
    expect(result.theme.overlayDarkness).toBeGreaterThanOrEqual(90);
  });
});

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
});

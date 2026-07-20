import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearSeriesDetailsBackgroundOverride,
  getOptimizedSeriesDetailsBgUrl,
  resolveSeriesDetailsBackground,
  SERIES_DETAILS_BG_FALLBACK,
  setGlobalSeriesDetailsBackground,
  setSeriesDetailsBackgroundOverride,
} from '../../src/features/series/seriesDetailsBackground';

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

describe('resolveSeriesDetailsBackground', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('returns built-in fallback when nothing is configured', () => {
    const result = resolveSeriesDetailsBackground({ seriesId: 'demo-series-1' });
    expect(result.url).toBe(SERIES_DETAILS_BG_FALLBACK);
    expect(result.source).toBe('fallback');
  });

  it('uses global default before fallback', () => {
    setGlobalSeriesDetailsBackground('https://example.com/global-bg.jpg');
    const result = resolveSeriesDetailsBackground({ seriesId: 'demo-series-1' });
    expect(result.url).toBe('https://example.com/global-bg.jpg');
    expect(result.source).toBe('global');
  });

  it('uses catalogue series URL before global default', () => {
    setGlobalSeriesDetailsBackground('https://example.com/global-bg.jpg');
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      seriesCustomUrl: 'https://example.com/series-bg.jpg',
    });
    expect(result.url).toBe('https://example.com/series-bg.jpg');
    expect(result.source).toBe('series');
  });

  it('prefers local per-series override over catalogue metadata', () => {
    setSeriesDetailsBackgroundOverride('demo-series-1', 'https://example.com/local-override.jpg');
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      seriesCustomUrl: 'https://example.com/series-bg.jpg',
      globalDefaultUrl: 'https://example.com/global-bg.jpg',
    });
    expect(result.url).toBe('https://example.com/local-override.jpg');
    expect(result.source).toBe('series');
  });

  it('clears local override and falls back through the chain', () => {
    setSeriesDetailsBackgroundOverride('demo-series-1', 'https://example.com/local-override.jpg');
    clearSeriesDetailsBackgroundOverride('demo-series-1');
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      seriesCustomUrl: 'https://example.com/series-bg.jpg',
    });
    expect(result.url).toBe('https://example.com/series-bg.jpg');
    expect(result.source).toBe('series');
  });

  it('respects explicit globalDefaultUrl option over stored global', () => {
    setGlobalSeriesDetailsBackground('https://example.com/stored-global.jpg');
    const result = resolveSeriesDetailsBackground({
      seriesId: 'demo-series-1',
      globalDefaultUrl: 'https://example.com/inline-global.jpg',
    });
    expect(result.url).toBe('https://example.com/inline-global.jpg');
    expect(result.source).toBe('global');
  });
});

describe('getOptimizedSeriesDetailsBgUrl', () => {
  it('leaves local assets unchanged', () => {
    expect(getOptimizedSeriesDetailsBgUrl(SERIES_DETAILS_BG_FALLBACK)).toBe(
      SERIES_DETAILS_BG_FALLBACK
    );
  });

  it('adds width params for unsplash URLs', () => {
    const optimized = getOptimizedSeriesDetailsBgUrl('https://images.unsplash.com/photo-1');
    expect(optimized).toContain('w=1600');
  });

  it('normalizes picsum seed URLs', () => {
    const optimized = getOptimizedSeriesDetailsBgUrl('https://picsum.photos/seed/demo-bg/800/450');
    expect(optimized).toBe('https://picsum.photos/seed/demo-bg/1600/896');
  });
});

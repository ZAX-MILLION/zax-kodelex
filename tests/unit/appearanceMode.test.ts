import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  APPEARANCE_DEFAULT,
  clearSeriesAppearanceOverride,
  getGlobalAppearanceMode,
  getSeriesAppearanceOverride,
  resolveAppearanceMode,
  resolveEffectiveScheme,
  setGlobalAppearanceMode,
  setSeriesAppearanceOverride,
} from '../../src/features/appearance/appearanceMode';

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

describe('resolveAppearanceMode', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('defaults to Dark when nothing is configured (preserves ZAX Million brand look)', () => {
    expect(APPEARANCE_DEFAULT).toBe('dark');
    expect(getGlobalAppearanceMode()).toBe('dark');
    expect(resolveAppearanceMode()).toBe('dark');
  });

  it('uses the global preference before falling back to default', () => {
    setGlobalAppearanceMode('light');
    expect(resolveAppearanceMode()).toBe('light');
  });

  it('prefers a per-series override over the global preference', () => {
    setGlobalAppearanceMode('dark');
    setSeriesAppearanceOverride('demo-series-1', 'light');
    expect(resolveAppearanceMode('demo-series-1')).toBe('light');
    expect(resolveAppearanceMode('other-series')).toBe('dark');
  });

  it('clears a per-series override and falls back to global', () => {
    setGlobalAppearanceMode('system');
    setSeriesAppearanceOverride('demo-series-1', 'light');
    clearSeriesAppearanceOverride('demo-series-1');
    expect(getSeriesAppearanceOverride('demo-series-1')).toBeNull();
    expect(resolveAppearanceMode('demo-series-1')).toBe('system');
  });

  it('a database-persisted override outranks both local series override and global', () => {
    setGlobalAppearanceMode('dark');
    setSeriesAppearanceOverride('demo-series-1', 'dark');
    expect(resolveAppearanceMode('demo-series-1', 'light')).toBe('light');
  });

  it('ignores an invalid database override', () => {
    setGlobalAppearanceMode('light');
    expect(resolveAppearanceMode('demo-series-1', 'sepia')).toBe('light');
    expect(resolveAppearanceMode('demo-series-1', null)).toBe('light');
  });

  it('resetting the global preference (null) restores the built-in default', () => {
    setGlobalAppearanceMode('light');
    setGlobalAppearanceMode(null);
    expect(getGlobalAppearanceMode()).toBe(APPEARANCE_DEFAULT);
  });
});

describe('resolveEffectiveScheme', () => {
  it('passes through concrete light/dark modes unchanged', () => {
    expect(resolveEffectiveScheme('light')).toBe('light');
    expect(resolveEffectiveScheme('dark')).toBe('dark');
  });

  it('resolves "system" using the OS/browser preference', () => {
    vi.stubGlobal('window', {
      matchMedia: (query: string) => ({
        matches: query.includes('dark'),
      }),
    });
    expect(resolveEffectiveScheme('system')).toBe('dark');

    vi.stubGlobal('window', {
      matchMedia: () => ({ matches: false }),
    });
    expect(resolveEffectiveScheme('system')).toBe('light');
  });
});

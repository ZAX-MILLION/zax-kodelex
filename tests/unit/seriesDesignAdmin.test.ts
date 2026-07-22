import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  clearAllSeriesDesignOverrides,
  getDefaultGlobalSeriesDesign,
  getSamplePreviewSeriesId,
  readGlobalSeriesDesignDraft,
  resetGlobalSeriesDesign,
  saveGlobalSeriesDesign,
} from '../../src/features/series/seriesDesignAdmin';
import {
  getGlobalSeriesDetailsLayout,
  getSeriesDetailsLayoutOverride,
  setGlobalSeriesDetailsLayout,
  setSeriesDetailsLayoutOverride,
} from '../../src/features/series/seriesDetailsLayout';
import {
  getGlobalAppearanceMode,
  getSeriesAppearanceOverride,
  setSeriesAppearanceOverride,
} from '../../src/features/appearance/appearanceMode';
import {
  getGlobalSeriesDetailsBackground,
  getGlobalSeriesDetailsBgTheme,
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

describe('seriesDesignAdmin', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('reads and saves global design draft', () => {
    const draft = {
      layout: 'B' as const,
      appearance: 'light' as const,
      backgroundUrl: 'https://example.com/bg.jpg',
      backgroundTheme: {
        position: 'top' as const,
        overlayDarkness: 80,
        blur: 6,
        accentColor: '#ff0000',
        attachment: 'scroll' as const,
      },
    };
    saveGlobalSeriesDesign(draft);
    expect(readGlobalSeriesDesignDraft().layout).toBe('B');
    expect(readGlobalSeriesDesignDraft().appearance).toBe('light');
    expect(getGlobalSeriesDetailsBackground()).toBe('https://example.com/bg.jpg');
    expect(getGlobalSeriesDetailsBgTheme().blur).toBe(6);
  });

  it('resets global design to defaults', () => {
    saveGlobalSeriesDesign({
      layout: 'C',
      appearance: 'system',
      backgroundUrl: 'https://example.com/x.jpg',
      backgroundTheme: getDefaultGlobalSeriesDesign().backgroundTheme,
    });
    resetGlobalSeriesDesign();
    expect(getGlobalSeriesDetailsLayout()).toBeNull();
    expect(readGlobalSeriesDesignDraft().layout).toBe('A');
    expect(getGlobalAppearanceMode()).toBe('dark');
    expect(getGlobalSeriesDetailsBackground()).toBeNull();
  });

  it('clears all per-series overrides', () => {
    setGlobalSeriesDetailsLayout('B');
    setSeriesDetailsLayoutOverride('series-99', 'D');
    setSeriesAppearanceOverride('series-99', 'light');
    clearAllSeriesDesignOverrides('series-99');
    expect(getSeriesDetailsLayoutOverride('series-99')).toBeNull();
    expect(getSeriesAppearanceOverride('series-99')).toBeNull();
  });

  it('returns a sample preview series id from demo catalogue', () => {
    expect(getSamplePreviewSeriesId()).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });
});

describe('Series Design admin routing', () => {
  it('registers /admin/series-design route and nav label', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const adminPage = readFileSync(resolve(process.cwd(), 'src/pages/Admin.tsx'), 'utf-8');
    const sidebar = readFileSync(
      resolve(process.cwd(), 'src/components/admin/ModernAdminSidebar.tsx'),
      'utf-8'
    );
    const dashboard = readFileSync(
      resolve(process.cwd(), 'src/components/admin/ModernDashboardOverview.tsx'),
      'utf-8'
    );
    expect(adminPage).toContain('path="series-design"');
    expect(adminPage).toContain('SeriesDesignManager');
    expect(sidebar).toContain('Series Design');
    expect(sidebar).toContain('/admin/series-design');
    expect(dashboard).toContain('Customize Series Pages');
  });
});

describe('Series Design live preview component', () => {
  it('exports a preview component wired to draft props', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const preview = readFileSync(
      resolve(process.cwd(), 'src/components/admin/SeriesDesignLivePreview.tsx'),
      'utf-8'
    );
    expect(preview).toContain('SeriesDetailsLayoutShell');
    expect(preview).toContain('data-series-design-preview');
  });
});

describe('per-series override panel', () => {
  it('wires layout, appearance, background controls and reset all', async () => {
    const { readFileSync } = await import('fs');
    const { resolve } = await import('path');
    const panel = readFileSync(
      resolve(process.cwd(), 'src/components/admin/SeriesDesignOverridePanel.tsx'),
      'utf-8'
    );
    expect(panel).toContain('SeriesDetailsLayoutControls');
    expect(panel).toContain('SeriesAppearanceControls');
    expect(panel).toContain('SeriesDetailsBackgroundControls');
    expect(panel).toContain('Reset all overrides');
    expect(panel).toContain('clearAllSeriesDesignOverrides');
  });
});

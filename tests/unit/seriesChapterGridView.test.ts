import { beforeEach, describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import {
  getChapterGridColumnClasses,
  getSeriesChapterGridView,
  SERIES_CHAPTER_GRID_VIEW_DEFAULT,
  SERIES_CHAPTER_GRID_VIEW_KEY,
  setSeriesChapterGridView,
} from '../../src/features/series/seriesChapterGridView';

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

describe('seriesChapterGridView', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createStorageMock());
  });

  it('defaults to 1 column when nothing stored', () => {
    expect(getSeriesChapterGridView()).toBe(SERIES_CHAPTER_GRID_VIEW_DEFAULT);
    expect(SERIES_CHAPTER_GRID_VIEW_DEFAULT).toBe(1);
  });

  it('persists visitor preference after refresh', () => {
    setSeriesChapterGridView(3);
    expect(localStorage.getItem(SERIES_CHAPTER_GRID_VIEW_KEY)).toBe('3');
    expect(getSeriesChapterGridView()).toBe(3);
  });

  it('maps each mode to correct responsive column classes', () => {
    expect(getChapterGridColumnClasses(1)).toBe('grid-cols-1');
    expect(getChapterGridColumnClasses(2)).toBe('grid-cols-1 md:grid-cols-2');
    expect(getChapterGridColumnClasses(3)).toBe('grid-cols-1 md:grid-cols-2 lg:grid-cols-3');
  });

  it('mobile falls back to 1 column for multi-column modes', () => {
    expect(getChapterGridColumnClasses(2)).toMatch(/^grid-cols-1/);
    expect(getChapterGridColumnClasses(3)).toMatch(/^grid-cols-1/);
  });
});

describe('chapter grid view toggle wiring', () => {
  it('toggle exists beside chapter filters in ModernChapterGrid', () => {
    const grid = readFileSync(
      resolve(process.cwd(), 'src/components/series/ModernChapterGrid.tsx'),
      'utf-8'
    );
    const toggle = readFileSync(
      resolve(process.cwd(), 'src/components/series/ChapterGridViewToggle.tsx'),
      'utf-8'
    );
    expect(grid).toContain('ChapterGridViewToggle');
    expect(grid).toContain('getChapterGridColumnClasses(gridView)');
    expect(toggle).toContain('data-testid="chapter-grid-view-toggle"');
  });

  it('toggle survives layout switching via shared chapter blocks', () => {
    const sections = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailSections.tsx'),
      'utf-8'
    );
    const editorial = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutEditorial.tsx'),
      'utf-8'
    );
    const cinematic = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutCinematic.tsx'),
      'utf-8'
    );
    const compact = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutCompact.tsx'),
      'utf-8'
    );

    expect(sections).toContain('ModernChapterGrid');
    for (const layout of [editorial, cinematic, compact]) {
      expect(layout).toContain('SeriesChaptersBlock');
    }
  });
});

describe('editorial layout premium composition', () => {
  it('uses magazine column with sticky cover and related rail', () => {
    const editorial = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutEditorial.tsx'),
      'utf-8'
    );
    expect(editorial).toContain('data-series-layout="editorial"');
    expect(editorial).toContain('presentation="editorial"');
    expect(editorial).toContain('relatedVariant="rail"');
    expect(editorial).toContain('lg:sticky');
  });
});

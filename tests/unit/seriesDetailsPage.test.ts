import { describe, expect, it } from 'vitest';
import { existsSync, readFileSync } from 'fs';
import { resolve } from 'path';

describe('ModernSeriesDetail page structure', () => {
  it('does not hide comments in a tab panel', () => {
    const source = readFileSync(
      resolve(process.cwd(), 'src/components/series/ModernSeriesDetail.tsx'),
      'utf-8'
    );
    expect(source).not.toContain('SeriesDetailTabs');
    expect(source).not.toContain('SeriesDetailTabPanel');
    expect(source).toContain('SeriesDetailsLayoutShell');
  });

  it('uses shared sections for all layouts', () => {
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
    for (const src of [editorial, cinematic, compact]) {
      expect(src).toContain('SeriesDetailSections');
      expect(src).not.toContain('SeriesDetailTabs');
    }
  });

  it('orders comments after reviews and related in shared sections by default', () => {
    const sections = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailSections.tsx'),
      'utf-8'
    );
    const chaptersIdx = sections.indexOf('id="series-chapters"');
    const reviewsIdx = sections.indexOf('id="series-reviews"');
    const relatedIdx = sections.indexOf('id="series-related"');
    const commentsIdx = sections.indexOf('id="series-comments"');
    expect(chaptersIdx).toBeGreaterThan(-1);
    expect(reviewsIdx).toBeGreaterThan(chaptersIdx);
    expect(relatedIdx).toBeGreaterThan(reviewsIdx);
    expect(commentsIdx).toBeGreaterThan(relatedIdx);
  });

  it('supports reordering comments directly after chapters for Layout D', () => {
    const sections = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailSections.tsx'),
      'utf-8'
    );
    expect(sections).toContain('commentsBeforeSecondary');
    expect(sections).toContain('deemphasizeSecondary');
  });
});

describe('Layout D — Compact List', () => {
  const layoutDSource = readFileSync(
    resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutCompactList.tsx'),
    'utf-8'
  );

  it('is registered in the lazy layout shell', () => {
    const shellIndex = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/index.tsx'),
      'utf-8'
    );
    expect(shellIndex).toContain('SeriesDetailsLayoutCompactList');
    expect(shellIndex).toMatch(/D:\s*CompactList/);
  });

  it('composes shared sections instead of duplicating chapter/comment/access logic', () => {
    expect(layoutDSource).toContain('SeriesDetailSections');
    expect(layoutDSource).not.toContain('import ModernChapterGrid');
    expect(layoutDSource).not.toContain('SeriesComments');
    expect(layoutDSource).not.toContain('SeriesReviews');
  });

  it('orders chapters before comments, with commentsBeforeSecondary + deemphasizeSecondary set', () => {
    expect(layoutDSource).toContain('commentsBeforeSecondary');
    expect(layoutDSource).toContain('deemphasizeSecondary');
    expect(layoutDSource).not.toContain('SeriesDetailTabs');
  });

  it('has no large cinematic hero and no tabs', () => {
    expect(layoutDSource).not.toContain('SeriesDetailTabs');
    expect(layoutDSource).not.toMatch(/py-1[0-9]\s/); // no oversized hero vertical padding
  });
});

describe('Admin layout selector exposes four options', () => {
  it('lists A / B / C / D with distinct labels', () => {
    const meta = readFileSync(
      resolve(process.cwd(), 'src/features/series/seriesDetailsLayout.ts'),
      'utf-8'
    );
    expect(meta).toContain("'A' | 'B' | 'C' | 'D'");
    expect(meta).toContain('Layout D — Compact List');

    const controls = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailsLayoutControls.tsx'),
      'utf-8'
    );
    expect(controls).toContain("['A', 'B', 'C', 'D']");
  });
});

describe('Dead series-details components removed', () => {
  it('deletes SeriesDetailTabs and SeriesDetailMetadata (unused / duplicate)', () => {
    expect(existsSync(resolve(process.cwd(), 'src/components/series/SeriesDetailTabs.tsx'))).toBe(false);
    expect(existsSync(resolve(process.cwd(), 'src/components/series/SeriesDetailMetadata.tsx'))).toBe(false);
  });

  it('keeps the SeriesDetailViewModel type but removes the unused SeriesDetailHero component body', () => {
    const hero = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailHero.tsx'),
      'utf-8'
    );
    expect(hero).toContain('export interface SeriesDetailViewModel');
    expect(hero).not.toContain('export function SeriesDetailHero');
  });

  it('removes the unused sidebar variant from SeriesDetailReadingActions', () => {
    const actions = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailReadingActions.tsx'),
      'utf-8'
    );
    expect(actions).not.toContain("'sidebar'");
  });
});

describe('demo chapter catalog', () => {
  it('provides 5–10 chapters with newest locked entries', async () => {
    const { getDemoChaptersForSeries } = await import('../../src/utils/demoLibraryData');
    const chapters = getDemoChaptersForSeries('00000000-0000-4000-a000-000000000001');
    expect(chapters.length).toBeGreaterThanOrEqual(5);
    expect(chapters.length).toBeLessThanOrEqual(10);
    const sorted = [...chapters].sort((a, b) => b.chapter_number - a.chapter_number);
    const lockedRecent = sorted.slice(0, 2).filter((c) => c.is_locked);
    expect(lockedRecent.length).toBeGreaterThanOrEqual(1);
  });
});

describe('demo offline isolation', () => {
  it('uses offline demo when configured', async () => {
    const { shouldUseOfflineDemo } = await import('../../src/utils/demoLibraryData');
    const original = import.meta.env.VITE_DEMO_MODE;
    try {
      (import.meta.env as Record<string, string>).VITE_DEMO_MODE = 'true';
      expect(shouldUseOfflineDemo()).toBe(true);
    } finally {
      (import.meta.env as Record<string, string>).VITE_DEMO_MODE = original;
    }
  });
});

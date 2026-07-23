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

  it('composes shared section blocks instead of duplicating chapter/comment logic', () => {
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
      expect(src).toContain('SeriesChaptersBlock');
      expect(src).toContain('SeriesCommentsBlock');
      expect(src).not.toContain('import ModernChapterGrid');
      expect(src).not.toContain('SeriesDetailTabs');
    }
  });

  it('orders chapters then comments then reviews/related in shared sections', () => {
    const sections = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailSections.tsx'),
      'utf-8'
    );
    const chaptersIdx = sections.indexOf('id="series-chapters"');
    const commentsIdx = sections.indexOf('id="series-comments"');
    const reviewsIdx = sections.indexOf('id="series-reviews"');
    const relatedIdx = sections.indexOf('id="series-related"');
    expect(chaptersIdx).toBeGreaterThan(-1);
    expect(commentsIdx).toBeGreaterThan(-1);
    expect(reviewsIdx).toBeGreaterThan(-1);
    expect(relatedIdx).toBeGreaterThan(-1);
    expect(sections).toContain('SeriesChaptersBlock');
    expect(sections).toContain('SeriesCommentsBlock');
    expect(sections).not.toContain('SeriesDetailMetaPanel');
    expect(sections).not.toContain('showMetaStats');
  });

  it('supports related presentation variants after comments', () => {
    const sections = readFileSync(
      resolve(process.cwd(), 'src/components/series/SeriesDetailSections.tsx'),
      'utf-8'
    );
    expect(sections).toContain('relatedVariant');
    expect(sections).toContain('secondaryOrder');
    expect(sections).toContain('deemphasizeSecondary');
  });
});

describe('four page products are structurally distinct', () => {
  it('A magazine uses sticky cover column + article, not a full-bleed billboard', () => {
    const editorial = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutEditorial.tsx'),
      'utf-8'
    );
    expect(editorial).toContain('data-series-layout="editorial"');
    expect(editorial).toContain('lg:grid-cols-[240px_minmax(0,1fr)]');
    expect(editorial).toContain('relatedVariant="rail"');
    expect(editorial).not.toContain('min-h-[78vh]');
    expect(editorial).not.toContain('Table of contents');
  });

  it('B streaming owns the first viewport with artwork and keeps episodes below', () => {
    const cinematic = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutCinematic.tsx'),
      'utf-8'
    );
    expect(cinematic).toContain('data-series-layout="cinematic"');
    expect(cinematic).toContain('min-h-[78vh]');
    expect(cinematic).toContain('heading="Episodes"');
    expect(cinematic).toContain('relatedVariant="visual-grid"');
    expect(cinematic).not.toContain('SeriesDetailCover');
  });

  it('C store uses a product sidebar + tile browse pane', () => {
    const compact = readFileSync(
      resolve(process.cwd(), 'src/components/series/layouts/SeriesDetailsLayoutCompact.tsx'),
      'utf-8'
    );
    expect(compact).toContain('data-series-layout="catalogue"');
    expect(compact).toContain('lg:w-[280px]');
    expect(compact).toContain('heading="Browse chapters"');
    expect(compact).toContain('relatedVariant="tile-grid"');
    expect(compact).not.toContain('min-h-[78vh]');
  });
});

describe('Layout D — Chapter Index', () => {
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

  it('composes shared section blocks instead of duplicating chapter/comment logic', () => {
    expect(layoutDSource).toContain('SeriesChaptersBlock');
    expect(layoutDSource).toContain('SeriesCommentsBlock');
    expect(layoutDSource).not.toContain('import ModernChapterGrid');
    expect(layoutDSource).not.toContain("from '../SeriesComments'");
    expect(layoutDSource).not.toContain("from '../SeriesReviews'");
  });

  it('is a text-only TOC utility with no related rail and no cover art', () => {
    expect(layoutDSource).toContain('data-series-layout="chapter-index"');
    expect(layoutDSource).toContain('heading="Table of contents"');
    expect(layoutDSource).toContain('deemphasize');
    expect(layoutDSource).not.toContain('SeriesDetailCover');
    expect(layoutDSource).not.toContain('SeriesRelatedBlock');
    expect(layoutDSource).not.toContain('SeriesDetailTabs');
  });

  it('has no large cinematic hero and no tabs', () => {
    expect(layoutDSource).not.toContain('SeriesDetailTabs');
    expect(layoutDSource).not.toContain('min-h-[78vh]');
    expect(layoutDSource).not.toMatch(/py-1[0-9]\s/);
  });
});

describe('Admin layout selector exposes four options', () => {
  it('lists A / B / C / D with distinct labels', () => {
    const meta = readFileSync(
      resolve(process.cwd(), 'src/features/series/seriesDetailsLayout.ts'),
      'utf-8'
    );
    expect(meta).toContain("'A' | 'B' | 'C' | 'D'");
    expect(meta).toContain('Layout D — Chapter Index');
    expect(meta).toContain('Layout A — Magazine Profile');
    expect(meta).toContain('Layout B — Streaming Title');
    expect(meta).toContain('Layout C — Store Catalogue');

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

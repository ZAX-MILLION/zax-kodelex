import { describe, expect, it } from 'vitest';
import { readFileSync } from 'fs';
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

  it('orders comments after reviews and related in shared sections', () => {
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

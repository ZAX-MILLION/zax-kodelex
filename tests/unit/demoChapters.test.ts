import { describe, expect, it } from 'vitest';
import {
  FEATURED_DEMO_SERIES,
  getDemoAccessType,
  getDemoUnlockCost,
  getFeaturedPageCount,
} from '../../src/features/demo/data/demoChapterCatalog';
import {
  applyDemoCoinUnlock,
  evaluateDemoChapterAccess,
  resetDemoSessionState,
} from '../../src/features/demo/demoChapterAccess';
import {
  getDemoChapterById,
  getDemoChapterBySeriesAndNumber,
  getDemoChapterBySlugs,
  getDemoChaptersForSeries,
  getDemoSeriesById,
  getDemoSeriesBySlug,
  getFeaturedDemoSeries,
} from '../../src/utils/demoLibraryData';

describe('demo chapter resolution', () => {
  it('exposes five featured series with three readable chapters each', () => {
    const featured = getFeaturedDemoSeries();
    expect(featured).toHaveLength(5);
    expect(FEATURED_DEMO_SERIES).toHaveLength(5);

    for (const series of featured) {
      const chapters = getDemoChaptersForSeries(series.id);
      expect(chapters).toHaveLength(3);
      for (const chapter of chapters) {
        expect(chapter.page_count).toBeGreaterThanOrEqual(8);
        expect(chapter.pages.length).toBe(chapter.page_count);
        expect(chapter.pages.every((url) => url.includes('/demo/chapters/'))).toBe(true);
      }
    }
  });

  it('resolves chapters by id, series+number, and slugs', () => {
    const series = getDemoSeriesBySlug('crimson-blade-chronicles');
    expect(series).toBeTruthy();
    const byNumber = getDemoChapterBySeriesAndNumber(series!.id, 1);
    expect(byNumber?.pages.length).toBeGreaterThan(0);
    expect(getDemoChapterById(byNumber!.id)?.id).toBe(byNumber!.id);
    expect(getDemoChapterBySlugs('crimson-blade-chronicles', 'chapter-001')?.id).toBe(
      byNumber!.id
    );
  });

  it('returns undefined for invalid chapter lookups', () => {
    expect(getDemoChapterById('not-a-real-chapter')).toBeUndefined();
    expect(getDemoChapterBySlugs('nope', 'chapter-999')).toBeUndefined();
    expect(getDemoSeriesById('missing')).toBeUndefined();
  });

  it('matches generated page counts for featured assets', () => {
    const slug = 'mystic-academy';
    expect(getFeaturedPageCount(slug, 2)).toBe(8 + ((2 + slug.length) % 5));
  });
});

describe('demo chapter access rules', () => {
  it('marks chapter 1 free, 2 coins, 3 premium', () => {
    expect(getDemoAccessType(1)).toBe('free');
    expect(getDemoAccessType(2)).toBe('coins');
    expect(getDemoAccessType(3)).toBe('premium');
    expect(getDemoUnlockCost('coins')).toBe(15);
  });

  it('allows guests free chapters only', () => {
    const series = getFeaturedDemoSeries()[0];
    const [freeCh, coinCh, premiumCh] = getDemoChaptersForSeries(series.id);
    const guest = {
      role: 'guest' as const,
      coins: 0,
      isPremium: false,
      unlockedChapterIds: [] as string[],
    };
    expect(evaluateDemoChapterAccess(freeCh, guest).allowed).toBe(true);
    expect(evaluateDemoChapterAccess(coinCh, guest).allowed).toBe(false);
    expect(evaluateDemoChapterAccess(premiumCh, guest).allowed).toBe(false);
  });

  it('unlocks coin chapters with demo coins and keeps premium for paid roles', () => {
    const series = getFeaturedDemoSeries()[0];
    const [, coinCh, premiumCh] = getDemoChaptersForSeries(series.id);

    const unlock = applyDemoCoinUnlock(
      { coins: 25, unlockedChapterIds: [] },
      coinCh.id,
      coinCh.unlock_cost
    );
    expect(unlock.ok).toBe(true);
    expect(unlock.coins).toBe(10);
    expect(unlock.unlockedChapterIds).toContain(coinCh.id);
    expect(unlock.message.toLowerCase()).toContain('no real money');

    const memberAfter = {
      role: 'member' as const,
      coins: unlock.coins,
      isPremium: false,
      unlockedChapterIds: unlock.unlockedChapterIds,
    };
    expect(evaluateDemoChapterAccess(coinCh, memberAfter).allowed).toBe(true);
    expect(evaluateDemoChapterAccess(premiumCh, memberAfter).allowed).toBe(false);

    const paid = {
      role: 'paid' as const,
      coins: 100,
      isPremium: true,
      unlockedChapterIds: [] as string[],
    };
    expect(evaluateDemoChapterAccess(premiumCh, paid).allowed).toBe(true);
  });

  it('resets demo session state to guest defaults', () => {
    expect(resetDemoSessionState()).toEqual({
      role: 'guest',
      coinsBonus: 0,
      unlockedChapterIds: [],
    });
  });

  it('wires previous/next chapter links on featured series', () => {
    const series = getFeaturedDemoSeries()[0];
    const chapters = getDemoChaptersForSeries(series.id);
    expect(chapters[0].previous_chapter_id).toBeNull();
    expect(chapters[0].next_chapter_id).toBe(chapters[1].id);
    expect(chapters[2].next_chapter_id).toBeNull();
    expect(chapters[2].previous_chapter_id).toBe(chapters[1].id);
  });
});

import { describe, expect, it } from 'vitest';
import {
  FEATURED_DEMO_SERIES,
  getDemoAccessType,
  getDemoUnlockCost,
  getFeaturedPageCount,
  hasChronologicalAccessViolation,
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
  getDemoSeriesList,
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

  it('lists chapters newest to oldest', () => {
    for (const series of getDemoSeriesList()) {
      const chapters = getDemoChaptersForSeries(series.id);
      if (chapters.length < 2) continue;
      for (let i = 1; i < chapters.length; i++) {
        expect(chapters[i - 1].chapter_number).toBeGreaterThan(chapters[i].chapter_number);
      }
    }
  });
});

describe('demo chapter access rules', () => {
  it('applies chronological tiers for three-chapter series', () => {
    expect(getDemoAccessType(1, 3)).toBe('free');
    expect(getDemoAccessType(2, 3)).toBe('coins');
    expect(getDemoAccessType(3, 3)).toBe('premium');
    expect(getDemoUnlockCost('coins')).toBe(15);
  });

  it('locks newest and keeps earlier free when only two chapters exist', () => {
    expect(getDemoAccessType(1, 2)).toBe('free');
    expect(getDemoAccessType(2, 2)).toBe('premium');
  });

  it('keeps single-chapter series free', () => {
    expect(getDemoAccessType(1, 1)).toBe('free');
  });

  it('never allows a locked chapter followed by a newer free chapter in any demo series', () => {
    for (const series of getDemoSeriesList()) {
      const chapters = getDemoChaptersForSeries(series.id);
      expect(hasChronologicalAccessViolation(chapters)).toBe(false);

      const chronological = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);
      let seenLocked = false;
      for (const chapter of chronological) {
        if (chapter.access_type !== 'free') {
          seenLocked = true;
        } else {
          expect(seenLocked).toBe(false);
        }
      }
    }
  });

  it('uses free → coins → premium on every featured three-chapter series', () => {
    for (const series of getFeaturedDemoSeries()) {
      const chronological = [...getDemoChaptersForSeries(series.id)].sort(
        (a, b) => a.chapter_number - b.chapter_number
      );
      expect(chronological).toHaveLength(3);
      expect(chronological[0].access_type).toBe('free');
      expect(chronological[1].access_type).toBe('coins');
      expect(chronological[2].access_type).toBe('premium');
      expect(series.locked_chapter_count).toBe(2);
    }
  });

  it('allows guests free chapters only', () => {
    const series = getFeaturedDemoSeries()[0];
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    const [freeCh, coinCh, premiumCh] = chronological;
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
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    const [, coinCh, premiumCh] = chronological;

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
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    expect(chronological[0].previous_chapter_id).toBeNull();
    expect(chronological[0].next_chapter_id).toBe(chronological[1].id);
    expect(chronological[2].next_chapter_id).toBeNull();
    expect(chronological[2].previous_chapter_id).toBe(chronological[1].id);
  });
});

import { describe, expect, it } from 'vitest';
import {
  FEATURED_DEMO_SERIES,
  getDemoAccessType,
  getDemoLockedChapterCount,
  getDemoSeriesChapterCount,
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
  it('exposes five featured series with 8–10 readable chapters each', () => {
    const featured = getFeaturedDemoSeries();
    expect(featured).toHaveLength(5);
    expect(FEATURED_DEMO_SERIES).toHaveLength(5);

    for (const series of featured) {
      const chapters = getDemoChaptersForSeries(series.id);
      expect(chapters.length).toBeGreaterThanOrEqual(8);
      expect(chapters.length).toBeLessThanOrEqual(10);
      for (const chapter of chapters) {
        expect(chapter.page_count).toBeGreaterThanOrEqual(8);
        expect(chapter.pages.length).toBe(chapter.page_count);
        expect(chapter.pages.every((url) => url.includes('/demo/chapters/'))).toBe(true);
      }
    }
  });

  it('gives every demo series 5–10 chapters', () => {
    for (const series of getDemoSeriesList()) {
      const chapters = getDemoChaptersForSeries(series.id);
      expect(chapters.length).toBeGreaterThanOrEqual(5);
      expect(chapters.length).toBeLessThanOrEqual(10);
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

  it('opens every listed chapter with content (image pages or novel text)', () => {
    for (const series of getDemoSeriesList()) {
      const chapters = getDemoChaptersForSeries(series.id);
      for (const chapter of chapters) {
        const hasContent =
          chapter.page_count > 0 || (chapter.content_type === 'text' && !!chapter.text_content);
        expect(hasContent).toBe(true);
      }
    }
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
  it('applies chronological tiers for seven-chapter series with two locks', () => {
    expect(getDemoAccessType(1, 7, 2)).toBe('free');
    expect(getDemoAccessType(5, 7, 2)).toBe('free');
    expect(getDemoAccessType(6, 7, 2)).toBe('coins');
    expect(getDemoAccessType(7, 7, 2)).toBe('premium');
    expect(getDemoUnlockCost('coins')).toBe(15);
  });

  it('locks only the newest chapter when lockedChapterCount is 1', () => {
    expect(getDemoAccessType(1, 5, 1)).toBe('free');
    expect(getDemoAccessType(4, 5, 1)).toBe('free');
    expect(getDemoAccessType(5, 5, 1)).toBe('premium');
  });

  it('locks newest and keeps earlier free when only two chapters exist', () => {
    expect(getDemoAccessType(1, 2, 2)).toBe('free');
    expect(getDemoAccessType(2, 2, 2)).toBe('premium');
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

  it('locks only 1–2 newest chapters per series', () => {
    for (const series of getDemoSeriesList()) {
      const chapters = getDemoChaptersForSeries(series.id);
      const locked = chapters.filter((c) => c.access_type !== 'free');
      expect(locked.length).toBeGreaterThanOrEqual(1);
      expect(locked.length).toBeLessThanOrEqual(2);
      expect(series.locked_chapter_count).toBe(locked.length);
    }
  });

  it('places locked chapters at the series tail (newest chapters)', () => {
    for (const series of getDemoSeriesList()) {
      const chronological = [...getDemoChaptersForSeries(series.id)].sort(
        (a, b) => a.chapter_number - b.chapter_number
      );
      const total = chronological.length;
      for (const chapter of chronological) {
        if (chapter.access_type === 'premium') {
          expect(chapter.chapter_number).toBe(total);
        }
        if (chapter.access_type === 'coins') {
          expect(chapter.chapter_number).toBe(total - 1);
        }
      }
    }
  });

  it('uses free → coins → premium on two-lock featured series', () => {
    const twoLockFeatured = getFeaturedDemoSeries().filter((s) => {
      const meta = FEATURED_DEMO_SERIES.find((m) => m.slug === s.slug);
      return meta?.lockedChapterCount === 2;
    });
    expect(twoLockFeatured.length).toBeGreaterThan(0);

    for (const series of twoLockFeatured) {
      const chronological = [...getDemoChaptersForSeries(series.id)].sort(
        (a, b) => a.chapter_number - b.chapter_number
      );
      const total = chronological.length;
      expect(chronological[total - 2].access_type).toBe('coins');
      expect(chronological[total - 1].access_type).toBe('premium');
      expect(series.locked_chapter_count).toBe(2);
    }
  });

  it('allows guests free chapters only', () => {
    const series = getFeaturedDemoSeries().find((s) => s.slug === 'crimson-blade-chronicles')!;
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    const freeCh = chronological[0];
    const coinCh = chronological[chronological.length - 2];
    const premiumCh = chronological[chronological.length - 1];
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
    const series = getFeaturedDemoSeries().find((s) => s.slug === 'crimson-blade-chronicles')!;
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    const coinCh = chronological[chronological.length - 2];
    const premiumCh = chronological[chronological.length - 1];

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

  it('wires previous/next chapter links across expanded chapter lists', () => {
    const series = getFeaturedDemoSeries()[0];
    const chronological = [...getDemoChaptersForSeries(series.id)].sort(
      (a, b) => a.chapter_number - b.chapter_number
    );
    expect(chronological.length).toBeGreaterThanOrEqual(8);
    expect(chronological[0].previous_chapter_id).toBeNull();
    expect(chronological[0].next_chapter_id).toBe(chronological[1].id);
    expect(chronological[chronological.length - 1].next_chapter_id).toBeNull();
    expect(chronological[chronological.length - 1].previous_chapter_id).toBe(
      chronological[chronological.length - 2].id
    );

    for (let i = 1; i < chronological.length - 1; i++) {
      expect(chronological[i].previous_chapter_id).toBe(chronological[i - 1].id);
      expect(chronological[i].next_chapter_id).toBe(chronological[i + 1].id);
    }
  });

  it('matches deterministic chapter counts from catalogue helpers', () => {
    for (const series of getDemoSeriesList()) {
      const index = getDemoSeriesList().indexOf(series);
      const expected = getDemoSeriesChapterCount(index, series.featured);
      expect(getDemoChaptersForSeries(series.id)).toHaveLength(expected);
      expect(getDemoLockedChapterCount(index)).toBe(series.locked_chapter_count);
    }
  });
});

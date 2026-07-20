import type { DemoAccessType } from '@/features/demo/data/demoChapterCatalog';

export interface DemoAccessSubject {
  id: string;
  access_type: DemoAccessType;
  unlock_cost: number;
}

export interface DemoAccessActor {
  role: 'guest' | 'member' | 'paid' | 'buyer' | 'uploader' | 'admin';
  coins: number;
  isPremium: boolean;
  unlockedChapterIds: string[];
}

export type PureDemoAccessResult =
  | { allowed: true; reason: 'free' | 'premium' | 'unlocked' }
  | {
      allowed: false;
      reason: 'coins' | 'premium' | 'guest';
      cost: number;
      accessType: DemoAccessType;
    };

export function evaluateDemoChapterAccess(
  chapter: DemoAccessSubject,
  actor: DemoAccessActor
): PureDemoAccessResult {
  if (chapter.access_type === 'free') {
    return { allowed: true, reason: 'free' };
  }
  if (actor.unlockedChapterIds.includes(chapter.id)) {
    return { allowed: true, reason: 'unlocked' };
  }
  if (chapter.access_type === 'premium') {
    if (actor.isPremium) return { allowed: true, reason: 'premium' };
    return {
      allowed: false,
      reason: 'premium',
      cost: 0,
      accessType: 'premium',
    };
  }
  if (actor.role === 'guest') {
    return {
      allowed: false,
      reason: 'guest',
      cost: chapter.unlock_cost,
      accessType: 'coins',
    };
  }
  return {
    allowed: false,
    reason: 'coins',
    cost: chapter.unlock_cost,
    accessType: 'coins',
  };
}

export function applyDemoCoinUnlock(
  state: { coins: number; unlockedChapterIds: string[] },
  chapterId: string,
  cost: number
): { ok: boolean; coins: number; unlockedChapterIds: string[]; message: string } {
  if (state.unlockedChapterIds.includes(chapterId)) {
    return {
      ok: true,
      coins: state.coins,
      unlockedChapterIds: state.unlockedChapterIds,
      message: 'Already unlocked in this session.',
    };
  }
  if (state.coins < cost) {
    return {
      ok: false,
      coins: state.coins,
      unlockedChapterIds: state.unlockedChapterIds,
      message: `Need ${cost} demo coins. Current balance: ${state.coins}.`,
    };
  }
  return {
    ok: true,
    coins: state.coins - cost,
    unlockedChapterIds: [...state.unlockedChapterIds, chapterId],
    message: `Unlocked with ${cost} demo coins. No real money was charged.`,
  };
}

export function resetDemoSessionState() {
  return {
    role: 'guest' as const,
    coinsBonus: 0,
    unlockedChapterIds: [] as string[],
  };
}

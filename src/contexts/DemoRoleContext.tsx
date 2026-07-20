import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DemoRoleId } from '@/config/env';
import { appConfig } from '@/config/env';
import type { DemoChapter } from '@/utils/demoLibraryData';
import {
  applyDemoCoinUnlock,
  evaluateDemoChapterAccess,
  type PureDemoAccessResult,
} from '@/features/demo/demoChapterAccess';
import { clearDemoCommentSession } from '@/features/demo/useDemoChapterComments';

export type DemoAccessResult = PureDemoAccessResult;

export interface DemoRoleProfile {
  id: string;
  email: string;
  displayName: string;
  role: DemoRoleId;
  coins: number;
  isPremium: boolean;
  canUpload: boolean;
  canPurchase: boolean;
  canAccessAdmin: boolean;
}

const DEMO_ROLE_STORAGE_KEY = 'zax-demo-role';
const DEMO_UNLOCKS_STORAGE_KEY = 'zax-demo-unlocks';
const DEMO_COIN_BONUS_STORAGE_KEY = 'zax-demo-coin-bonus';

const ROLE_PROFILES: Record<DemoRoleId, DemoRoleProfile> = {
  guest: {
    id: 'demo-guest',
    email: 'guest@demo.local',
    displayName: 'Guest Visitor',
    role: 'guest',
    coins: 0,
    isPremium: false,
    canUpload: false,
    canPurchase: false,
    canAccessAdmin: false,
  },
  member: {
    id: 'demo-member',
    email: 'member@demo.local',
    displayName: 'Demo Member',
    role: 'member',
    coins: 25,
    isPremium: false,
    canUpload: false,
    canPurchase: false,
    canAccessAdmin: false,
  },
  paid: {
    id: 'demo-paid',
    email: 'premium@demo.local',
    displayName: 'Premium Reader',
    role: 'paid',
    coins: 100,
    isPremium: true,
    canUpload: false,
    canPurchase: false,
    canAccessAdmin: false,
  },
  buyer: {
    id: 'demo-buyer',
    email: 'buyer@demo.local',
    displayName: 'Coin Buyer',
    role: 'buyer',
    coins: 500,
    isPremium: false,
    canUpload: false,
    canPurchase: true,
    canAccessAdmin: false,
  },
  uploader: {
    id: 'demo-uploader',
    email: 'uploader@demo.local',
    displayName: 'Series Uploader',
    role: 'uploader',
    coins: 50,
    isPremium: false,
    canUpload: true,
    canPurchase: false,
    canAccessAdmin: false,
  },
  admin: {
    id: 'demo-admin',
    email: 'admin@demo.local',
    displayName: 'Admin Preview',
    role: 'admin',
    coins: 0,
    isPremium: true,
    canUpload: true,
    canPurchase: false,
    canAccessAdmin: false,
  },
};

export const DEMO_ROLE_OPTIONS: Array<{
  id: DemoRoleId;
  label: string;
  description: string;
}> = [
  { id: 'guest', label: 'Guest', description: 'Browse free demo chapters only' },
  { id: 'member', label: 'Member', description: 'Can spend demo coins to unlock one paid chapter' },
  { id: 'paid', label: 'Paid / Premium', description: 'Premium demo chapters unlocked' },
  { id: 'buyer', label: 'Buyer', description: 'Simulated checkout grants temporary demo coins' },
  { id: 'uploader', label: 'Uploader', description: 'Upload panel preview (no writes)' },
  {
    id: 'admin',
    label: 'Admin Preview',
    description: 'Simulated admin dashboard — production Admin bundle is never loaded',
  },
];

interface DemoRoleContextValue {
  enabled: boolean;
  activeRole: DemoRoleId;
  profile: DemoRoleProfile | null;
  coins: number;
  unlockedChapterIds: string[];
  setActiveRole: (role: DemoRoleId) => void;
  clearRole: () => void;
  resetDemo: () => void;
  isSimulatingAuth: boolean;
  isChapterUnlocked: (chapterId: string) => boolean;
  canAccessChapter: (chapter: Pick<DemoChapter, 'id' | 'access_type' | 'unlock_cost'>) => DemoAccessResult;
  unlockChapterWithCoins: (chapterId: string, cost: number) => { ok: boolean; message: string };
  grantDemoCoins: (amount: number) => void;
}

const DemoRoleContext = createContext<DemoRoleContextValue | undefined>(undefined);

function readStoredRole(): DemoRoleId {
  if (typeof sessionStorage === 'undefined') return 'guest';
  const stored = sessionStorage.getItem(DEMO_ROLE_STORAGE_KEY);
  if (stored && stored in ROLE_PROFILES) {
    return stored as DemoRoleId;
  }
  return 'guest';
}

function readUnlocks(): string[] {
  if (typeof sessionStorage === 'undefined') return [];
  try {
    const raw = sessionStorage.getItem(DEMO_UNLOCKS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((id): id is string => typeof id === 'string') : [];
  } catch {
    return [];
  }
}

function readCoinBonus(): number {
  if (typeof sessionStorage === 'undefined') return 0;
  const raw = sessionStorage.getItem(DEMO_COIN_BONUS_STORAGE_KEY);
  const value = raw ? Number(raw) : 0;
  return Number.isFinite(value) ? value : 0;
}

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const enabled = appConfig.features.roleLab;
  const [activeRole, setRoleState] = useState<DemoRoleId>(() =>
    enabled ? readStoredRole() : 'guest'
  );
  const [unlockedChapterIds, setUnlockedChapterIds] = useState<string[]>(() =>
    enabled ? readUnlocks() : []
  );
  const [coinBonus, setCoinBonus] = useState<number>(() => (enabled ? readCoinBonus() : 0));

  const persistUnlocks = useCallback((ids: string[]) => {
    setUnlockedChapterIds(ids);
    sessionStorage.setItem(DEMO_UNLOCKS_STORAGE_KEY, JSON.stringify(ids));
  }, []);

  const persistCoinBonus = useCallback((amount: number) => {
    setCoinBonus(amount);
    sessionStorage.setItem(DEMO_COIN_BONUS_STORAGE_KEY, String(amount));
  }, []);

  const setActiveRole = useCallback(
    (role: DemoRoleId) => {
      if (!enabled) return;
      setRoleState(role);
      sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
    },
    [enabled]
  );

  const resetDemo = useCallback(() => {
    setRoleState('guest');
    setUnlockedChapterIds([]);
    setCoinBonus(0);
    sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
    sessionStorage.removeItem(DEMO_UNLOCKS_STORAGE_KEY);
    sessionStorage.removeItem(DEMO_COIN_BONUS_STORAGE_KEY);
    clearDemoCommentSession();
  }, []);

  const clearRole = useCallback(() => {
    resetDemo();
  }, [resetDemo]);

  const baseCoins = ROLE_PROFILES[activeRole].coins;
  const coins = baseCoins + coinBonus;

  const isChapterUnlocked = useCallback(
    (chapterId: string) => unlockedChapterIds.includes(chapterId),
    [unlockedChapterIds]
  );

  const canAccessChapter = useCallback(
    (chapter: Pick<DemoChapter, 'id' | 'access_type' | 'unlock_cost'>): DemoAccessResult => {
      const profile = ROLE_PROFILES[activeRole];
      return evaluateDemoChapterAccess(chapter, {
        role: activeRole,
        coins: profile.coins + coinBonus,
        isPremium: profile.isPremium,
        unlockedChapterIds,
      });
    },
    [activeRole, unlockedChapterIds, coinBonus]
  );

  const unlockChapterWithCoins = useCallback(
    (chapterId: string, cost: number) => {
      if (!enabled) {
        return { ok: false, message: 'Demo Role Lab is not enabled.' };
      }
      if (activeRole === 'guest') {
        return { ok: false, message: 'Switch to Member or Buyer in Role Lab to use demo coins.' };
      }
      const result = applyDemoCoinUnlock(
        { coins, unlockedChapterIds },
        chapterId,
        cost
      );
      if (!result.ok) {
        return { ok: false, message: result.message };
      }
      persistCoinBonus(coinBonus - (coins - result.coins));
      persistUnlocks(result.unlockedChapterIds);
      return { ok: true, message: result.message };
    },
    [
      enabled,
      activeRole,
      unlockedChapterIds,
      coins,
      coinBonus,
      persistCoinBonus,
      persistUnlocks,
    ]
  );

  const grantDemoCoins = useCallback(
    (amount: number) => {
      if (!enabled) return;
      persistCoinBonus(coinBonus + amount);
    },
    [enabled, coinBonus, persistCoinBonus]
  );

  const value = useMemo<DemoRoleContextValue>(() => {
    const profile =
      enabled && activeRole !== 'guest'
        ? { ...ROLE_PROFILES[activeRole], coins }
        : null;
    return {
      enabled,
      activeRole,
      profile,
      coins,
      unlockedChapterIds,
      setActiveRole,
      clearRole,
      resetDemo,
      isSimulatingAuth: enabled && activeRole !== 'guest',
      isChapterUnlocked,
      canAccessChapter,
      unlockChapterWithCoins,
      grantDemoCoins,
    };
  }, [
    enabled,
    activeRole,
    coins,
    unlockedChapterIds,
    setActiveRole,
    clearRole,
    resetDemo,
    isChapterUnlocked,
    canAccessChapter,
    unlockChapterWithCoins,
    grantDemoCoins,
  ]);

  return (
    <DemoRoleContext.Provider value={value}>{children}</DemoRoleContext.Provider>
  );
}

export function useDemoRole() {
  const context = useContext(DemoRoleContext);
  if (!context) {
    throw new Error('useDemoRole must be used within DemoRoleProvider');
  }
  return context;
}

export function getDemoRoleProfile(role: DemoRoleId): DemoRoleProfile {
  return ROLE_PROFILES[role];
}

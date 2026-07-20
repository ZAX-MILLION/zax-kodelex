import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import type { DemoRoleId } from '@/config/env';
import { appConfig } from '@/config/env';

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
  { id: 'guest', label: 'Guest', description: 'Browse the demo library only' },
  { id: 'member', label: 'Member', description: 'Signed-in reader with profile UI' },
  { id: 'paid', label: 'Paid / Premium', description: 'Premium badge and early-access UI' },
  { id: 'buyer', label: 'Buyer', description: 'Coin wallet UI (no real checkout)' },
  { id: 'uploader', label: 'Uploader', description: 'Upload panel preview (no writes)' },
  {
    id: 'admin',
    label: 'Admin Preview',
    description: 'Nav hints only — admin bundle not loaded on demo',
  },
];

interface DemoRoleContextValue {
  enabled: boolean;
  activeRole: DemoRoleId;
  profile: DemoRoleProfile | null;
  setActiveRole: (role: DemoRoleId) => void;
  clearRole: () => void;
  isSimulatingAuth: boolean;
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

export function DemoRoleProvider({ children }: { children: React.ReactNode }) {
  const enabled = appConfig.features.roleLab;
  const [activeRole, setRoleState] = useState<DemoRoleId>(() =>
    enabled ? readStoredRole() : 'guest'
  );

  const setActiveRole = useCallback(
    (role: DemoRoleId) => {
      if (!enabled) return;
      setRoleState(role);
      sessionStorage.setItem(DEMO_ROLE_STORAGE_KEY, role);
    },
    [enabled]
  );

  const clearRole = useCallback(() => {
    setRoleState('guest');
    sessionStorage.removeItem(DEMO_ROLE_STORAGE_KEY);
  }, []);

  const value = useMemo<DemoRoleContextValue>(() => {
    const profile =
      enabled && activeRole !== 'guest' ? ROLE_PROFILES[activeRole] : null;
    return {
      enabled,
      activeRole,
      profile,
      setActiveRole,
      clearRole,
      isSimulatingAuth: enabled && activeRole !== 'guest',
    };
  }, [enabled, activeRole, setActiveRole, clearRole]);

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

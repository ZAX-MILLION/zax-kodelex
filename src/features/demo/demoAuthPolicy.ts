import type { DemoRoleId } from '@/config/env';
import { appConfig } from '@/config/env';
import { resolveSupabaseConfig } from '@/integrations/supabase/config';

/** Real email/password auth only when Supabase is explicitly configured (not demo / not dev-fallback). */
export function isRealAuthEnabled(): boolean {
  if (appConfig.isDemo) return false;
  const config = resolveSupabaseConfig();
  if (!config.url || !config.anonKey) return false;
  if (config.source === 'dev-fallback' || config.source === 'none') return false;
  if (config.url.includes('placeholder.supabase.co')) return false;
  return true;
}

/**
 * Public demo (or Role Lab without live auth) uses role previews instead of Supabase Auth.
 * Central switch — AuthModal, nav, and AuthContext all read this.
 */
export function shouldUseDemoRolePreview(): boolean {
  return appConfig.isDemo || (appConfig.features.roleLab && !isRealAuthEnabled());
}

export const DEMO_SIMULATED_ACTION_MESSAGE =
  'This action is simulated in the public demo. No production data was changed.';

export const DEMO_BANNER_COPY =
  'Interactive public demo — explore readable sample chapters, temporary role previews, and simulated purchases. No real money is charged and no production data is changed.';

export const DEMO_ROLE_PREVIEW_ACTIONS: ReadonlyArray<{
  role: DemoRoleId;
  label: string;
  path: string;
  description: string;
}> = [
  {
    role: 'member',
    label: 'Preview as Member',
    path: '/demo/member',
    description: 'Reading progress UI and demo coin unlocks',
  },
  {
    role: 'paid',
    label: 'Preview as Paid Member',
    path: '/demo/paid-member',
    description: 'Premium badge and unlocked premium chapters',
  },
  {
    role: 'buyer',
    label: 'Preview as Buyer',
    path: '/demo/buyer',
    description: 'Temporary wallet and simulated checkout',
  },
  {
    role: 'uploader',
    label: 'Preview as Uploader',
    path: '/demo/uploader',
    description: 'Draft upload form with no network writes',
  },
  {
    role: 'admin',
    label: 'Preview as Administrator',
    path: '/demo/admin',
    description: 'Lightweight simulated admin dashboard',
  },
];

const ROLE_DESTINATIONS: Record<DemoRoleId, string> = {
  guest: '/demo',
  member: '/demo/member',
  paid: '/demo/paid-member',
  buyer: '/demo/buyer',
  uploader: '/demo/uploader',
  admin: '/demo/admin',
};

export function getDemoRoleDestination(role: DemoRoleId): string {
  return ROLE_DESTINATIONS[role];
}

export function resolveDemoRoleAlias(alias: string | undefined): DemoRoleId | null {
  if (!alias) return null;
  const map: Record<string, DemoRoleId> = {
    member: 'member',
    'paid-member': 'paid',
    paid: 'paid',
    buyer: 'buyer',
    uploader: 'uploader',
    admin: 'admin',
    guest: 'guest',
  };
  return map[alias] ?? null;
}

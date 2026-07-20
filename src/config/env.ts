import { hasSupabaseCredentials } from '@/integrations/supabase/config';

export type AppEnvironment = 'demo' | 'staging' | 'production';

export type DemoRoleId =
  | 'guest'
  | 'member'
  | 'paid'
  | 'buyer'
  | 'uploader'
  | 'admin';

export interface AppConfig {
  environment: AppEnvironment;
  isDemo: boolean;
  isStaging: boolean;
  isProduction: boolean;
  disablePayments: boolean;
  disableAdmin: boolean;
  allowSimulatedBuy: boolean;
  siteUrl: string;
  basePath: string;
  shouldNoIndex: boolean;
  hasSupabase: boolean;
  features: {
    roleLab: boolean;
    paypal: boolean;
    coinStore: boolean;
    adminPanel: boolean;
    blogDatabase: boolean;
  };
}

function readBool(value: string | undefined, fallback = false): boolean {
  if (value === undefined || value === '') return fallback;
  return value === 'true' || value === '1';
}

function resolveEnvironment(): AppEnvironment {
  const explicit = import.meta.env.VITE_APP_ENV?.trim().toLowerCase();
  if (explicit === 'demo' || explicit === 'staging' || explicit === 'production') {
    return explicit;
  }
  if (readBool(import.meta.env.VITE_DEMO_MODE)) {
    return 'demo';
  }
  if (import.meta.env.MODE === 'development') {
    return 'staging';
  }
  return 'production';
}

function buildConfig(): AppConfig {
  const environment = resolveEnvironment();
  const isDemo = environment === 'demo';
  const isStaging = environment === 'staging';
  const isProduction = environment === 'production';
  const hasSupabase = hasSupabaseCredentials() && !isDemo;

  const disablePayments =
    isDemo || readBool(import.meta.env.VITE_DISABLE_PAYMENTS, isDemo);
  const disableAdmin =
    isDemo || readBool(import.meta.env.VITE_DISABLE_ADMIN, isDemo);

  const allowSimulatedBuy =
    !isProduction &&
    !isDemo &&
    (import.meta.env.DEV || readBool(import.meta.env.VITE_ALLOW_SIMULATED_BUY));

  const basePath = (import.meta.env.BASE_URL || '/').replace(/\/$/, '') || '';
  const siteUrl =
    import.meta.env.VITE_SITE_URL?.trim() ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://zaxmillion.com');

  const shouldNoIndex = isDemo || isStaging;

  return {
    environment,
    isDemo,
    isStaging,
    isProduction,
    disablePayments,
    disableAdmin,
    allowSimulatedBuy,
    siteUrl: siteUrl.replace(/\/$/, ''),
    basePath,
    shouldNoIndex,
    hasSupabase,
    features: {
      roleLab: isDemo || isStaging,
      paypal: !disablePayments && Boolean(import.meta.env.VITE_PAYPAL_CLIENT_ID?.trim()),
      coinStore: !disablePayments,
      adminPanel: !disableAdmin,
      blogDatabase: hasSupabase,
    },
  };
}

/** Singleton typed app configuration — read-only at runtime. */
export const appConfig: AppConfig = buildConfig();

export function isDemoModeEnabled(): boolean {
  return appConfig.isDemo;
}

export function isPaymentsDisabled(): boolean {
  return appConfig.disablePayments;
}

export function isAdminDisabled(): boolean {
  return appConfig.disableAdmin;
}

export function shouldNoIndexRoute(pathname: string): boolean {
  if (appConfig.shouldNoIndex) return true;
  const privatePrefixes = [
    '/demo',
    '/admin',
    '/author',
    '/login',
    '/reset-password',
    '/settings',
    '/profile',
    '/buy',
    '/coins',
    '/subscribe',
    '/monetization',
    '/coin-analytics',
    '/wordpress-crawler',
  ];
  return privatePrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

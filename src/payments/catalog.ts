/**
 * Server-authoritative product catalogue.
 * Edge Functions MUST import the mirrored copy under supabase/functions/_shared/
 * and never trust client-supplied amount/coins/currency.
 */

export type ProductKind = 'coins' | 'subscription' | 'license';
export type CurrencyCode = 'USD';

export interface CoinPackage {
  id: string;
  kind: 'coins';
  label: string;
  coins: number;
  amountUsd: number;
  currency: CurrencyCode;
  active: boolean;
}

export interface SubscriptionPlan {
  id: string;
  kind: 'subscription';
  label: string;
  amountUsd: number;
  currency: CurrencyCode;
  interval: 'month' | 'year';
  active: boolean;
}

export interface LicenseProduct {
  id: string;
  kind: 'license';
  label: string;
  amountUsd: number;
  currency: CurrencyCode;
  sku: string;
  active: boolean;
}

export type CatalogProduct = CoinPackage | SubscriptionPlan | LicenseProduct;

export const COIN_PACKAGES: readonly CoinPackage[] = [
  { id: 'coins_100', kind: 'coins', label: '100 Coins', coins: 100, amountUsd: 0.99, currency: 'USD', active: true },
  { id: 'coins_500', kind: 'coins', label: '500 Coins', coins: 500, amountUsd: 3.99, currency: 'USD', active: true },
  { id: 'coins_1200', kind: 'coins', label: '1200 Coins', coins: 1200, amountUsd: 7.99, currency: 'USD', active: true },
  { id: 'coins_3000', kind: 'coins', label: '3000 Coins', coins: 3000, amountUsd: 14.99, currency: 'USD', active: true },
] as const;

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: 'premium_monthly',
    kind: 'subscription',
    label: 'Premium Membership (Monthly)',
    amountUsd: 4.99,
    currency: 'USD',
    interval: 'month',
    active: true,
  },
  {
    id: 'premium_yearly',
    kind: 'subscription',
    label: 'Premium Membership (Yearly)',
    amountUsd: 39.99,
    currency: 'USD',
    interval: 'year',
    active: true,
  },
] as const;

export const LICENSE_PRODUCTS: readonly LicenseProduct[] = [
  {
    id: 'theme_license_standard',
    kind: 'license',
    label: 'Theme Source License (Standard)',
    amountUsd: 49.0,
    currency: 'USD',
    sku: 'ZAX-THEME-STD',
    active: true,
  },
  {
    id: 'theme_license_extended',
    kind: 'license',
    label: 'Theme Source License (Extended)',
    amountUsd: 149.0,
    currency: 'USD',
    sku: 'ZAX-THEME-EXT',
    active: true,
  },
] as const;

export function getCoinPackage(id: string): CoinPackage | undefined {
  return COIN_PACKAGES.find((p) => p.id === id && p.active);
}

export function getSubscriptionPlan(id: string): SubscriptionPlan | undefined {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id && p.active);
}

export function getLicenseProduct(id: string): LicenseProduct | undefined {
  return LICENSE_PRODUCTS.find((p) => p.id === id && p.active);
}

export function getProduct(id: string): CatalogProduct | undefined {
  return getCoinPackage(id) || getSubscriptionPlan(id) || getLicenseProduct(id);
}

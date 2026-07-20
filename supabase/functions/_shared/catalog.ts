/**
 * Mirrored server catalogue for Deno Edge Functions.
 * Keep in sync with src/payments/catalog.ts
 */

export const COIN_PACKAGES = [
  { id: 'coins_100', kind: 'coins', label: '100 Coins', coins: 100, amountUsd: 0.99, currency: 'USD', active: true },
  { id: 'coins_500', kind: 'coins', label: '500 Coins', coins: 500, amountUsd: 3.99, currency: 'USD', active: true },
  { id: 'coins_1200', kind: 'coins', label: '1200 Coins', coins: 1200, amountUsd: 7.99, currency: 'USD', active: true },
  { id: 'coins_3000', kind: 'coins', label: '3000 Coins', coins: 3000, amountUsd: 14.99, currency: 'USD', active: true },
];

export const LICENSE_PRODUCTS = [
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
];

export const SUBSCRIPTION_PLANS = [
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
];

export function getCoinPackage(id) {
  return COIN_PACKAGES.find((p) => p.id === id && p.active);
}

export function getLicenseProduct(id) {
  return LICENSE_PRODUCTS.find((p) => p.id === id && p.active);
}

export function getSubscriptionPlan(id) {
  return SUBSCRIPTION_PLANS.find((p) => p.id === id && p.active);
}

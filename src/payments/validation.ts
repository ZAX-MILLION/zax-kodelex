import {
  getCoinPackage,
  getLicenseProduct,
  getProduct,
  getSubscriptionPlan,
  type CatalogProduct,
  type CurrencyCode,
} from './catalog';
import type { CreateOrderFailure } from './types';

export interface ValidatePurchaseInput {
  productId: string;
  /** Amount the client claims — must match catalogue or be omitted */
  claimedAmountUsd?: number;
  claimedCurrency?: string;
  claimedCoins?: number;
  isDemo?: boolean;
  paymentsDisabled?: boolean;
  paypalConfigured?: boolean;
  allowLive?: boolean;
  requestedMode?: 'sandbox' | 'live';
}

export type ValidatePurchaseResult =
  | { ok: true; product: CatalogProduct; amountUsd: number; currency: CurrencyCode }
  | CreateOrderFailure;

const EPS = 0.001;

export function validatePurchaseRequest(input: ValidatePurchaseInput): ValidatePurchaseResult {
  if (input.isDemo || input.paymentsDisabled) {
    return {
      ok: false,
      code: 'DEMO_BLOCKED',
      message: 'Payments are disabled in demo mode. No PayPal calls are permitted.',
    };
  }

  if (!input.paypalConfigured) {
    return {
      ok: false,
      code: 'CONFIG_INCOMPLETE',
      message: 'PayPal credentials are not configured. Failing closed.',
    };
  }

  if (input.requestedMode === 'live' && !input.allowLive) {
    return {
      ok: false,
      code: 'LIVE_NOT_GATED',
      message: 'Live PayPal mode requires explicit PAYPAL_ALLOW_LIVE=true gate.',
    };
  }

  const product = getProduct(input.productId);
  if (!product || !product.active) {
    return {
      ok: false,
      code: 'INVALID_PRODUCT',
      message: `Unknown or inactive product: ${input.productId}`,
    };
  }

  if (input.claimedAmountUsd !== undefined) {
    if (Math.abs(input.claimedAmountUsd - product.amountUsd) > EPS) {
      return {
        ok: false,
        code: 'AMOUNT_MISMATCH',
        message: `Client amount ${input.claimedAmountUsd} does not match catalogue ${product.amountUsd}`,
      };
    }
  }

  if (input.claimedCurrency) {
    const currency = input.claimedCurrency.toUpperCase();
    if (currency !== product.currency) {
      return {
        ok: false,
        code: 'CURRENCY_MISMATCH',
        message: `Client currency ${currency} does not match catalogue ${product.currency}`,
      };
    }
  }

  if (product.kind === 'coins' && input.claimedCoins !== undefined) {
    if (input.claimedCoins !== product.coins) {
      return {
        ok: false,
        code: 'AMOUNT_MISMATCH',
        message: `Client coins ${input.claimedCoins} does not match catalogue ${product.coins}`,
      };
    }
  }

  return {
    ok: true,
    product,
    amountUsd: product.amountUsd,
    currency: product.currency,
  };
}

export interface WebhookEventInput {
  eventId: string;
  eventType: string;
  orderId: string;
  alreadyProcessedEventIds: Set<string>;
  purchaseStatus: 'pending' | 'completed' | 'failed' | 'cancelled' | 'refunded' | null;
}

export function decideWebhookFulfillment(input: WebhookEventInput): {
  action: 'fulfill' | 'ignore_duplicate' | 'ignore_failed' | 'ignore_cancelled' | 'reject';
  reason: string;
} {
  if (input.alreadyProcessedEventIds.has(input.eventId)) {
    return { action: 'ignore_duplicate', reason: 'Event ID already processed' };
  }

  if (input.purchaseStatus === 'completed') {
    return { action: 'ignore_duplicate', reason: 'Purchase already fulfilled' };
  }

  if (input.purchaseStatus === 'failed') {
    return { action: 'ignore_failed', reason: 'Purchase marked failed — leave unfulfilled' };
  }

  if (input.purchaseStatus === 'cancelled') {
    return { action: 'ignore_cancelled', reason: 'Purchase cancelled — leave unfulfilled' };
  }

  if (
    input.eventType === 'CHECKOUT.ORDER.APPROVED' ||
    input.eventType === 'PAYMENT.CAPTURE.COMPLETED' ||
    input.eventType === 'CHECKOUT.ORDER.COMPLETED'
  ) {
    if (input.purchaseStatus !== 'pending' && input.purchaseStatus !== null) {
      return { action: 'reject', reason: `Unexpected purchase status: ${input.purchaseStatus}` };
    }
    return { action: 'fulfill', reason: 'Verified completion event' };
  }

  if (
    input.eventType === 'PAYMENT.CAPTURE.DENIED' ||
    input.eventType === 'CHECKOUT.ORDER.VOIDED' ||
    input.eventType.includes('DENIED') ||
    input.eventType.includes('CANCELLED')
  ) {
    return { action: 'ignore_failed', reason: `Non-success event: ${input.eventType}` };
  }

  return { action: 'reject', reason: `Unhandled event type: ${input.eventType}` };
}

/** Re-exports for edge-function mirrors */
export { getCoinPackage, getLicenseProduct, getSubscriptionPlan, getProduct };

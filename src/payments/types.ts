import type { CurrencyCode, ProductKind } from './catalog';

export type PurchaseStatus =
  | 'pending'
  | 'completed'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type PaymentEnvironment = 'sandbox' | 'live';

export interface CreateOrderRequest {
  productId: string;
  /** Client-hint only — server ignores and re-resolves from catalogue */
  expectedAmountUsd?: number;
  currency?: CurrencyCode;
}

export interface CreateOrderResult {
  ok: true;
  orderId: string;
  approveUrl?: string;
  productId: string;
  amountUsd: number;
  currency: CurrencyCode;
  environment: PaymentEnvironment;
}

export interface CreateOrderFailure {
  ok: false;
  code:
    | 'INVALID_PRODUCT'
    | 'AMOUNT_MISMATCH'
    | 'CURRENCY_MISMATCH'
    | 'DEMO_BLOCKED'
    | 'CONFIG_INCOMPLETE'
    | 'LIVE_NOT_GATED'
    | 'UNAUTHORIZED'
    | 'INTERNAL';
  message: string;
}

export interface PendingPurchaseRecord {
  id: string;
  userId: string;
  productId: string;
  productKind: ProductKind;
  amountUsd: number;
  currency: CurrencyCode;
  paypalOrderId: string;
  status: PurchaseStatus;
  createdAt: string;
}

export interface WebhookProcessResult {
  status: 'fulfilled' | 'ignored_duplicate' | 'ignored_failed' | 'ignored_cancelled' | 'rejected';
  purchaseId?: string;
  entitlementCreated: boolean;
  eventId: string;
}

export interface EntitlementGrant {
  userId: string;
  productId: string;
  productKind: ProductKind;
  sourcePurchaseId: string;
  grantedAt: string;
}

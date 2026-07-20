import { describe, expect, it } from 'vitest';
import { validatePurchaseRequest, decideWebhookFulfillment } from '../../src/payments/validation';
import { getCoinPackage, getLicenseProduct } from '../../src/payments/catalog';

describe('payment validation', () => {
  it('rejects invalid product', () => {
    const result = validatePurchaseRequest({
      productId: 'not_real',
      paypalConfigured: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('INVALID_PRODUCT');
  });

  it('rejects changed amount', () => {
    const pack = getCoinPackage('coins_100')!;
    const result = validatePurchaseRequest({
      productId: pack.id,
      claimedAmountUsd: pack.amountUsd + 5,
      paypalConfigured: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('AMOUNT_MISMATCH');
  });

  it('rejects demo payment', () => {
    const result = validatePurchaseRequest({
      productId: 'coins_100',
      isDemo: true,
      paypalConfigured: true,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('DEMO_BLOCKED');
  });

  it('rejects incomplete live configuration', () => {
    const result = validatePurchaseRequest({
      productId: 'coins_100',
      paypalConfigured: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('CONFIG_INCOMPLETE');
  });

  it('rejects live mode without gate', () => {
    const result = validatePurchaseRequest({
      productId: 'theme_license_standard',
      paypalConfigured: true,
      requestedMode: 'live',
      allowLive: false,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('LIVE_NOT_GATED');
  });

  it('accepts valid catalogue product', () => {
    const lic = getLicenseProduct('theme_license_standard')!;
    const result = validatePurchaseRequest({
      productId: lic.id,
      claimedAmountUsd: lic.amountUsd,
      claimedCurrency: 'USD',
      paypalConfigured: true,
      requestedMode: 'sandbox',
    });
    expect(result.ok).toBe(true);
  });
});

describe('webhook fulfillment decisions', () => {
  it('ignores duplicate webhook events', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_1',
      eventType: 'PAYMENT.CAPTURE.COMPLETED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(['evt_1']),
      purchaseStatus: 'pending',
    });
    expect(decision.action).toBe('ignore_duplicate');
  });

  it('fulfills successful payment once when pending', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_2',
      eventType: 'PAYMENT.CAPTURE.COMPLETED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(),
      purchaseStatus: 'pending',
    });
    expect(decision.action).toBe('fulfill');
  });

  it('leaves failed payments unfulfilled', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_3',
      eventType: 'PAYMENT.CAPTURE.COMPLETED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(),
      purchaseStatus: 'failed',
    });
    expect(decision.action).toBe('ignore_failed');
  });

  it('leaves cancelled payments unfulfilled', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_4',
      eventType: 'PAYMENT.CAPTURE.COMPLETED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(),
      purchaseStatus: 'cancelled',
    });
    expect(decision.action).toBe('ignore_cancelled');
  });

  it('records non-success capture events as failed path', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_5',
      eventType: 'PAYMENT.CAPTURE.DENIED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(),
      purchaseStatus: 'pending',
    });
    expect(decision.action).toBe('ignore_failed');
  });

  it('ignores already completed purchase on duplicate success event', () => {
    const decision = decideWebhookFulfillment({
      eventId: 'evt_6',
      eventType: 'CHECKOUT.ORDER.APPROVED',
      orderId: 'ord_1',
      alreadyProcessedEventIds: new Set(),
      purchaseStatus: 'completed',
    });
    expect(decision.action).toBe('ignore_duplicate');
  });
});

/**
 * Shared PayPal helpers for Edge Functions.
 */

export function resolvePayPalBaseUrl(): { baseUrl: string; mode: 'sandbox' | 'live' } {
  const allowLive = Deno.env.get('PAYPAL_ALLOW_LIVE') === 'true';
  const explicit = Deno.env.get('PAYPAL_BASE_URL')?.trim();
  const liveUrl = 'https://api-m.paypal.com';
  const sandboxUrl = 'https://api-m.sandbox.paypal.com';

  if (explicit?.includes('api-m.paypal.com') && !explicit.includes('sandbox')) {
    if (!allowLive) {
      throw new Error('Live PayPal URL configured but PAYPAL_ALLOW_LIVE is not true');
    }
    return { baseUrl: explicit, mode: 'live' };
  }

  if (explicit) {
    return { baseUrl: explicit, mode: 'sandbox' };
  }

  if (allowLive) {
    return { baseUrl: liveUrl, mode: 'live' };
  }

  return { baseUrl: sandboxUrl, mode: 'sandbox' };
}

export function requirePayPalCredentials(): { clientId: string; clientSecret: string } {
  const clientId = Deno.env.get('PAYPAL_CLIENT_ID')?.trim();
  const clientSecret = Deno.env.get('PAYPAL_CLIENT_SECRET')?.trim();
  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }
  return { clientId, clientSecret };
}

export async function getPayPalAccessToken(
  baseUrl: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const tokenResponse = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
    },
    body: 'grant_type=client_credentials',
  });

  if (!tokenResponse.ok) {
    throw new Error('Failed to get PayPal access token');
  }

  const { access_token } = await tokenResponse.json();
  return access_token;
}

/**
 * Verify PayPal webhook signature using PayPal verify-webhook-signature API.
 * Fails closed when WEBHOOK_ID is missing in non-dev.
 */
export async function verifyPayPalWebhookSignature(opts: {
  baseUrl: string;
  accessToken: string;
  webhookId: string;
  headers: Headers;
  rawBody: string;
}): Promise<boolean> {
  const transmissionId = opts.headers.get('paypal-transmission-id');
  const transmissionTime = opts.headers.get('paypal-transmission-time');
  const certUrl = opts.headers.get('paypal-cert-url');
  const authAlgo = opts.headers.get('paypal-auth-algo');
  const transmissionSig = opts.headers.get('paypal-transmission-sig');

  if (!transmissionId || !transmissionTime || !certUrl || !authAlgo || !transmissionSig) {
    return false;
  }

  const verifyResponse = await fetch(`${opts.baseUrl}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${opts.accessToken}`,
    },
    body: JSON.stringify({
      transmission_id: transmissionId,
      transmission_time: transmissionTime,
      cert_url: certUrl,
      auth_algo: authAlgo,
      transmission_sig: transmissionSig,
      webhook_id: opts.webhookId,
      webhook_event: JSON.parse(opts.rawBody),
    }),
  });

  if (!verifyResponse.ok) {
    return false;
  }

  const result = await verifyResponse.json();
  return result.verification_status === 'SUCCESS';
}

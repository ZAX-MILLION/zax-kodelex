-- Seamless V2: payment webhook idempotency + purchase hardening helpers

CREATE TABLE IF NOT EXISTS public.payment_webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id TEXT NOT NULL UNIQUE,
  event_type TEXT NOT NULL,
  provider TEXT NOT NULL DEFAULT 'paypal',
  payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.payment_webhook_events ENABLE ROW LEVEL SECURITY;

-- Service role only (no client policies) — edge functions use service role key
DROP POLICY IF EXISTS "No public access to webhook events" ON public.payment_webhook_events;
CREATE POLICY "No public access to webhook events"
  ON public.payment_webhook_events
  FOR ALL
  USING (false)
  WITH CHECK (false);

-- Ensure purchases.status can represent pending/failed/cancelled without granting client writes
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'purchases' AND column_name = 'status'
  ) THEN
    -- no-op if already present; documented expected values: pending|completed|failed|cancelled|refunded
    NULL;
  END IF;
END $$;

COMMENT ON TABLE public.payment_webhook_events IS
  'PayPal (and future) webhook idempotency log. Fulfillment must check event_id uniqueness.';

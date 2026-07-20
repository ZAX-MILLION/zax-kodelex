-- Seamless V2: close client-writable coin wallet / transaction holes
-- Previous policies used WITH CHECK (true) / USING (true), allowing any authenticated
-- client to credit their own wallet. Credits must come from service-role Edge Functions only.

DROP POLICY IF EXISTS "System can create wallets" ON public.coin_wallets;
DROP POLICY IF EXISTS "System can update wallets" ON public.coin_wallets;
DROP POLICY IF EXISTS "System can create transactions" ON public.coin_transactions;
DROP POLICY IF EXISTS "System can grant chapter access" ON public.chapter_access;

-- No INSERT/UPDATE policies for authenticated role — service_role bypasses RLS.
-- Keep SELECT policies for owners/admins.

COMMENT ON TABLE public.coin_wallets IS
  'Balances are mutated only by service-role Edge Functions after verified PayPal webhooks.';

COMMENT ON TABLE public.coin_transactions IS
  'Purchase rows are inserted/updated only by service-role payment functions.';

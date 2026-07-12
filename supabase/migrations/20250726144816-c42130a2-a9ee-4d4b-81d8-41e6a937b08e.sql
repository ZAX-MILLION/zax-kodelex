-- Create license system tables for CodeCanyon theme sales (skip existing types)

-- Create license type enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE license_type AS ENUM ('single', 'extended', 'developer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create purchase status enum if it doesn't exist
DO $$ BEGIN
    CREATE TYPE purchase_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create customers table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company TEXT,
  phone TEXT,
  country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create purchases table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status purchase_status NOT NULL DEFAULT 'pending',
  payment_method TEXT,
  payment_intent_id TEXT,
  invoice_number TEXT,
  license_id UUID,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create licenses table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.licenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL UNIQUE,
  license_type license_type NOT NULL DEFAULT 'single',
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  purchase_id UUID REFERENCES public.purchases(id) ON DELETE SET NULL,
  product_name TEXT NOT NULL DEFAULT 'Manga Reader Theme',
  product_version TEXT NOT NULL DEFAULT '1.0.0',
  domains_allowed INTEGER NOT NULL DEFAULT 1,
  domains_used TEXT[] DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create download logs table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  download_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create license verifications table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.license_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  verification_result BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_verifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Admins can manage customers" ON public.customers;
DROP POLICY IF EXISTS "Customers can view their own data" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage purchases" ON public.purchases;
DROP POLICY IF EXISTS "Customers can view their own purchases" ON public.purchases;
DROP POLICY IF EXISTS "Admins can manage licenses" ON public.licenses;
DROP POLICY IF EXISTS "Customers can view their own licenses" ON public.licenses;
DROP POLICY IF EXISTS "Admins can view download logs" ON public.download_logs;
DROP POLICY IF EXISTS "Admins can view license verifications" ON public.license_verifications;
DROP POLICY IF EXISTS "Anyone can insert license verifications" ON public.license_verifications;

-- Create RLS policies for customers
CREATE POLICY "Admins can manage customers" ON public.customers
  FOR ALL USING (is_admin());

CREATE POLICY "Customers can view their own data" ON public.customers
  FOR SELECT USING (email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text);

-- Create RLS policies for purchases
CREATE POLICY "Admins can manage purchases" ON public.purchases
  FOR ALL USING (is_admin());

CREATE POLICY "Customers can view their own purchases" ON public.purchases
  FOR SELECT USING (customer_id IN (
    SELECT customers.id FROM customers 
    WHERE customers.email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
  ));

-- Create RLS policies for licenses
CREATE POLICY "Admins can manage licenses" ON public.licenses
  FOR ALL USING (is_admin());

CREATE POLICY "Customers can view their own licenses" ON public.licenses
  FOR SELECT USING (customer_id IN (
    SELECT customers.id FROM customers 
    WHERE customers.email = (SELECT users.email FROM auth.users WHERE users.id = auth.uid())::text
  ));

-- Create RLS policies for download logs
CREATE POLICY "Admins can view download logs" ON public.download_logs
  FOR SELECT USING (is_admin());

-- Create RLS policies for license verifications
CREATE POLICY "Admins can view license verifications" ON public.license_verifications
  FOR SELECT USING (is_admin());

CREATE POLICY "Anyone can insert license verifications" ON public.license_verifications
  FOR INSERT WITH CHECK (true);
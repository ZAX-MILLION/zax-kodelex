-- Create license system tables for CodeCanyon theme sales

-- Create license type enum
CREATE TYPE license_type AS ENUM ('single', 'extended', 'developer');

-- Create purchase status enum  
CREATE TYPE purchase_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');

-- Create customers table
CREATE TABLE public.customers (
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

-- Create purchases table
CREATE TABLE public.purchases (
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

-- Create licenses table
CREATE TABLE public.licenses (
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

-- Create download logs table
CREATE TABLE public.download_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  license_id UUID NOT NULL REFERENCES public.licenses(id) ON DELETE CASCADE,
  ip_address INET,
  user_agent TEXT,
  download_url TEXT,
  file_size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create license verifications table for API usage tracking
CREATE TABLE public.license_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  license_key TEXT NOT NULL,
  domain TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  verification_result BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.licenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.download_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.license_verifications ENABLE ROW LEVEL SECURITY;

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

-- Create function to generate license keys
CREATE OR REPLACE FUNCTION public.generate_license_key()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  key_parts TEXT[];
  i INTEGER;
  chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result TEXT := '';
BEGIN
  -- Generate 4 parts of 4 characters each
  FOR i IN 1..4 LOOP
    result := result || CASE WHEN i > 1 THEN '-' ELSE '' END;
    FOR j IN 1..4 LOOP
      result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
    END LOOP;
  END LOOP;
  
  RETURN result;
END;
$$;

-- Create trigger function to create license when purchase is completed
CREATE OR REPLACE FUNCTION public.create_license_for_purchase()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_license_key TEXT;
  domains_allowed INTEGER := 1;
BEGIN
  -- Only create license for completed purchases
  IF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    -- Determine domains allowed based on amount (simple pricing logic)
    IF NEW.amount >= 299 THEN
      domains_allowed := 999; -- Developer license
    ELSIF NEW.amount >= 149 THEN
      domains_allowed := 10; -- Extended license
    ELSE
      domains_allowed := 1; -- Single license
    END IF;
    
    -- Generate unique license key
    LOOP
      new_license_key := generate_license_key();
      EXIT WHEN NOT EXISTS (SELECT 1 FROM licenses WHERE license_key = new_license_key);
    END LOOP;
    
    -- Create the license
    INSERT INTO licenses (
      license_key,
      license_type,
      customer_id,
      purchase_id,
      domains_allowed
    ) VALUES (
      new_license_key,
      CASE 
        WHEN domains_allowed = 999 THEN 'developer'::license_type
        WHEN domains_allowed = 10 THEN 'extended'::license_type
        ELSE 'single'::license_type
      END,
      NEW.customer_id,
      NEW.id,
      domains_allowed
    );
    
    -- Update purchase with license_id
    UPDATE purchases SET license_id = (
      SELECT id FROM licenses WHERE license_key = new_license_key
    ) WHERE id = NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to auto-generate license on purchase completion
CREATE TRIGGER create_license_on_purchase_completion
  AFTER UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.create_license_for_purchase();

-- Create updated_at triggers
CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_purchases_updated_at
  BEFORE UPDATE ON public.purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON public.licenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
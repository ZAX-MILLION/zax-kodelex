-- Create envato_purchases table for purchase code validation
CREATE TABLE public.envato_purchases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_code TEXT NOT NULL UNIQUE,
  validated_domain TEXT NOT NULL,
  validated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  associated_email TEXT NOT NULL,
  item_id TEXT,
  item_name TEXT,
  buyer_username TEXT,
  purchase_date TIMESTAMP WITH TIME ZONE,
  license_type TEXT,
  support_amount NUMERIC,
  support_until TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'banned', 'refunded')),
  validation_count INTEGER DEFAULT 1,
  last_validation_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.envato_purchases ENABLE ROW LEVEL SECURITY;

-- Admin policies
CREATE POLICY "Admins can manage envato purchases" 
ON public.envato_purchases 
FOR ALL 
USING (is_admin());

-- Users can view their own validated purchases by email
CREATE POLICY "Users can view their own purchases" 
ON public.envato_purchases 
FOR SELECT 
USING (associated_email = (SELECT email FROM auth.users WHERE id = auth.uid()));

-- System can insert purchase validations
CREATE POLICY "System can validate purchases" 
ON public.envato_purchases 
FOR INSERT 
WITH CHECK (true);

-- Create index for faster lookups
CREATE INDEX idx_envato_purchases_code ON public.envato_purchases(purchase_code);
CREATE INDEX idx_envato_purchases_domain ON public.envato_purchases(validated_domain);
CREATE INDEX idx_envato_purchases_email ON public.envato_purchases(associated_email);

-- Create function to check if domain has valid Envato purchase
CREATE OR REPLACE FUNCTION public.has_valid_envato_purchase(domain_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.envato_purchases 
    WHERE validated_domain = domain_name 
    AND status = 'active'
  );
$$;

-- Create function to get purchase details for domain
CREATE OR REPLACE FUNCTION public.get_envato_purchase_for_domain(domain_name TEXT)
RETURNS TABLE(
  purchase_code TEXT,
  validated_at TIMESTAMP WITH TIME ZONE,
  associated_email TEXT,
  item_name TEXT,
  license_type TEXT
)
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    ep.purchase_code,
    ep.validated_at,
    ep.associated_email,
    ep.item_name,
    ep.license_type
  FROM public.envato_purchases ep
  WHERE ep.validated_domain = domain_name 
  AND ep.status = 'active'
  LIMIT 1;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_envato_purchases_updated_at
  BEFORE UPDATE ON public.envato_purchases
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
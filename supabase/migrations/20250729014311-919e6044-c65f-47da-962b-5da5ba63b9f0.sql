-- Create install_status table for tracking installation
CREATE TABLE public.install_status (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_installed BOOLEAN NOT NULL DEFAULT false,
  installed_at TIMESTAMP WITH TIME ZONE,
  installed_by UUID REFERENCES auth.users(id),
  license_key TEXT,
  domain TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.install_status ENABLE ROW LEVEL SECURITY;

-- Only allow one installation record
CREATE UNIQUE INDEX idx_install_status_singleton ON public.install_status ((true));

-- RLS policies
CREATE POLICY "Anyone can read install status" 
ON public.install_status 
FOR SELECT 
USING (true);

CREATE POLICY "System can manage install status" 
ON public.install_status 
FOR ALL 
USING (true);

-- Add trigger for updated_at
CREATE TRIGGER update_install_status_updated_at
BEFORE UPDATE ON public.install_status
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Create trading_config table for global settings
CREATE TABLE public.trading_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initial_balance numeric NOT NULL DEFAULT 100000,
  start_date date NOT NULL DEFAULT '2024-06-01',
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trading_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage trading config
CREATE POLICY "Admins can manage trading config"
ON public.trading_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Authenticated users can view trading config
CREATE POLICY "Authenticated users can view trading config"
ON public.trading_config
FOR SELECT
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_trading_config_updated_at
BEFORE UPDATE ON public.trading_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default configuration
INSERT INTO public.trading_config (initial_balance, start_date, currency)
VALUES (100000, '2024-06-01', 'USD');
-- Create account_metrics table for aggregated performance data
CREATE TABLE public.account_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  
  -- Main metrics
  total_return DECIMAL(10,2) DEFAULT 0,
  deposits_1m DECIMAL(15,2) DEFAULT 0,
  withdrawals_1m DECIMAL(15,2) DEFAULT 0,
  max_drawdown DECIMAL(10,2) DEFAULT 0,
  
  -- Secondary metrics
  total_profit DECIMAL(15,2) DEFAULT 0,
  quarter_return DECIMAL(10,2) DEFAULT 0,
  month_return DECIMAL(10,2) DEFAULT 0,
  week_return DECIMAL(10,2) DEFAULT 0,
  day_return DECIMAL(10,2) DEFAULT 0,
  
  -- Chart data
  account_balance DECIMAL(15,2) DEFAULT 1000,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(date)
);

-- Create monthly_returns table for chart data
CREATE TABLE public.monthly_returns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month DATE NOT NULL,
  return_percent DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(month)
);

-- Enable RLS
ALTER TABLE public.account_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_returns ENABLE ROW LEVEL SECURITY;

-- RLS policies for account_metrics
CREATE POLICY "Admins can manage account metrics"
ON public.account_metrics FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view account metrics"
ON public.account_metrics FOR SELECT
USING (true);

-- RLS policies for monthly_returns
CREATE POLICY "Admins can manage monthly returns"
ON public.monthly_returns FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view monthly returns"
ON public.monthly_returns FOR SELECT
USING (true);

-- Trigger for updated_at
CREATE TRIGGER update_account_metrics_updated_at
BEFORE UPDATE ON public.account_metrics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
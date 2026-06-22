
-- =========================
-- 1) mt5_accounts
-- =========================
CREATE TABLE public.mt5_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_login BIGINT NOT NULL,
  server TEXT NOT NULL,
  broker TEXT,
  currency TEXT NOT NULL DEFAULT 'USD',
  leverage INTEGER,
  api_token_hash TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_seen_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, account_login, server)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_accounts TO authenticated;
GRANT ALL ON public.mt5_accounts TO service_role;

ALTER TABLE public.mt5_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own MT5 accounts"
  ON public.mt5_accounts FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_mt5_accounts_user ON public.mt5_accounts(user_id);
CREATE INDEX idx_mt5_accounts_login ON public.mt5_accounts(account_login);

-- =========================
-- 2) mt5_account_snapshots
-- =========================
CREATE TABLE public.mt5_account_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mt5_account_id UUID NOT NULL REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
  captured_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  balance NUMERIC(18,2),
  equity NUMERIC(18,2),
  credit NUMERIC(18,2),
  margin NUMERIC(18,2),
  free_margin NUMERIC(18,2),
  margin_level NUMERIC(18,4),
  floating_profit NUMERIC(18,2),
  open_positions INTEGER,
  daily_pnl NUMERIC(18,2),
  daily_volume NUMERIC(18,2),
  daily_trades INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_account_snapshots TO authenticated;
GRANT ALL ON public.mt5_account_snapshots TO service_role;

ALTER TABLE public.mt5_account_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access snapshots of their accounts"
  ON public.mt5_account_snapshots FOR ALL
  USING (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()));

CREATE INDEX idx_mt5_snapshots_account_time ON public.mt5_account_snapshots(mt5_account_id, captured_at DESC);

-- =========================
-- 3) mt5_deals
-- =========================
CREATE TABLE public.mt5_deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mt5_account_id UUID NOT NULL REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
  deal_ticket BIGINT NOT NULL,
  position_id BIGINT,
  time TIMESTAMPTZ NOT NULL,
  symbol TEXT,
  type TEXT,
  entry TEXT,
  volume NUMERIC(18,4),
  price NUMERIC(18,8),
  profit NUMERIC(18,2),
  swap NUMERIC(18,2),
  commission NUMERIC(18,2),
  fee NUMERIC(18,2),
  magic BIGINT,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mt5_account_id, deal_ticket)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_deals TO authenticated;
GRANT ALL ON public.mt5_deals TO service_role;

ALTER TABLE public.mt5_deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access deals of their accounts"
  ON public.mt5_deals FOR ALL
  USING (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()));

CREATE INDEX idx_mt5_deals_account_time ON public.mt5_deals(mt5_account_id, time DESC);

-- =========================
-- 4) mt5_cashflows
-- =========================
CREATE TABLE public.mt5_cashflows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mt5_account_id UUID NOT NULL REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
  deal_ticket BIGINT NOT NULL,
  time TIMESTAMPTZ NOT NULL,
  type TEXT NOT NULL,
  amount NUMERIC(18,2) NOT NULL,
  comment TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mt5_account_id, deal_ticket)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_cashflows TO authenticated;
GRANT ALL ON public.mt5_cashflows TO service_role;

ALTER TABLE public.mt5_cashflows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access cashflows of their accounts"
  ON public.mt5_cashflows FOR ALL
  USING (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()));

CREATE INDEX idx_mt5_cashflows_account_time ON public.mt5_cashflows(mt5_account_id, time DESC);

-- =========================
-- 5) mt5_daily_metrics
-- =========================
CREATE TABLE public.mt5_daily_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mt5_account_id UUID NOT NULL REFERENCES public.mt5_accounts(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  start_balance NUMERIC(18,2),
  end_balance NUMERIC(18,2),
  deposits NUMERIC(18,2) NOT NULL DEFAULT 0,
  withdrawals NUMERIC(18,2) NOT NULL DEFAULT 0,
  gross_profit NUMERIC(18,2) NOT NULL DEFAULT 0,
  net_profit NUMERIC(18,2) NOT NULL DEFAULT 0,
  operational_return NUMERIC(18,4) NOT NULL DEFAULT 0,
  max_drawdown NUMERIC(18,4) NOT NULL DEFAULT 0,
  trades INTEGER NOT NULL DEFAULT 0,
  wins INTEGER NOT NULL DEFAULT 0,
  losses INTEGER NOT NULL DEFAULT 0,
  volume NUMERIC(18,4) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (mt5_account_id, date)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.mt5_daily_metrics TO authenticated;
GRANT ALL ON public.mt5_daily_metrics TO service_role;

ALTER TABLE public.mt5_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users access daily metrics of their accounts"
  ON public.mt5_daily_metrics FOR ALL
  USING (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.mt5_accounts a WHERE a.id = mt5_account_id AND a.user_id = auth.uid()));

CREATE INDEX idx_mt5_daily_account_date ON public.mt5_daily_metrics(mt5_account_id, date DESC);

-- =========================
-- updated_at triggers
-- =========================
CREATE TRIGGER trg_mt5_accounts_updated
  BEFORE UPDATE ON public.mt5_accounts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER trg_mt5_daily_metrics_updated
  BEFORE UPDATE ON public.mt5_daily_metrics
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================
-- recompute_mt5_daily_metrics
-- =========================
CREATE OR REPLACE FUNCTION public.recompute_mt5_daily_metrics(p_account UUID, p_date DATE)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_start_balance NUMERIC := 0;
  v_end_balance NUMERIC := 0;
  v_deposits NUMERIC := 0;
  v_withdrawals NUMERIC := 0;
  v_gross_profit NUMERIC := 0;
  v_net_profit NUMERIC := 0;
  v_op_return NUMERIC := 0;
  v_trades INTEGER := 0;
  v_wins INTEGER := 0;
  v_losses INTEGER := 0;
  v_volume NUMERIC := 0;
  v_max_dd NUMERIC := 0;
  v_peak NUMERIC := 0;
BEGIN
  -- start balance: último snapshot ANTES de p_date (00:00 UTC)
  SELECT balance INTO v_start_balance
  FROM mt5_account_snapshots
  WHERE mt5_account_id = p_account
    AND captured_at < (p_date::timestamptz)
  ORDER BY captured_at DESC LIMIT 1;

  -- end balance: último snapshot DENTRO do dia
  SELECT balance INTO v_end_balance
  FROM mt5_account_snapshots
  WHERE mt5_account_id = p_account
    AND captured_at >= (p_date::timestamptz)
    AND captured_at < ((p_date + 1)::timestamptz)
  ORDER BY captured_at DESC LIMIT 1;

  v_start_balance := COALESCE(v_start_balance, 0);
  v_end_balance := COALESCE(v_end_balance, v_start_balance);

  -- cashflows
  SELECT
    COALESCE(SUM(CASE WHEN type IN ('deposit','bonus','credit') AND amount > 0 THEN amount ELSE 0 END), 0),
    COALESCE(SUM(CASE WHEN type = 'withdrawal' THEN ABS(amount) ELSE 0 END), 0)
  INTO v_deposits, v_withdrawals
  FROM mt5_cashflows
  WHERE mt5_account_id = p_account
    AND time >= (p_date::timestamptz)
    AND time < ((p_date + 1)::timestamptz);

  -- deals
  SELECT
    COALESCE(SUM(profit), 0),
    COALESCE(SUM(profit + COALESCE(swap,0) + COALESCE(commission,0) + COALESCE(fee,0)), 0),
    COUNT(*),
    COUNT(*) FILTER (WHERE profit > 0),
    COUNT(*) FILTER (WHERE profit < 0),
    COALESCE(SUM(volume), 0)
  INTO v_gross_profit, v_net_profit, v_trades, v_wins, v_losses, v_volume
  FROM mt5_deals
  WHERE mt5_account_id = p_account
    AND entry IN ('out','inout')
    AND time >= (p_date::timestamptz)
    AND time < ((p_date + 1)::timestamptz);

  -- operational return: variação ajustada / start_balance
  IF v_start_balance > 0 THEN
    v_op_return := ((v_end_balance - v_start_balance - v_deposits + v_withdrawals) / v_start_balance) * 100;
  END IF;

  -- max drawdown intradia: percorre snapshots
  v_peak := COALESCE(v_start_balance, 0);
  FOR v_end_balance IN
    SELECT equity FROM mt5_account_snapshots
    WHERE mt5_account_id = p_account
      AND captured_at >= (p_date::timestamptz)
      AND captured_at < ((p_date + 1)::timestamptz)
    ORDER BY captured_at ASC
  LOOP
    IF v_end_balance > v_peak THEN
      v_peak := v_end_balance;
    END IF;
    IF v_peak > 0 THEN
      v_max_dd := GREATEST(v_max_dd, ((v_peak - v_end_balance) / v_peak) * 100);
    END IF;
  END LOOP;

  -- recalc end_balance (foi sobrescrito no loop)
  SELECT balance INTO v_end_balance
  FROM mt5_account_snapshots
  WHERE mt5_account_id = p_account
    AND captured_at >= (p_date::timestamptz)
    AND captured_at < ((p_date + 1)::timestamptz)
  ORDER BY captured_at DESC LIMIT 1;
  v_end_balance := COALESCE(v_end_balance, v_start_balance);

  INSERT INTO mt5_daily_metrics (
    mt5_account_id, date, start_balance, end_balance, deposits, withdrawals,
    gross_profit, net_profit, operational_return, max_drawdown,
    trades, wins, losses, volume
  ) VALUES (
    p_account, p_date, v_start_balance, v_end_balance, v_deposits, v_withdrawals,
    v_gross_profit, v_net_profit, v_op_return, v_max_dd,
    v_trades, v_wins, v_losses, v_volume
  )
  ON CONFLICT (mt5_account_id, date) DO UPDATE SET
    start_balance = EXCLUDED.start_balance,
    end_balance = EXCLUDED.end_balance,
    deposits = EXCLUDED.deposits,
    withdrawals = EXCLUDED.withdrawals,
    gross_profit = EXCLUDED.gross_profit,
    net_profit = EXCLUDED.net_profit,
    operational_return = EXCLUDED.operational_return,
    max_drawdown = EXCLUDED.max_drawdown,
    trades = EXCLUDED.trades,
    wins = EXCLUDED.wins,
    losses = EXCLUDED.losses,
    volume = EXCLUDED.volume,
    updated_at = now();
END;
$$;

-- Triggers de recálculo
CREATE OR REPLACE FUNCTION public.trg_mt5_recompute_from_snapshot()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_mt5_daily_metrics(NEW.mt5_account_id, (NEW.captured_at AT TIME ZONE 'UTC')::date);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'recompute snapshot failed: %', SQLERRM;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_mt5_recompute_from_deal()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_mt5_daily_metrics(NEW.mt5_account_id, (NEW.time AT TIME ZONE 'UTC')::date);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'recompute deal failed: %', SQLERRM;
  RETURN NEW;
END; $$;

CREATE OR REPLACE FUNCTION public.trg_mt5_recompute_from_cashflow()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  PERFORM public.recompute_mt5_daily_metrics(NEW.mt5_account_id, (NEW.time AT TIME ZONE 'UTC')::date);
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'recompute cashflow failed: %', SQLERRM;
  RETURN NEW;
END; $$;

CREATE TRIGGER trg_mt5_snapshots_recompute
  AFTER INSERT ON public.mt5_account_snapshots
  FOR EACH ROW EXECUTE FUNCTION public.trg_mt5_recompute_from_snapshot();

CREATE TRIGGER trg_mt5_deals_recompute
  AFTER INSERT ON public.mt5_deals
  FOR EACH ROW EXECUTE FUNCTION public.trg_mt5_recompute_from_deal();

CREATE TRIGGER trg_mt5_cashflows_recompute
  AFTER INSERT ON public.mt5_cashflows
  FOR EACH ROW EXECUTE FUNCTION public.trg_mt5_recompute_from_cashflow();

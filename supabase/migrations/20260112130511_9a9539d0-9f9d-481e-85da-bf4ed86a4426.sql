-- Create user trading journal table for personal trading records
CREATE TABLE public.user_trading_journal (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL,
  -- Main metrics
  trades_count INTEGER DEFAULT 0,
  wins INTEGER DEFAULT 0,
  losses INTEGER DEFAULT 0,
  pnl_percent NUMERIC DEFAULT 0,
  -- Optional context fields
  notes TEXT,
  emotional_state TEXT, -- 'good', 'neutral', 'stressed'
  followed_plan BOOLEAN DEFAULT true,
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  -- Constraint to prevent duplicates
  CONSTRAINT unique_user_journal_date UNIQUE (user_id, date)
);

-- Enable RLS
ALTER TABLE public.user_trading_journal ENABLE ROW LEVEL SECURITY;

-- RLS Policies (each user only sees/edits their own data)
CREATE POLICY "Users can view own journal entries"
  ON public.user_trading_journal FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own journal entries"
  ON public.user_trading_journal FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own journal entries"
  ON public.user_trading_journal FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own journal entries"
  ON public.user_trading_journal FOR DELETE
  USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_user_trading_journal_updated_at
  BEFORE UPDATE ON public.user_trading_journal
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
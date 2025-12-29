-- Add new fields to health_scores for complete status information
ALTER TABLE public.health_scores 
ADD COLUMN IF NOT EXISTS profile_type text DEFAULT 'normal' CHECK (profile_type IN ('defensivo', 'normal', 'agressivo')),
ADD COLUMN IF NOT EXISTS risk_level text DEFAULT 'baixo' CHECK (risk_level IN ('baixo', 'moderado', 'alto')),
ADD COLUMN IF NOT EXISTS drawdown_status text DEFAULT 'controlado' CHECK (drawdown_status IN ('controlado', 'em_observacao', 'fora_do_padrao')),
ADD COLUMN IF NOT EXISTS insight_text text;

-- Insert demo health score for today
INSERT INTO public.health_scores (date, score, status, profile_type, risk_level, drawdown_status, insight_text)
VALUES (
  CURRENT_DATE,
  82,
  'success',
  'normal',
  'baixo',
  'controlado',
  'O comportamento atual está alinhado com dias de preservação. O mercado apresenta volatilidade moderada, mantenha foco na gestão de risco.'
)
ON CONFLICT (date) DO UPDATE SET
  score = EXCLUDED.score,
  status = EXCLUDED.status,
  profile_type = EXCLUDED.profile_type,
  risk_level = EXCLUDED.risk_level,
  drawdown_status = EXCLUDED.drawdown_status,
  insight_text = EXCLUDED.insight_text;

-- Add unique constraint on date if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'health_scores_date_key') THEN
    ALTER TABLE public.health_scores ADD CONSTRAINT health_scores_date_key UNIQUE (date);
  END IF;
END $$;

-- Add is_highlight column to messages for curated content
ALTER TABLE public.messages 
ADD COLUMN IF NOT EXISTS is_highlight boolean DEFAULT false;
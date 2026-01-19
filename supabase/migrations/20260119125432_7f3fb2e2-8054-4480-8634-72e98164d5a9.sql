-- Function to calculate health score based on daily reports
CREATE OR REPLACE FUNCTION public.calculate_health_score(target_date date)
RETURNS TABLE (
  calc_score integer,
  calc_status text,
  calc_profile_type text,
  calc_risk_level text,
  calc_drawdown_status text,
  calc_insight_text text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  today_report RECORD;
  streak_count integer := 0;
  recent_positive_days integer := 0;
  total_score integer := 0;
  pnl_score integer := 0;
  winrate_score integer := 0;
  streak_score integer := 0;
  drawdown_score integer := 0;
  trend_score integer := 0;
  insight text;
  status_val text;
  profile_val text;
  risk_val text;
  dd_status_val text;
BEGIN
  -- Get today's report
  SELECT * INTO today_report
  FROM reports_daily
  WHERE date = target_date
    AND published_at IS NOT NULL
  LIMIT 1;

  -- If no report for this date, return null
  IF today_report IS NULL THEN
    RETURN;
  END IF;

  -- 1. PnL Score (30 pts max)
  IF today_report.pnl_percent > 0 THEN
    pnl_score := 30;
  ELSIF today_report.pnl_percent = 0 THEN
    pnl_score := 15;
  ELSE
    pnl_score := GREATEST(0, 10 + (today_report.pnl_percent * 10)::integer);
  END IF;

  -- 2. Win Rate Score (20 pts max)
  winrate_score := LEAST(20, (today_report.win_rate * 0.25)::integer);

  -- 3. Streak Score (15 pts max) - count consecutive positive days
  SELECT COUNT(*) INTO streak_count
  FROM (
    SELECT pnl_percent
    FROM reports_daily
    WHERE date <= target_date
      AND published_at IS NOT NULL
    ORDER BY date DESC
    LIMIT 30
  ) sub
  WHERE pnl_percent > 0;
  
  -- Actually calculate streak properly
  streak_count := 0;
  FOR today_report IN 
    SELECT pnl_percent 
    FROM reports_daily 
    WHERE date <= target_date 
      AND published_at IS NOT NULL
    ORDER BY date DESC 
    LIMIT 30
  LOOP
    IF today_report.pnl_percent > 0 THEN
      streak_count := streak_count + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  streak_score := LEAST(15, streak_count * 3);

  -- Re-fetch today's report since we used the variable
  SELECT * INTO today_report
  FROM reports_daily
  WHERE date = target_date
    AND published_at IS NOT NULL
  LIMIT 1;

  -- 4. Drawdown Score (15 pts max)
  drawdown_score := GREATEST(0, 15 - (today_report.drawdown_percent * 7.5)::integer);

  -- 5. 7-day Trend Score (20 pts max)
  SELECT COUNT(*) INTO recent_positive_days
  FROM reports_daily
  WHERE date > (target_date - interval '7 days')
    AND date <= target_date
    AND published_at IS NOT NULL
    AND pnl_percent > 0;
  
  trend_score := (recent_positive_days * 20 / 7)::integer;

  -- Calculate total score
  total_score := LEAST(100, pnl_score + winrate_score + streak_score + drawdown_score + trend_score);

  -- Determine status
  IF total_score >= 70 THEN
    status_val := 'success';
  ELSIF total_score >= 50 THEN
    status_val := 'warning';
  ELSE
    status_val := 'danger';
  END IF;

  -- Determine profile type based on trades count
  IF today_report.trades_count >= 15 THEN
    profile_val := 'agressivo';
  ELSIF today_report.trades_count <= 5 THEN
    profile_val := 'defensivo';
  ELSE
    profile_val := 'normal';
  END IF;

  -- Determine risk level based on drawdown
  IF today_report.drawdown_percent > 1.5 THEN
    risk_val := 'alto';
  ELSIF today_report.drawdown_percent > 0.5 THEN
    risk_val := 'moderado';
  ELSE
    risk_val := 'baixo';
  END IF;

  -- Determine drawdown status
  IF today_report.drawdown_percent > 2 THEN
    dd_status_val := 'fora_do_padrao';
  ELSIF today_report.drawdown_percent > 1 THEN
    dd_status_val := 'em_observacao';
  ELSE
    dd_status_val := 'controlado';
  END IF;

  -- Generate insight text
  IF streak_count >= 5 THEN
    insight := 'Sequência de ' || streak_count || ' dias positivos. Sistema mantendo excelente consistência operacional.';
  ELSIF today_report.pnl_percent > 0 AND today_report.win_rate >= 60 THEN
    insight := 'Resultado positivo com boa taxa de acerto. Operacional dentro do esperado.';
  ELSIF today_report.pnl_percent > 0 THEN
    insight := 'Dia positivo. Mantenha o foco na gestão de risco.';
  ELSIF today_report.win_rate < 50 THEN
    insight := 'Win rate abaixo de 50%. Recomenda-se cautela nas próximas operações.';
  ELSIF today_report.drawdown_percent > 1.5 THEN
    insight := 'Drawdown acima do padrão. Momento de preservação de capital.';
  ELSE
    insight := 'Resultado dentro da média. Padrão operacional estável.';
  END IF;

  RETURN QUERY SELECT total_score, status_val, profile_val, risk_val, dd_status_val, insight;
END;
$$;

-- Function called by trigger to auto-update health score
CREATE OR REPLACE FUNCTION public.auto_update_health_score()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  calc_result RECORD;
BEGIN
  -- Only process if report is published
  IF NEW.published_at IS NULL THEN
    RETURN NEW;
  END IF;

  -- Calculate health score
  SELECT * INTO calc_result
  FROM calculate_health_score(NEW.date);

  -- If we got a result, upsert into health_scores
  IF calc_result IS NOT NULL AND calc_result.calc_score IS NOT NULL THEN
    INSERT INTO health_scores (date, score, status, profile_type, risk_level, drawdown_status, insight_text)
    VALUES (
      NEW.date,
      calc_result.calc_score,
      calc_result.calc_status::report_status,
      calc_result.calc_profile_type,
      calc_result.calc_risk_level,
      calc_result.calc_drawdown_status,
      calc_result.calc_insight_text
    )
    ON CONFLICT (date) DO UPDATE SET
      score = EXCLUDED.score,
      status = EXCLUDED.status,
      profile_type = EXCLUDED.profile_type,
      risk_level = EXCLUDED.risk_level,
      drawdown_status = EXCLUDED.drawdown_status,
      insight_text = EXCLUDED.insight_text;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger on reports_daily
DROP TRIGGER IF EXISTS auto_health_score_trigger ON reports_daily;
CREATE TRIGGER auto_health_score_trigger
AFTER INSERT OR UPDATE ON reports_daily
FOR EACH ROW
EXECUTE FUNCTION auto_update_health_score();

-- Add unique constraint on health_scores.date if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'health_scores_date_key'
  ) THEN
    ALTER TABLE health_scores ADD CONSTRAINT health_scores_date_key UNIQUE (date);
  END IF;
END $$;
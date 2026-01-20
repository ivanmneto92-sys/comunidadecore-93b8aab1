
-- =============================================
-- SISTEMA DE TEMPORADAS - FASE 1: ESTRUTURA
-- =============================================

-- 1. Tabela de Temporadas
CREATE TABLE public.seasons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  number INTEGER NOT NULL,
  year INTEGER NOT NULL,
  quarter INTEGER NOT NULL CHECK (quarter BETWEEN 1 AND 4),
  name TEXT NOT NULL,
  theme TEXT NOT NULL,
  theme_emoji TEXT NOT NULL,
  description TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_active BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(year, quarter)
);

-- 2. Progresso do usuário por temporada
CREATE TABLE public.user_season_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  season_xp INTEGER DEFAULT 0,
  season_level INTEGER DEFAULT 1,
  prestige_level INTEGER DEFAULT 0,
  streak_penalty_until DATE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, season_id)
);

-- 3. Conquistas de temporada (definições)
CREATE TABLE public.season_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID REFERENCES public.seasons(id) ON DELETE CASCADE,
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  rarity TEXT DEFAULT 'common' CHECK (rarity IN ('common', 'rare', 'epic', 'legendary')),
  xp_reward INTEGER DEFAULT 0,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(code, season_id)
);

-- 4. Conquistas desbloqueadas por usuário/temporada
CREATE TABLE public.user_season_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_id UUID NOT NULL REFERENCES public.season_achievements(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, achievement_id, season_id)
);

-- 5. Títulos conquistados (permanentes)
CREATE TABLE public.user_titles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title_code TEXT NOT NULL,
  title_name TEXT NOT NULL,
  title_emoji TEXT,
  season_id UUID REFERENCES public.seasons(id),
  earned_at TIMESTAMPTZ DEFAULT now(),
  is_equipped BOOLEAN DEFAULT false,
  UNIQUE(user_id, title_code)
);

-- 6. Log de transações de XP (para caps e auditoria)
CREATE TABLE public.xp_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID REFERENCES public.seasons(id),
  source TEXT NOT NULL CHECK (source IN ('checkin', 'performance', 'community', 'tutorial', 'achievement', 'affiliate', 'bonus')),
  xp_season INTEGER NOT NULL DEFAULT 0,
  xp_total INTEGER NOT NULL DEFAULT 0,
  multiplier DECIMAL DEFAULT 1.0,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Rankings de temporada (arquivados ao fim)
CREATE TABLE public.season_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  season_id UUID NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('xp', 'performance', 'community', 'affiliate')),
  rank INTEGER NOT NULL,
  score DECIMAL NOT NULL,
  archived_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(season_id, user_id, category)
);

-- 8. Adicionar colunas à tabela user_xp existente
ALTER TABLE public.user_xp 
ADD COLUMN IF NOT EXISTS prestige_level INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS prestige_bonus DECIMAL DEFAULT 0,
ADD COLUMN IF NOT EXISTS current_title TEXT;

-- =============================================
-- ÍNDICES PARA PERFORMANCE
-- =============================================
CREATE INDEX idx_seasons_active ON public.seasons(is_active) WHERE is_active = true;
CREATE INDEX idx_seasons_dates ON public.seasons(start_date, end_date);
CREATE INDEX idx_user_season_progress_user ON public.user_season_progress(user_id);
CREATE INDEX idx_user_season_progress_season ON public.user_season_progress(season_id);
CREATE INDEX idx_xp_transactions_user_date ON public.xp_transactions(user_id, created_at);
CREATE INDEX idx_xp_transactions_source ON public.xp_transactions(source, created_at);
CREATE INDEX idx_season_achievements_season ON public.season_achievements(season_id);
CREATE INDEX idx_user_titles_user ON public.user_titles(user_id);
CREATE INDEX idx_season_rankings_season ON public.season_rankings(season_id);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Seasons: leitura pública
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Seasons are viewable by everyone" ON public.seasons FOR SELECT USING (true);
CREATE POLICY "Only admins can manage seasons" ON public.seasons FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Season Progress: usuário vê o próprio, admins veem todos
ALTER TABLE public.user_season_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own progress" ON public.user_season_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.user_season_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.user_season_progress FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all progress" ON public.user_season_progress FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- Season Achievements: leitura pública
ALTER TABLE public.season_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Season achievements are viewable by everyone" ON public.season_achievements FOR SELECT USING (true);
CREATE POLICY "Only admins can manage season achievements" ON public.season_achievements FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User Season Achievements: usuário vê o próprio
ALTER TABLE public.user_season_achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own achievements" ON public.user_season_achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can unlock their own achievements" ON public.user_season_achievements FOR INSERT WITH CHECK (auth.uid() = user_id);

-- User Titles: usuário gerencia os próprios
ALTER TABLE public.user_titles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own titles" ON public.user_titles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own titles" ON public.user_titles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own titles" ON public.user_titles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Everyone can view equipped titles" ON public.user_titles FOR SELECT USING (is_equipped = true);

-- XP Transactions: usuário vê o próprio
ALTER TABLE public.xp_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own transactions" ON public.xp_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own transactions" ON public.xp_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Season Rankings: leitura pública (para leaderboards)
ALTER TABLE public.season_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Rankings are viewable by everyone" ON public.season_rankings FOR SELECT USING (true);
CREATE POLICY "Only system can manage rankings" ON public.season_rankings FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- =============================================
-- TRIGGER: Atualizar updated_at
-- =============================================
CREATE TRIGGER update_user_season_progress_updated_at
  BEFORE UPDATE ON public.user_season_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =============================================
-- SEED: Temporada I (2025) - A Forja
-- =============================================
INSERT INTO public.seasons (number, year, quarter, name, theme, theme_emoji, description, start_date, end_date, is_active)
VALUES (
  1, 
  2025, 
  1, 
  'A Forja', 
  'forge', 
  '🔥', 
  'Construção, disciplina, base sólida. Crie hábito e identidade.',
  '2025-01-01',
  '2025-03-31',
  true
);

-- Seed conquistas da Temporada I
INSERT INTO public.season_achievements (season_id, code, name, description, icon, category, rarity, xp_reward, requirement_type, requirement_value, sort_order)
SELECT 
  s.id,
  a.code,
  a.name,
  a.description,
  a.icon,
  a.category,
  a.rarity,
  a.xp_reward,
  a.requirement_type,
  a.requirement_value,
  a.sort_order
FROM public.seasons s,
(VALUES
  ('forja_fogo', 'Forjado no Fogo', '45 dias ativos na temporada', 'Flame', 'consistency', 'epic', 350, 'active_days', 45, 1),
  ('forja_base', 'Base Sólida', '30 dias sem quebrar streak', 'Shield', 'consistency', 'rare', 280, 'streak_unbroken', 30, 2),
  ('forja_construtor', 'Construtor', '15 dias positivos', 'Hammer', 'performance', 'common', 150, 'positive_days', 15, 3),
  ('forja_fundador', 'Fundador da Forja', 'Alcançar nível 50 da temporada', 'Crown', 'special', 'legendary', 700, 'season_level', 50, 4),
  ('forja_inicio', 'Primeiro Dia', 'Fazer check-in no primeiro dia da temporada', 'Sunrise', 'special', 'common', 50, 'first_day_checkin', 1, 5),
  ('forja_semana', 'Semana de Fogo', '7 dias consecutivos de check-in', 'Calendar', 'consistency', 'common', 80, 'streak', 7, 6),
  ('forja_quinzena', 'Quinzena Forte', '15 dias consecutivos de check-in', 'CalendarCheck', 'consistency', 'rare', 180, 'streak', 15, 7),
  ('forja_mes', 'Mês de Ferro', '30 dias consecutivos de check-in', 'Trophy', 'consistency', 'epic', 350, 'streak', 30, 8)
) AS a(code, name, description, icon, category, rarity, xp_reward, requirement_type, requirement_value, sort_order)
WHERE s.year = 2025 AND s.quarter = 1;

-- =============================================
-- FUNÇÃO: Obter temporada ativa
-- =============================================
CREATE OR REPLACE FUNCTION public.get_active_season()
RETURNS TABLE(
  id UUID,
  number INTEGER,
  year INTEGER,
  quarter INTEGER,
  name TEXT,
  theme TEXT,
  theme_emoji TEXT,
  description TEXT,
  start_date DATE,
  end_date DATE,
  days_remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id,
    s.number,
    s.year,
    s.quarter,
    s.name,
    s.theme,
    s.theme_emoji,
    s.description,
    s.start_date,
    s.end_date,
    GREATEST(0, (s.end_date - CURRENT_DATE))::INTEGER as days_remaining
  FROM seasons s
  WHERE s.is_active = true
  LIMIT 1;
END;
$$;

-- =============================================
-- FUNÇÃO: Calcular nível baseado no XP
-- =============================================
CREATE OR REPLACE FUNCTION public.calculate_season_level(p_xp INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  level INTEGER := 1;
  xp_needed INTEGER := 0;
  remaining_xp INTEGER := p_xp;
BEGIN
  WHILE level < 50 AND remaining_xp >= xp_needed LOOP
    -- Curva progressiva de XP
    IF level <= 10 THEN
      xp_needed := level * 50;
    ELSIF level <= 25 THEN
      xp_needed := 500 + (level - 10) * 100;
    ELSIF level <= 40 THEN
      xp_needed := 2000 + (level - 25) * 200;
    ELSE
      xp_needed := 5000 + (level - 40) * 400;
    END IF;
    
    IF remaining_xp >= xp_needed THEN
      remaining_xp := remaining_xp - xp_needed;
      level := level + 1;
    ELSE
      EXIT;
    END IF;
  END LOOP;
  
  RETURN LEAST(level, 50);
END;
$$;

-- =============================================
-- FUNÇÃO: Obter caps de XP do dia
-- =============================================
CREATE OR REPLACE FUNCTION public.get_daily_xp_caps(p_user_id UUID, p_date DATE DEFAULT CURRENT_DATE)
RETURNS TABLE(
  source TEXT,
  cap INTEGER,
  used INTEGER,
  remaining INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  WITH caps AS (
    SELECT 'checkin'::TEXT as src, 20 as cap_val
    UNION ALL SELECT 'performance', 25
    UNION ALL SELECT 'community', 40
    UNION ALL SELECT 'tutorial', 30
    UNION ALL SELECT 'achievement', 100
    UNION ALL SELECT 'affiliate', 50
  ),
  usage AS (
    SELECT 
      t.source as src,
      COALESCE(SUM(t.xp_season), 0)::INTEGER as used_val
    FROM xp_transactions t
    WHERE t.user_id = p_user_id
      AND t.created_at::DATE = p_date
    GROUP BY t.source
  )
  SELECT 
    c.src,
    c.cap_val,
    COALESCE(u.used_val, 0),
    GREATEST(0, c.cap_val - COALESCE(u.used_val, 0))
  FROM caps c
  LEFT JOIN usage u ON c.src = u.src;
END;
$$;

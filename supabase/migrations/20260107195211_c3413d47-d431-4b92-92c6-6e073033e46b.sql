-- Create achievements table
CREATE TABLE public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL,
  xp_reward INTEGER DEFAULT 0,
  rarity TEXT DEFAULT 'common',
  requirement_value INTEGER DEFAULT 1,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_achievements table
CREATE TABLE public.user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  achievement_id UUID NOT NULL REFERENCES public.achievements(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, achievement_id)
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_achievements ENABLE ROW LEVEL SECURITY;

-- Policies for achievements (public read)
CREATE POLICY "Anyone can view achievements"
ON public.achievements
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage achievements"
ON public.achievements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Policies for user_achievements
CREATE POLICY "Users can view their own achievements"
ON public.user_achievements
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own achievements"
ON public.user_achievements
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all user achievements"
ON public.user_achievements
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Seed achievements data
INSERT INTO public.achievements (code, name, description, icon, category, xp_reward, rarity, requirement_value, sort_order) VALUES
-- Consistência
('checkin_7', 'Primeira Chama', '7 dias de check-in consecutivo', '🔥', 'consistency', 50, 'common', 7, 1),
('checkin_14', 'Fogo Crescente', '14 dias de check-in consecutivo', '🔥', 'consistency', 100, 'rare', 14, 2),
('checkin_30', 'Determinação', '30 dias de check-in consecutivo', '⚡', 'consistency', 200, 'rare', 30, 3),
('checkin_60', 'Inabalável', '60 dias de check-in consecutivo', '💪', 'consistency', 400, 'epic', 60, 4),
('checkin_90', 'Lenda da Constância', '90 dias de check-in consecutivo', '👑', 'consistency', 800, 'legendary', 90, 5),

-- Aprendizado
('tutorial_1', 'Primeiro Passo', 'Completou seu primeiro tutorial', '📚', 'learning', 30, 'common', 1, 6),
('tutorial_5', 'Estudante Dedicado', 'Completou 5 tutoriais', '🎓', 'learning', 100, 'rare', 5, 7),
('tutorial_all', 'Mestre do Saber', 'Completou todos os tutoriais', '🏆', 'learning', 500, 'legendary', 999, 8),

-- Comunidade
('message_1', 'Primeira Mensagem', 'Enviou sua primeira mensagem', '💬', 'community', 20, 'common', 1, 9),
('message_10', 'Participativo', 'Enviou 10 mensagens na comunidade', '🗣️', 'community', 50, 'common', 10, 10),
('message_50', 'Membro Ativo', 'Enviou 50 mensagens na comunidade', '🌟', 'community', 150, 'rare', 50, 11),
('message_100', 'Voz da Comunidade', 'Enviou 100 mensagens na comunidade', '🎤', 'community', 300, 'epic', 100, 12),

-- Performance (Streak verde)
('streak_3', 'Sequência Verde', '3 dias positivos consecutivos', '📈', 'performance', 40, 'common', 3, 13),
('streak_7', 'Trader Consistente', '7 dias positivos consecutivos', '💎', 'performance', 100, 'rare', 7, 14),
('streak_14', 'Performance Elite', '14 dias positivos consecutivos', '🏅', 'performance', 250, 'epic', 14, 15),
('streak_30', 'Máquina de Lucro', '30 dias positivos consecutivos', '🚀', 'performance', 600, 'legendary', 30, 16),

-- Afiliados
('affiliate_bronze', 'Parceiro Bronze', 'Alcançou nível Bronze no programa de afiliados', '🥉', 'affiliates', 100, 'common', 1, 17),
('affiliate_silver', 'Parceiro Prata', 'Alcançou nível Prata no programa de afiliados', '🥈', 'affiliates', 200, 'rare', 2, 18),
('affiliate_gold', 'Parceiro Ouro', 'Alcançou nível Ouro no programa de afiliados', '🥇', 'affiliates', 400, 'epic', 3, 19),
('affiliate_diamond', 'Parceiro Diamante', 'Alcançou nível Diamante no programa de afiliados', '💎', 'affiliates', 1000, 'legendary', 4, 20),

-- Especiais
('early_adopter', 'Early Adopter', 'Membro desde o início da plataforma', '🌅', 'special', 500, 'legendary', 1, 21),
('veteran_1y', 'Veterano', '1 ano como membro da comunidade', '🎂', 'special', 1000, 'legendary', 365, 22),
('xp_1000', 'Colecionador de XP', 'Acumulou 1000 XP no total', '✨', 'special', 100, 'rare', 1000, 23);

-- Etapa 1: renomear códigos antigos para nomes temporários
UPDATE public.achievements SET code='__tmp_checkin_14'  WHERE code='checkin_7';
UPDATE public.achievements SET code='__tmp_checkin_30'  WHERE code='checkin_14';
UPDATE public.achievements SET code='__tmp_checkin_60'  WHERE code='checkin_30';
UPDATE public.achievements SET code='__tmp_checkin_120' WHERE code='checkin_60';
UPDATE public.achievements SET code='__tmp_checkin_180' WHERE code='checkin_90';
UPDATE public.achievements SET code='__tmp_streak_5'    WHERE code='streak_3';
UPDATE public.achievements SET code='__tmp_streak_10'   WHERE code='streak_7';
UPDATE public.achievements SET code='__tmp_streak_20'   WHERE code='streak_14';
UPDATE public.achievements SET code='__tmp_streak_40'   WHERE code='streak_30';
UPDATE public.achievements SET code='__tmp_xp_5000'     WHERE code='xp_1000';

-- Etapa 2: aplicar valores finais
UPDATE public.achievements SET code='checkin_14',  name='Primeiras Chamas',      description='Mantenha 14 dias consecutivos de check-in.',  requirement_value=14,  xp_reward=80,   rarity='common'    WHERE code='__tmp_checkin_14';
UPDATE public.achievements SET code='checkin_30',  name='Determinação',          description='Mantenha 30 dias consecutivos de check-in.',  requirement_value=30,  xp_reward=150,  rarity='rare'      WHERE code='__tmp_checkin_30';
UPDATE public.achievements SET code='checkin_60',  name='Inabalável',            description='Mantenha 60 dias consecutivos de check-in.',  requirement_value=60,  xp_reward=300,  rarity='rare'      WHERE code='__tmp_checkin_60';
UPDATE public.achievements SET code='checkin_120', name='Constância de Ferro',   description='Mantenha 120 dias consecutivos de check-in.', requirement_value=120, xp_reward=600,  rarity='epic'      WHERE code='__tmp_checkin_120';
UPDATE public.achievements SET code='checkin_180', name='Lenda da Constância',   description='Mantenha 180 dias consecutivos de check-in.', requirement_value=180, xp_reward=1200, rarity='legendary' WHERE code='__tmp_checkin_180';

UPDATE public.achievements SET code='streak_5',  description='5 dias consecutivos com retorno positivo na sua conta MT5.',  requirement_value=5,  xp_reward=60  WHERE code='__tmp_streak_5';
UPDATE public.achievements SET code='streak_10', description='10 dias consecutivos com retorno positivo na sua conta MT5.', requirement_value=10, xp_reward=150 WHERE code='__tmp_streak_10';
UPDATE public.achievements SET code='streak_20', description='20 dias consecutivos com retorno positivo na sua conta MT5.', requirement_value=20, xp_reward=350 WHERE code='__tmp_streak_20';
UPDATE public.achievements SET code='streak_40', description='40 dias consecutivos com retorno positivo na sua conta MT5.', requirement_value=40, xp_reward=800 WHERE code='__tmp_streak_40';

UPDATE public.achievements SET code='xp_5000', name='Colecionador de XP', description='Acumule 5.000 XP.', requirement_value=5000, xp_reward=200 WHERE code='__tmp_xp_5000';

-- Remover triviais
DELETE FROM public.achievements WHERE code IN ('message_1','message_10','tutorial_1');

-- Ajustes simples
UPDATE public.achievements SET xp_reward=100 WHERE code='message_50';
UPDATE public.achievements SET xp_reward=200 WHERE code='message_100';
UPDATE public.achievements SET xp_reward=100 WHERE code='tutorial_5';
UPDATE public.achievements SET xp_reward=600 WHERE code='tutorial_all';
UPDATE public.achievements SET requirement_value=10, xp_reward=200, description='Aprovação em 10 quizzes diferentes.' WHERE code='quiz_master';
UPDATE public.achievements SET requirement_value=500   WHERE code='affiliate_bronze';
UPDATE public.achievements SET requirement_value=3000  WHERE code='affiliate_silver';
UPDATE public.achievements SET requirement_value=10000 WHERE code='affiliate_gold';
UPDATE public.achievements SET requirement_value=25000 WHERE code='affiliate_diamond';

-- Novas conquistas
INSERT INTO public.achievements (code, name, description, icon, category, xp_reward, rarity, requirement_value, sort_order) VALUES
  ('message_500',  'Pilar da Comunidade', '500 mensagens enviadas.',  '🏛️', 'community',  500,  'epic',      500,  44),
  ('message_1000', 'Voz Eterna',          '1000 mensagens enviadas.', '📣', 'community',  1000, 'legendary', 1000, 45),
  ('tutorial_15',  'Estudante Voraz',     '15 tutoriais completos.',  '📚', 'learning',   300,  'epic',      15,   34),
  ('xp_25000',     'Mestre do XP',        'Acumule 25.000 XP.',       '💎', 'special',    1500, 'legendary', 25000, 95)
ON CONFLICT (code) DO NOTHING;

-- Conquistas sazonais
DELETE FROM public.season_achievements WHERE code='forja_inicio';
UPDATE public.season_achievements SET requirement_value=14, description='14 dias consecutivos de check-in na Forja.' WHERE code='forja_semana';
UPDATE public.season_achievements SET requirement_value=21, description='21 dias consecutivos de check-in na Forja.' WHERE code='forja_quinzena';
UPDATE public.season_achievements SET requirement_value=45, description='45 dias consecutivos de check-in na Forja.' WHERE code='forja_mes';

-- ============================================================
-- Função central de auto-desbloqueio
-- ============================================================
CREATE OR REPLACE FUNCTION public.recheck_achievements(_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r record;
  v_checkin_streak int := 0;
  v_msg_count int := 0;
  v_tut_done int := 0;
  v_tut_total int := 0;
  v_total_xp int := 0;
  v_member_since date;
  v_aff_earnings numeric := 0;
  v_mt5_streak int := 0;
  v_ok boolean;
  v_xp_total_inc int;
BEGIN
  IF _user_id IS NULL THEN RETURN; END IF;

  SELECT streak_count INTO v_checkin_streak
  FROM public.daily_checkins WHERE user_id = _user_id
  ORDER BY checkin_date DESC LIMIT 1;
  v_checkin_streak := COALESCE(v_checkin_streak, 0);

  SELECT COUNT(*) INTO v_msg_count FROM public.messages WHERE user_id = _user_id;
  SELECT COUNT(*) INTO v_tut_done FROM public.tutorial_progress WHERE user_id = _user_id AND completed_at IS NOT NULL;
  SELECT COUNT(*) INTO v_tut_total FROM public.tutorials WHERE is_published = true;
  SELECT COALESCE(total_xp, 0) INTO v_total_xp FROM public.user_xp WHERE user_id = _user_id;
  SELECT created_at::date INTO v_member_since FROM public.profiles WHERE id = _user_id;
  SELECT COALESCE(total_earnings, 0) INTO v_aff_earnings FROM public.affiliates WHERE user_id = _user_id;

  WITH days AS (
    SELECT d.operational_return,
           row_number() OVER (ORDER BY d.date DESC) AS rn
    FROM public.mt5_daily_metrics d
    JOIN public.mt5_accounts a ON a.id = d.mt5_account_id
    WHERE a.user_id = _user_id
    ORDER BY d.date DESC
    LIMIT 90
  )
  SELECT COALESCE(MIN(rn) - 1, (SELECT COUNT(*) FROM days)) INTO v_mt5_streak
  FROM days WHERE operational_return <= 0;
  v_mt5_streak := COALESCE(v_mt5_streak, 0);

  FOR r IN SELECT id, code, requirement_value, xp_reward FROM public.achievements LOOP
    IF EXISTS(SELECT 1 FROM public.user_achievements WHERE user_id = _user_id AND achievement_id = r.id) THEN
      CONTINUE;
    END IF;

    v_ok := CASE
      WHEN r.code LIKE 'checkin_%'                       THEN v_checkin_streak >= r.requirement_value
      WHEN r.code LIKE 'message_%'                       THEN v_msg_count >= r.requirement_value
      WHEN r.code IN ('tutorial_5','tutorial_15')        THEN v_tut_done >= r.requirement_value
      WHEN r.code = 'tutorial_all'                       THEN v_tut_total > 0 AND v_tut_done >= v_tut_total
      WHEN r.code LIKE 'streak_%'                        THEN v_mt5_streak >= r.requirement_value
      WHEN r.code LIKE 'affiliate_%'                     THEN v_aff_earnings >= r.requirement_value
      WHEN r.code LIKE 'xp_%'                            THEN v_total_xp >= r.requirement_value
      WHEN r.code = 'veteran_1y'                         THEN v_member_since IS NOT NULL AND (CURRENT_DATE - v_member_since) >= 365
      WHEN r.code = 'early_adopter'                      THEN v_member_since IS NOT NULL AND v_member_since < DATE '2026-03-01'
      ELSE false
    END;

    IF v_ok THEN
      INSERT INTO public.user_achievements (user_id, achievement_id)
      VALUES (_user_id, r.id) ON CONFLICT DO NOTHING;

      IF r.xp_reward > 0 THEN
        v_xp_total_inc := GREATEST(1, round(r.xp_reward * 0.2)::int);
        INSERT INTO public.xp_transactions (user_id, source, xp_total, xp_season, multiplier, details)
        VALUES (_user_id, 'achievement', v_xp_total_inc, r.xp_reward, 1.0,
                jsonb_build_object('achievement_id', r.id, 'auto', true));
        INSERT INTO public.user_xp (user_id, total_xp) VALUES (_user_id, v_xp_total_inc)
        ON CONFLICT (user_id) DO UPDATE SET total_xp = public.user_xp.total_xp + EXCLUDED.total_xp, updated_at = now();
      END IF;
    END IF;
  END LOOP;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'recheck_achievements failed for %: %', _user_id, SQLERRM;
END;
$$;

REVOKE ALL ON FUNCTION public.recheck_achievements(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.recheck_achievements(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.trg_recheck_from_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN PERFORM public.recheck_achievements(NEW.user_id); RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW; END; $$;

CREATE OR REPLACE FUNCTION public.trg_recheck_from_mt5()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_uid uuid;
BEGIN
  SELECT user_id INTO v_uid FROM public.mt5_accounts WHERE id = NEW.mt5_account_id;
  IF v_uid IS NOT NULL THEN PERFORM public.recheck_achievements(v_uid); END IF;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN RETURN NEW; END; $$;

REVOKE ALL ON FUNCTION public.trg_recheck_from_user() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.trg_recheck_from_mt5()  FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.trg_recheck_from_user() TO service_role;
GRANT EXECUTE ON FUNCTION public.trg_recheck_from_mt5()  TO service_role;

DROP TRIGGER IF EXISTS achievements_recheck_on_checkin   ON public.daily_checkins;
DROP TRIGGER IF EXISTS achievements_recheck_on_message   ON public.messages;
DROP TRIGGER IF EXISTS achievements_recheck_on_tutorial  ON public.tutorial_progress;
DROP TRIGGER IF EXISTS achievements_recheck_on_affiliate ON public.affiliates;
DROP TRIGGER IF EXISTS achievements_recheck_on_xp        ON public.xp_transactions;
DROP TRIGGER IF EXISTS achievements_recheck_on_mt5       ON public.mt5_daily_metrics;

CREATE TRIGGER achievements_recheck_on_checkin   AFTER INSERT ON public.daily_checkins  FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_from_user();
CREATE TRIGGER achievements_recheck_on_message   AFTER INSERT ON public.messages        FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_from_user();
CREATE TRIGGER achievements_recheck_on_tutorial  AFTER INSERT OR UPDATE ON public.tutorial_progress FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_from_user();
CREATE TRIGGER achievements_recheck_on_affiliate AFTER UPDATE OF total_earnings ON public.affiliates FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_from_user();
CREATE TRIGGER achievements_recheck_on_xp        AFTER INSERT ON public.xp_transactions FOR EACH ROW WHEN (NEW.source <> 'achievement') EXECUTE FUNCTION public.trg_recheck_from_user();
CREATE TRIGGER achievements_recheck_on_mt5       AFTER INSERT OR UPDATE ON public.mt5_daily_metrics FOR EACH ROW EXECUTE FUNCTION public.trg_recheck_from_mt5();

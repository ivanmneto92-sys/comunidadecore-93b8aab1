
CREATE TABLE public.tutorial_quizzes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tutorial_id UUID NOT NULL UNIQUE REFERENCES public.tutorials(id) ON DELETE CASCADE,
  passing_score INTEGER NOT NULL DEFAULT 70,
  xp_reward INTEGER NOT NULL DEFAULT 30,
  max_attempts INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tutorial_quizzes TO authenticated;
GRANT ALL ON public.tutorial_quizzes TO service_role;
ALTER TABLE public.tutorial_quizzes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "quizzes_select_auth" ON public.tutorial_quizzes FOR SELECT TO authenticated USING (true);
CREATE POLICY "quizzes_admin_write" ON public.tutorial_quizzes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_tutorial_quizzes_updated BEFORE UPDATE ON public.tutorial_quizzes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.quiz_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_id UUID NOT NULL REFERENCES public.tutorial_quizzes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  explanation TEXT,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_questions TO authenticated;
GRANT ALL ON public.quiz_questions TO service_role;
ALTER TABLE public.quiz_questions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "questions_select_auth" ON public.quiz_questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "questions_admin_write" ON public.quiz_questions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER trg_quiz_questions_updated BEFORE UPDATE ON public.quiz_questions FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE INDEX idx_quiz_questions_quiz ON public.quiz_questions(quiz_id, order_index);

CREATE TABLE public.quiz_options (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  question_id UUID NOT NULL REFERENCES public.quiz_questions(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  order_index INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.quiz_options TO authenticated;
GRANT ALL ON public.quiz_options TO service_role;
ALTER TABLE public.quiz_options ENABLE ROW LEVEL SECURITY;
CREATE POLICY "options_select_auth" ON public.quiz_options FOR SELECT TO authenticated USING (true);
CREATE POLICY "options_admin_write" ON public.quiz_options FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE INDEX idx_quiz_options_question ON public.quiz_options(question_id, order_index);

CREATE TABLE public.quiz_attempts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quiz_id UUID NOT NULL REFERENCES public.tutorial_quizzes(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  score INTEGER NOT NULL,
  passed BOOLEAN NOT NULL,
  answers JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.quiz_attempts TO authenticated;
GRANT ALL ON public.quiz_attempts TO service_role;
ALTER TABLE public.quiz_attempts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "attempts_select_own" ON public.quiz_attempts FOR SELECT TO authenticated USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "attempts_insert_own" ON public.quiz_attempts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_quiz_attempts_user ON public.quiz_attempts(user_id, quiz_id, created_at DESC);

INSERT INTO public.achievements (code, name, description, category, rarity, xp_reward, icon)
VALUES ('quiz_master','Quiz Master','Aprove em 5 quizzes da Academy','academy','rare',100,'GraduationCap')
ON CONFLICT (code) DO NOTHING;

CREATE OR REPLACE FUNCTION public.on_quiz_attempt_passed()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_xp_reward INTEGER;
  v_already_passed BOOLEAN;
  v_passed_count INTEGER;
  v_cap_remaining INTEGER;
  v_xp_to_award INTEGER;
  v_active_season_id UUID;
BEGIN
  IF NEW.passed IS NOT TRUE THEN
    RETURN NEW;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.quiz_attempts
    WHERE user_id = NEW.user_id AND quiz_id = NEW.quiz_id AND passed = true AND id <> NEW.id
  ) INTO v_already_passed;

  INSERT INTO public.tutorial_progress (user_id, tutorial_id, completed_at)
  VALUES (NEW.user_id, NEW.tutorial_id, now())
  ON CONFLICT (user_id, tutorial_id) DO UPDATE
    SET completed_at = COALESCE(public.tutorial_progress.completed_at, EXCLUDED.completed_at);

  IF v_already_passed THEN
    RETURN NEW;
  END IF;

  SELECT xp_reward INTO v_xp_reward FROM public.tutorial_quizzes WHERE id = NEW.quiz_id;
  SELECT remaining INTO v_cap_remaining FROM public.get_daily_xp_caps(NEW.user_id, CURRENT_DATE) WHERE source = 'tutorial';
  v_xp_to_award := LEAST(COALESCE(v_xp_reward,30), COALESCE(v_cap_remaining,0));

  SELECT id INTO v_active_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  IF v_xp_to_award > 0 THEN
    INSERT INTO public.xp_transactions (user_id, source, xp_total, xp_season, season_id, details)
    VALUES (NEW.user_id, 'tutorial', v_xp_to_award, v_xp_to_award, v_active_season_id,
            jsonb_build_object('quiz_id', NEW.quiz_id, 'reason','quiz_passed'));
  END IF;

  SELECT COUNT(DISTINCT quiz_id) INTO v_passed_count
  FROM public.quiz_attempts WHERE user_id = NEW.user_id AND passed = true;

  IF v_passed_count >= 5 THEN
    INSERT INTO public.user_achievements (user_id, achievement_id)
    SELECT NEW.user_id, id FROM public.achievements WHERE code = 'quiz_master'
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'on_quiz_attempt_passed failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_quiz_attempt_passed
AFTER INSERT ON public.quiz_attempts
FOR EACH ROW EXECUTE FUNCTION public.on_quiz_attempt_passed();

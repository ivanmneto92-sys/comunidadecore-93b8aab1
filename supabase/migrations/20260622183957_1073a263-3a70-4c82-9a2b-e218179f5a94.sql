
DROP POLICY IF EXISTS "Anyone can view published posts" ON public.community_posts;
DROP POLICY IF EXISTS "Authenticated users can view published posts" ON public.community_posts;
CREATE POLICY "Authenticated users can view published posts"
  ON public.community_posts FOR SELECT TO authenticated
  USING (published_at IS NOT NULL OR created_by = auth.uid());

DROP POLICY IF EXISTS "Anyone can view season achievements" ON public.season_achievements;
DROP POLICY IF EXISTS "Season achievements are viewable by everyone" ON public.season_achievements;
DROP POLICY IF EXISTS "Authenticated users can view season achievements" ON public.season_achievements;
CREATE POLICY "Authenticated users can view season achievements"
  ON public.season_achievements FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view season rankings" ON public.season_rankings;
DROP POLICY IF EXISTS "Season rankings are viewable by everyone" ON public.season_rankings;
DROP POLICY IF EXISTS "Authenticated users can view season rankings" ON public.season_rankings;
CREATE POLICY "Authenticated users can view season rankings"
  ON public.season_rankings FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view seasons" ON public.seasons;
DROP POLICY IF EXISTS "Seasons are viewable by everyone" ON public.seasons;
DROP POLICY IF EXISTS "Authenticated users can view seasons" ON public.seasons;
CREATE POLICY "Authenticated users can view seasons"
  ON public.seasons FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view trading config" ON public.trading_config;
DROP POLICY IF EXISTS "Trading config viewable by everyone" ON public.trading_config;
DROP POLICY IF EXISTS "Authenticated users can view trading config" ON public.trading_config;
CREATE POLICY "Authenticated users can view trading config"
  ON public.trading_config FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Anyone can view visible tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Authenticated users can view visible categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Authenticated users can view visible tutorial categories" ON public.tutorial_categories;
CREATE POLICY "Authenticated users can view visible tutorial categories"
  ON public.tutorial_categories FOR SELECT TO authenticated
  USING (is_visible = true OR public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "options_select_auth" ON public.quiz_options;
DROP POLICY IF EXISTS "Anyone authenticated can view quiz options" ON public.quiz_options;
DROP POLICY IF EXISTS "Admins can view full quiz options" ON public.quiz_options;
CREATE POLICY "Admins can view full quiz options"
  ON public.quiz_options FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE OR REPLACE VIEW public.quiz_options_public
WITH (security_invoker = on) AS
  SELECT id, question_id, text, order_index FROM public.quiz_options;

GRANT SELECT ON public.quiz_options_public TO authenticated;

CREATE OR REPLACE FUNCTION public.submit_quiz_attempt(
  p_quiz_id uuid, p_tutorial_id uuid, p_answers jsonb
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_user uuid := auth.uid();
  v_passing integer; v_total integer; v_correct integer := 0;
  v_score integer := 0; v_passed boolean := false;
  v_per_q jsonb := '[]'::jsonb; v_row record; v_is_correct boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT passing_score INTO v_passing FROM public.tutorial_quizzes
    WHERE id = p_quiz_id AND tutorial_id = p_tutorial_id;
  IF v_passing IS NULL THEN RAISE EXCEPTION 'Quiz not found'; END IF;
  SELECT COUNT(*) INTO v_total FROM public.quiz_questions WHERE quiz_id = p_quiz_id;
  IF v_total = 0 THEN RAISE EXCEPTION 'Quiz has no questions'; END IF;

  FOR v_row IN
    SELECT (a->>'question_id')::uuid AS question_id,
           NULLIF(a->>'option_id','')::uuid AS option_id
    FROM jsonb_array_elements(p_answers) a
  LOOP
    v_is_correct := false;
    IF v_row.option_id IS NOT NULL THEN
      SELECT COALESCE(o.is_correct, false) INTO v_is_correct
      FROM public.quiz_options o
      WHERE o.id = v_row.option_id AND o.question_id = v_row.question_id;
    END IF;
    IF v_is_correct THEN v_correct := v_correct + 1; END IF;
    v_per_q := v_per_q || jsonb_build_object(
      'question_id', v_row.question_id,
      'option_id', v_row.option_id,
      'correct', COALESCE(v_is_correct, false)
    );
  END LOOP;

  v_score := ROUND((v_correct::numeric / v_total::numeric) * 100);
  v_passed := v_score >= v_passing;

  INSERT INTO public.quiz_attempts (user_id, quiz_id, tutorial_id, score, passed, answers)
  VALUES (v_user, p_quiz_id, p_tutorial_id, v_score, v_passed, v_per_q);

  RETURN jsonb_build_object(
    'score', v_score, 'passed', v_passed,
    'passing_score', v_passing, 'per_question', v_per_q
  );
END; $$;

REVOKE EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, uuid, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.submit_quiz_attempt(uuid, uuid, jsonb) TO authenticated;


-- =========================================================
-- 1. NOTIFICATIONS: lock down INSERT and add SECURITY DEFINER helpers
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;

CREATE POLICY "Users can create own notifications"
  ON public.notifications FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.send_mention_notification(
  _target_user_id uuid,
  _message_id uuid,
  _channel_id uuid,
  _channel_name text,
  _content text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_notify_mentions boolean;
  v_muted uuid[];
  v_sender_name text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _target_user_id = v_user THEN RETURN; END IF;

  -- Caller must own the message and the message must reference the target
  IF NOT EXISTS (
    SELECT 1 FROM public.messages
    WHERE id = _message_id
      AND user_id = v_user
      AND content LIKE '%' || _target_user_id::text || '%'
  ) THEN
    RAISE EXCEPTION 'Invalid mention';
  END IF;

  SELECT notify_mentions, muted_channels
    INTO v_notify_mentions, v_muted
  FROM public.user_notification_settings
  WHERE user_id = _target_user_id;

  IF v_notify_mentions = false THEN RETURN; END IF;
  IF v_muted IS NOT NULL AND _channel_id = ANY(v_muted) THEN RETURN; END IF;

  SELECT display_name INTO v_sender_name FROM public.profiles WHERE id = v_user;

  INSERT INTO public.notifications (
    user_id, type, title, message, link, related_message_id, related_channel_id
  ) VALUES (
    _target_user_id, 'mention',
    COALESCE(v_sender_name, 'Alguém') || ' mencionou você',
    left(COALESCE(_content, ''), 140),
    '/community?channel=' || _channel_name,
    _message_id, _channel_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.send_reply_notification(
  _target_user_id uuid,
  _reply_message_id uuid,
  _channel_id uuid,
  _channel_name text,
  _content text
) RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_notify_replies boolean;
  v_muted uuid[];
  v_sender_name text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _target_user_id = v_user THEN RETURN; END IF;

  -- Caller must own the reply, and reply must point to a message owned by target
  IF NOT EXISTS (
    SELECT 1
    FROM public.messages r
    JOIN public.messages p ON p.id = r.parent_id
    WHERE r.id = _reply_message_id
      AND r.user_id = v_user
      AND p.user_id = _target_user_id
  ) THEN
    RAISE EXCEPTION 'Invalid reply';
  END IF;

  SELECT notify_replies, muted_channels
    INTO v_notify_replies, v_muted
  FROM public.user_notification_settings
  WHERE user_id = _target_user_id;

  IF v_notify_replies = false THEN RETURN; END IF;
  IF v_muted IS NOT NULL AND _channel_id = ANY(v_muted) THEN RETURN; END IF;

  SELECT display_name INTO v_sender_name FROM public.profiles WHERE id = v_user;

  INSERT INTO public.notifications (
    user_id, type, title, message, link, related_message_id, related_channel_id
  ) VALUES (
    _target_user_id, 'reply',
    COALESCE(v_sender_name, 'Alguém') || ' respondeu sua mensagem',
    left(COALESCE(_content, ''), 140),
    '/community?channel=' || _channel_name,
    _reply_message_id, _channel_id
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.send_mention_notification(uuid,uuid,uuid,text,text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.send_reply_notification(uuid,uuid,uuid,text,text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.send_mention_notification(uuid,uuid,uuid,text,text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_reply_notification(uuid,uuid,uuid,text,text) TO authenticated;

-- =========================================================
-- 2. USER_XP / XP_TRANSACTIONS: lock down, expose add_xp RPC
-- =========================================================
DROP POLICY IF EXISTS "Users can insert their own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can update their own xp" ON public.user_xp;
DROP POLICY IF EXISTS "Users can insert their own transactions" ON public.xp_transactions;

CREATE OR REPLACE FUNCTION public.add_xp(
  _source text,
  _amount integer,
  _multiplier numeric DEFAULT 1.0,
  _details jsonb DEFAULT NULL
) RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_cap_remaining integer;
  v_capped integer;
  v_season_id uuid;
  v_progress record;
  v_xp_season integer;
  v_xp_total integer;
  v_new_season_xp integer;
  v_new_level integer;
  v_new_total_xp integer;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _source NOT IN ('checkin','performance','community','tutorial','achievement','affiliate','bonus') THEN
    RAISE EXCEPTION 'Invalid xp source: %', _source;
  END IF;
  IF _amount IS NULL OR _amount <= 0 OR _amount > 1000 THEN
    RAISE EXCEPTION 'Invalid xp amount';
  END IF;
  IF _multiplier IS NULL OR _multiplier < 1 OR _multiplier > 5 THEN
    _multiplier := 1.0;
  END IF;

  SELECT remaining INTO v_cap_remaining
  FROM public.get_daily_xp_caps(v_user, CURRENT_DATE)
  WHERE source = _source;

  v_capped := LEAST(_amount, COALESCE(v_cap_remaining, 0));
  IF v_capped <= 0 THEN
    RETURN jsonb_build_object('xp_added', 0, 'capped', true);
  END IF;

  v_xp_season := round(v_capped * _multiplier)::int;
  v_xp_total  := round(v_xp_season * 0.2)::int;

  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;

  INSERT INTO public.xp_transactions (
    user_id, season_id, source, xp_season, xp_total, multiplier, details
  ) VALUES (
    v_user, v_season_id, _source, v_xp_season, v_xp_total, _multiplier, _details
  );

  IF v_season_id IS NOT NULL THEN
    SELECT * INTO v_progress
    FROM public.user_season_progress
    WHERE user_id = v_user AND season_id = v_season_id;

    IF v_progress.id IS NOT NULL THEN
      v_new_season_xp := COALESCE(v_progress.season_xp, 0) + v_xp_season;
      v_new_level := public.calculate_season_level(v_new_season_xp);
      UPDATE public.user_season_progress
         SET season_xp = v_new_season_xp,
             season_level = v_new_level,
             updated_at = now()
       WHERE id = v_progress.id;
    END IF;
  END IF;

  INSERT INTO public.user_xp (user_id, total_xp)
  VALUES (v_user, v_xp_total)
  ON CONFLICT (user_id) DO UPDATE
    SET total_xp = public.user_xp.total_xp + v_xp_total,
        updated_at = now();

  SELECT total_xp INTO v_new_total_xp FROM public.user_xp WHERE user_id = v_user;

  RETURN jsonb_build_object(
    'xp_added', v_xp_season,
    'xp_total_added', v_xp_total,
    'new_season_xp', v_new_season_xp,
    'new_season_level', v_new_level,
    'new_total_xp', v_new_total_xp,
    'capped', v_capped < _amount
  );
END;
$$;

REVOKE EXECUTE ON FUNCTION public.add_xp(text,integer,numeric,jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.add_xp(text,integer,numeric,jsonb) TO authenticated;

-- =========================================================
-- 3. USER_ACHIEVEMENTS / USER_SEASON_ACHIEVEMENTS / USER_TITLES
-- =========================================================
DROP POLICY IF EXISTS "Users can insert their own achievements" ON public.user_achievements;
DROP POLICY IF EXISTS "Users can unlock their own achievements" ON public.user_season_achievements;
DROP POLICY IF EXISTS "Users can insert their own titles" ON public.user_titles;

CREATE OR REPLACE FUNCTION public.claim_achievement(_achievement_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_xp integer;
  v_already boolean;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT xp_reward INTO v_xp FROM public.achievements WHERE id = _achievement_id;
  IF v_xp IS NULL THEN RAISE EXCEPTION 'Achievement not found'; END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.user_achievements
    WHERE user_id = v_user AND achievement_id = _achievement_id
  ) INTO v_already;

  IF v_already THEN
    RETURN jsonb_build_object('claimed', false, 'already', true);
  END IF;

  INSERT INTO public.user_achievements (user_id, achievement_id)
  VALUES (v_user, _achievement_id)
  ON CONFLICT (user_id, achievement_id) DO NOTHING;

  IF v_xp > 0 THEN
    PERFORM public.add_xp('achievement', v_xp, 1.0,
      jsonb_build_object('achievement_id', _achievement_id));
  END IF;

  RETURN jsonb_build_object('claimed', true, 'xp_reward', v_xp);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_achievement_by_code(_code text)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_id uuid;
BEGIN
  SELECT id INTO v_id FROM public.achievements WHERE code = _code;
  IF v_id IS NULL THEN RAISE EXCEPTION 'Achievement code not found: %', _code; END IF;
  RETURN public.claim_achievement(v_id);
END;
$$;

CREATE OR REPLACE FUNCTION public.claim_season_achievement(_achievement_id uuid)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_user uuid := auth.uid();
  v_xp integer;
  v_season_id uuid;
  v_ach_season uuid;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT xp_reward, season_id INTO v_xp, v_ach_season
  FROM public.season_achievements WHERE id = _achievement_id;
  IF v_xp IS NULL THEN RAISE EXCEPTION 'Season achievement not found'; END IF;

  SELECT id INTO v_season_id FROM public.seasons WHERE is_active = true LIMIT 1;
  IF v_ach_season IS NOT NULL AND v_ach_season <> v_season_id THEN
    RAISE EXCEPTION 'Achievement is not from the active season';
  END IF;

  INSERT INTO public.user_season_achievements (user_id, achievement_id, season_id)
  VALUES (v_user, _achievement_id, COALESCE(v_ach_season, v_season_id))
  ON CONFLICT DO NOTHING;

  IF v_xp > 0 THEN
    PERFORM public.add_xp('achievement', v_xp, 1.0,
      jsonb_build_object('season_achievement_id', _achievement_id));
  END IF;

  RETURN jsonb_build_object('claimed', true, 'xp_reward', v_xp);
END;
$$;

REVOKE EXECUTE ON FUNCTION public.claim_achievement(uuid) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_achievement_by_code(text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.claim_season_achievement(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_achievement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_achievement_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_season_achievement(uuid) TO authenticated;

-- =========================================================
-- 4. PUBLIC EXPOSURE: restrict to authenticated only
-- =========================================================
DROP POLICY IF EXISTS "Authenticated users can view monthly returns" ON public.monthly_returns;
CREATE POLICY "Authenticated users can view monthly returns"
  ON public.monthly_returns FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view polls" ON public.polls;
CREATE POLICY "Authenticated users can view polls"
  ON public.polls FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view poll options" ON public.poll_options;
CREATE POLICY "Authenticated users can view poll options"
  ON public.poll_options FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Authenticated users can view votes" ON public.poll_votes;
CREATE POLICY "Authenticated users can view votes"
  ON public.poll_votes FOR SELECT
  TO authenticated
  USING (true);

-- Revoke anon SELECT on these tables (defense in depth)
REVOKE SELECT ON public.monthly_returns FROM anon;
REVOKE SELECT ON public.polls FROM anon;
REVOKE SELECT ON public.poll_options FROM anon;
REVOKE SELECT ON public.poll_votes FROM anon;

-- =========================================================
-- 5. BROADCASTS: allow authenticated SELECT
-- =========================================================
CREATE POLICY "Authenticated users can view broadcasts"
  ON public.broadcasts FOR SELECT
  TO authenticated
  USING (true);

-- =========================================================
-- 6. PASSWORD_RESET_TOKENS: deny all client access (service role only)
-- =========================================================
REVOKE ALL ON public.password_reset_tokens FROM anon, authenticated;
GRANT ALL ON public.password_reset_tokens TO service_role;
CREATE POLICY "No client access to reset tokens"
  ON public.password_reset_tokens FOR ALL
  TO authenticated
  USING (false)
  WITH CHECK (false);

-- =========================================================
-- 7. STORAGE: restrict listing on public buckets (CDN URLs still work)
-- =========================================================
DROP POLICY IF EXISTS "Avatar images are publicly accessible" ON storage.objects;
DROP POLICY IF EXISTS "Chat images are publicly accessible" ON storage.objects;

CREATE POLICY "Authenticated users can read avatars"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'avatars');

CREATE POLICY "Authenticated users can read chat images"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'chat-images');

-- =========================================================
-- 8. REVOKE EXECUTE on internal SECURITY DEFINER functions
-- =========================================================
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.generate_affiliate_code() FROM anon;

-- =========================================================
-- 9. REALTIME: require authenticated subscriptions
-- =========================================================
DO $$
BEGIN
  ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

DO $$
BEGIN
  EXECUTE 'CREATE POLICY "Authenticated can use realtime" ON realtime.messages FOR SELECT TO authenticated USING (true)';
EXCEPTION WHEN duplicate_object THEN NULL;
WHEN OTHERS THEN NULL;
END $$;

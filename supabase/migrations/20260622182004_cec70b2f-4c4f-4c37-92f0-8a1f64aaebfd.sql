
-- 1) user_roles: explicit admin-only INSERT/UPDATE/DELETE policies
CREATE POLICY "Only admins can insert roles"
  ON public.user_roles FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can update roles"
  ON public.user_roles FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Only admins can delete roles"
  ON public.user_roles FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- 2) bot_templates
DROP POLICY IF EXISTS "Authenticated can view active templates" ON public.bot_templates;
CREATE POLICY "Authenticated can view active templates"
  ON public.bot_templates FOR SELECT TO authenticated
  USING (is_active = true);

-- 3) channel_categories
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.channel_categories;
CREATE POLICY "Authenticated users can view categories"
  ON public.channel_categories FOR SELECT TO authenticated
  USING (true);

-- 4) season_rankings
DROP POLICY IF EXISTS "Rankings are viewable by everyone" ON public.season_rankings;
CREATE POLICY "Rankings viewable by authenticated users"
  ON public.season_rankings FOR SELECT TO authenticated
  USING (true);

-- 5) chat-files bucket
DROP POLICY IF EXISTS "Anyone can read chat files" ON storage.objects;
CREATE POLICY "Users can read their own chat files"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'chat-files'
    AND (auth.uid())::text = (storage.foldername(name))[1]
  );

-- 5b) Public buckets: remove listing policies (public URL fetch bypasses RLS)
DROP POLICY IF EXISTS "Authenticated users can read avatars" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can read chat images" ON storage.objects;

-- 6) payout_requests: column-level grants exclude payment_details + payment_method
REVOKE SELECT ON public.payout_requests FROM authenticated;
GRANT SELECT (id, affiliate_id, amount, status, created_at, processed_at, processed_by)
  ON public.payout_requests TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.payout_requests TO authenticated;
GRANT ALL ON public.payout_requests TO service_role;

-- 7) Lock down EXECUTE on SECURITY DEFINER functions
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;

REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.add_xp(text, integer, numeric, jsonb) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.send_mention_notification(uuid, uuid, uuid, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.send_reply_notification(uuid, uuid, uuid, text, text) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM authenticated;

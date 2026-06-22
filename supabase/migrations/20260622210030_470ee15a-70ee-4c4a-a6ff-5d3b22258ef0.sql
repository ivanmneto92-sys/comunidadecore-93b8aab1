
-- 1) SECURITY DEFINER: revoke EXECUTE from anon/authenticated for trigger-only / internal functions
REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM PUBLIC, anon, authenticated;

-- 2) chat-files storage: drop loose substring policy + redundant owner read, add tight policies
DROP POLICY IF EXISTS "Authenticated can read chat files referenced in messages" ON storage.objects;
DROP POLICY IF EXISTS "Users can read their own chat files" ON storage.objects;

CREATE POLICY "Chat files: owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Chat files: read when exact-referenced in a message"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.file_url IS NOT NULL
      AND (
        m.file_url = storage.objects.name
        OR m.file_url LIKE '%/' || storage.objects.name
      )
  )
);

-- 3) quiz_options: ensure no grants/policy exposes is_correct to non-admins
REVOKE ALL ON public.quiz_options FROM PUBLIC, anon, authenticated;
GRANT ALL ON public.quiz_options TO service_role;
-- (admin reads/writes already covered by has_role policies; non-admins must use the quiz_options_public view)

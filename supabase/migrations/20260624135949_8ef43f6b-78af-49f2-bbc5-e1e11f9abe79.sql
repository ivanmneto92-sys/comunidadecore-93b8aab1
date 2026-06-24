-- chat-images is now private; mirror chat-files policies
DROP POLICY IF EXISTS "Chat images: owner read" ON storage.objects;
CREATE POLICY "Chat images: owner read"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND (auth.uid())::text = (storage.foldername(name))[1]
);

DROP POLICY IF EXISTS "Chat images: read when referenced in a message" ON storage.objects;
CREATE POLICY "Chat images: read when referenced in a message"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-images'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.image_url IS NOT NULL
      AND (m.image_url = objects.name OR m.image_url LIKE '%/' || objects.name)
  )
);

-- Lock down internal SECURITY DEFINER functions from direct user execution
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recheck_from_mt5() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recheck_from_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recheck_achievements(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_mention_notification(uuid, uuid, uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.send_reply_notification(uuid, uuid, uuid, text, text) FROM PUBLIC, anon;
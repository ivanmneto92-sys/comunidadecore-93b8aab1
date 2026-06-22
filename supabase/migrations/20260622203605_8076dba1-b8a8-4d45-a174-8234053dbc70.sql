
-- Internal trigger / backend-only SECURITY DEFINER functions should not be client-callable.
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.update_updated_at_column() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.send_mention_notification(uuid, uuid, uuid, text, text) FROM PUBLIC, anon;
REVOKE EXECUTE ON FUNCTION public.send_reply_notification(uuid, uuid, uuid, text, text) FROM PUBLIC, anon;

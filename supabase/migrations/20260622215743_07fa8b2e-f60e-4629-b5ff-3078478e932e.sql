
-- 1) user_season_progress: remove direct write policies
DROP POLICY IF EXISTS "Users can insert their own progress" ON public.user_season_progress;
DROP POLICY IF EXISTS "Users can update their own progress" ON public.user_season_progress;
-- SELECT policies for owner + admin remain. Writes only via SECURITY DEFINER add_xp().

-- 2) mt5_accounts.api_token_hash: revoke column from clients
REVOKE SELECT (api_token_hash), UPDATE (api_token_hash), INSERT (api_token_hash)
  ON public.mt5_accounts FROM authenticated;
REVOKE SELECT (api_token_hash), UPDATE (api_token_hash), INSERT (api_token_hash)
  ON public.mt5_accounts FROM anon;
-- service_role retains full access via GRANT ALL.
GRANT ALL ON public.mt5_accounts TO service_role;

-- 3) SECURITY DEFINER functions: revoke EXECUTE from authenticated/anon/public
-- for internal trigger/maintenance functions. Keep client-called RPCs executable.
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.notify_push_on_message() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.on_quiz_attempt_passed() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.auto_update_health_score() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.calculate_health_score(date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recheck_achievements(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.recompute_mt5_daily_metrics(uuid, date) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_cashflow() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_deal() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_mt5_recompute_from_snapshot() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recheck_from_mt5() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trg_recheck_from_user() FROM PUBLIC, anon, authenticated;

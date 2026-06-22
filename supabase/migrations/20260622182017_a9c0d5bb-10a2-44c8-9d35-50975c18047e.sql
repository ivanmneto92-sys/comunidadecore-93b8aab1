
-- Revoke default PUBLIC EXECUTE on all public functions
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM PUBLIC;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM anon;
REVOKE EXECUTE ON ALL FUNCTIONS IN SCHEMA public FROM authenticated;

-- Re-grant EXECUTE to authenticated ONLY for client-callable functions
GRANT EXECUTE ON FUNCTION public.claim_achievement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_achievement_by_code(text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.claim_season_achievement(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_active_season() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_daily_xp_caps(uuid, date) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_unread_counts(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, app_role) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin_or_mod(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_mention_notification(uuid, uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.send_reply_notification(uuid, uuid, uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.generate_affiliate_code() TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_season_level(integer) TO authenticated;

-- service_role retains full access via the default grant chain (not revoked above).
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO service_role;

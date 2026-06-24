-- Revoke EXECUTE on internal helper SECURITY DEFINER function not meant for direct client calls
REVOKE EXECUTE ON FUNCTION public.is_admin_or_mod(uuid) FROM PUBLIC, anon, authenticated;
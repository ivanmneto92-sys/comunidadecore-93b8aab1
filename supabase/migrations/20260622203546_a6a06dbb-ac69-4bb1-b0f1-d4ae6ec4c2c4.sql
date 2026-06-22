
-- 1) moderation_reports: reporters can view their own submissions
CREATE POLICY "Reporters can view their own reports"
ON public.moderation_reports
FOR SELECT
TO authenticated
USING (reporter_id = auth.uid());

-- 2) chat-files storage: allow authenticated users to read files referenced in any message
CREATE POLICY "Authenticated can read chat files referenced in messages"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'chat-files'
  AND EXISTS (
    SELECT 1 FROM public.messages m
    WHERE m.file_url IS NOT NULL
      AND m.file_url LIKE '%' || name
  )
);

-- 3) Lock down add_xp: must not be callable by clients (privilege escalation risk).
REVOKE EXECUTE ON FUNCTION public.add_xp(text, integer, numeric, jsonb) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.add_xp(text, integer, numeric, jsonb) TO service_role;

-- 4) quiz_options: ensure regular users can only read via the safe view.
-- Grant table-level privileges; the existing admin-only SELECT RLS policy blocks non-admins.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.quiz_options TO authenticated;
GRANT ALL ON public.quiz_options TO service_role;
GRANT SELECT ON public.quiz_options_public TO authenticated, anon;

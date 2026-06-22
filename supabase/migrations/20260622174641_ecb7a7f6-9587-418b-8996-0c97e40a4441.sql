
-- Replace avatar upload/update policies with stricter server-side validation
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;

CREATE POLICY "Users can upload valid avatar images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png')
  AND COALESCE((metadata->>'size')::bigint, 0) <= 5242880
  AND COALESCE((metadata->>'size')::bigint, 0) > 0
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (auth.uid())::text = (storage.foldername(name))[1]
  AND lower(COALESCE(metadata->>'mimetype', '')) IN ('image/jpeg', 'image/png')
  AND COALESCE((metadata->>'size')::bigint, 0) <= 5242880
);

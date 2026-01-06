-- Fix 1: Update generate_affiliate_code to check if user already has affiliate
CREATE OR REPLACE FUNCTION public.generate_affiliate_code()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  new_code TEXT;
  code_exists BOOLEAN;
  affiliate_exists BOOLEAN;
BEGIN
  -- Check if the calling user already has an affiliate account
  SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE user_id = auth.uid()) INTO affiliate_exists;
  
  IF affiliate_exists THEN
    RAISE EXCEPTION 'User already has an affiliate account';
  END IF;

  LOOP
    new_code := 'CORE-' || upper(substr(md5(random()::text), 1, 6));
    SELECT EXISTS(SELECT 1 FROM public.affiliates WHERE affiliate_code = new_code) INTO code_exists;
    EXIT WHEN NOT code_exists;
  END LOOP;
  RETURN new_code;
END;
$function$;

-- Fix 2: Update chat-images storage policy to enforce user-folder structure
DROP POLICY IF EXISTS "Authenticated users can upload chat images" ON storage.objects;

CREATE POLICY "Authenticated users can upload chat images"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'chat-images' AND auth.uid()::text = (storage.foldername(name))[1]);
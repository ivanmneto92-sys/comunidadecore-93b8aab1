-- Fix RLS policies for profiles table - require authentication for viewing
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (true);

-- Fix RLS policies for account_metrics - require authentication
DROP POLICY IF EXISTS "Authenticated users can view account metrics" ON public.account_metrics;

CREATE POLICY "Authenticated users can view account metrics"
ON public.account_metrics
FOR SELECT
TO authenticated
USING (true);
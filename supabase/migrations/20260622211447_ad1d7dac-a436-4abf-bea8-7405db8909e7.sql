
CREATE POLICY "Admins view all lead profiles"
  ON public.lead_profiles FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

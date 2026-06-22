
CREATE TABLE public.lead_profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  gender TEXT NOT NULL,
  age_range TEXT NOT NULL,
  work_area TEXT NOT NULL,
  work_area_other TEXT,
  investment_experience TEXT NOT NULL,
  is_trader TEXT NOT NULL,
  prop_firm_status TEXT NOT NULL,
  investor_profile TEXT NOT NULL,
  income_range TEXT NOT NULL,
  initial_investment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.lead_profiles TO authenticated;
GRANT ALL ON public.lead_profiles TO service_role;

ALTER TABLE public.lead_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own lead profile"
  ON public.lead_profiles FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own lead profile"
  ON public.lead_profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own lead profile"
  ON public.lead_profiles FOR UPDATE TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER update_lead_profiles_updated_at
  BEFORE UPDATE ON public.lead_profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

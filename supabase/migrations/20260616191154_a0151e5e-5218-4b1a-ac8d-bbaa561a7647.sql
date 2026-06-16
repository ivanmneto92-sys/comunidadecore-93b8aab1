CREATE TABLE public.onboarding_progress (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  dismissed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE ON public.onboarding_progress TO authenticated;
GRANT ALL ON public.onboarding_progress TO service_role;

ALTER TABLE public.onboarding_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own onboarding"
ON public.onboarding_progress FOR SELECT TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users insert own onboarding"
ON public.onboarding_progress FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own onboarding"
ON public.onboarding_progress FOR UPDATE TO authenticated
USING (auth.uid() = user_id);

CREATE TRIGGER onboarding_progress_updated_at
BEFORE UPDATE ON public.onboarding_progress
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.achievements (code, name, description, icon, category, rarity, xp_reward, requirement_value, sort_order)
VALUES (
  'onboarding_complete',
  'Primeiros Passos',
  'Completou o tour inicial e está pronto para explorar o CORE HUB.',
  '🎯',
  'community',
  'common',
  50,
  1,
  0
)
ON CONFLICT (code) DO NOTHING;
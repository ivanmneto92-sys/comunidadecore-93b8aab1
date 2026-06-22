
CREATE TABLE public.robots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  tagline text,
  description text,
  category text NOT NULL DEFAULT 'outro',
  cover_url text,
  screenshots text[] NOT NULL DEFAULT '{}',
  platform text NOT NULL DEFAULT 'MT5',
  pairs text[] NOT NULL DEFAULT '{}',
  timeframe text,
  min_deposit numeric,
  risk_level text NOT NULL DEFAULT 'medio',
  external_url text,
  external_cta_label text NOT NULL DEFAULT 'Saiba mais',
  tier_required text NOT NULL DEFAULT 'free',
  is_published boolean NOT NULL DEFAULT false,
  is_featured boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.robots TO authenticated;
GRANT ALL ON public.robots TO service_role;

ALTER TABLE public.robots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone authenticated can view published robots"
  ON public.robots FOR SELECT TO authenticated
  USING (is_published = true OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert robots"
  ON public.robots FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update robots"
  ON public.robots FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete robots"
  ON public.robots FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER robots_set_updated_at
  BEFORE UPDATE ON public.robots
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX robots_published_idx ON public.robots (is_published, sort_order);
CREATE INDEX robots_category_idx ON public.robots (category);

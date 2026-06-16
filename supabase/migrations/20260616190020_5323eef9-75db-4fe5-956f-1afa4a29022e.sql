-- Cache de previews de links (OG tags)
CREATE TABLE public.link_previews (
  url TEXT PRIMARY KEY,
  title TEXT,
  description TEXT,
  image_url TEXT,
  site_name TEXT,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.link_previews TO authenticated;
GRANT ALL ON public.link_previews TO service_role;

ALTER TABLE public.link_previews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read link previews"
ON public.link_previews FOR SELECT
TO authenticated
USING (true);

CREATE INDEX idx_link_previews_fetched_at ON public.link_previews(fetched_at);

-- Coluna na mensagem para armazenar a URL extraída
ALTER TABLE public.messages
  ADD COLUMN IF NOT EXISTS link_preview_url TEXT;
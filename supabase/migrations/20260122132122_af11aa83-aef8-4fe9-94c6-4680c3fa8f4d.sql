-- Add CTA fields to tutorials table for external links
ALTER TABLE public.tutorials
ADD COLUMN cta_url TEXT,
ADD COLUMN cta_label TEXT DEFAULT 'Acessar Link';
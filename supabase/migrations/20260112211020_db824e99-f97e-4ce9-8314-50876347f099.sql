-- Create channel_categories table for dynamic sub-communities
CREATE TABLE public.channel_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  icon TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_collapsed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.channel_categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies for channel_categories
CREATE POLICY "Authenticated users can view categories"
ON public.channel_categories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage categories"
ON public.channel_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Add category_id to channels table
ALTER TABLE public.channels 
ADD COLUMN category_id UUID REFERENCES public.channel_categories(id) ON DELETE SET NULL;

-- Add presence_status to profiles table
ALTER TABLE public.profiles 
ADD COLUMN presence_status TEXT DEFAULT 'online' 
  CHECK (presence_status IN ('online', 'idle', 'dnd', 'invisible'));

-- Insert default categories
INSERT INTO public.channel_categories (name, slug, icon, sort_order) VALUES
  ('Anúncios', 'announcements', '📢', 0),
  ('Geral', 'general', '💬', 1),
  ('Trading', 'trading', '📊', 2),
  ('Suporte', 'support', '🔧', 3);

-- Update existing channels to use new category_ids based on their current category text
UPDATE public.channels c
SET category_id = cc.id
FROM public.channel_categories cc
WHERE LOWER(c.category) = LOWER(cc.slug)
   OR (c.category = 'general' AND cc.slug = 'general')
   OR (c.category = 'trading' AND cc.slug = 'trading')
   OR (c.category = 'announcements' AND cc.slug = 'announcements')
   OR (c.category = 'support' AND cc.slug = 'support');
-- Create tutorial_categories table
CREATE TABLE public.tutorial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT DEFAULT '📚',
  sort_order INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.tutorial_categories ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Admins can manage tutorial categories"
ON public.tutorial_categories
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated users can view visible categories"
ON public.tutorial_categories
FOR SELECT
USING (is_visible = true);

-- Add category_id to tutorials table
ALTER TABLE public.tutorials
ADD COLUMN category_id UUID REFERENCES public.tutorial_categories(id) ON DELETE SET NULL;

-- Create index for better performance
CREATE INDEX idx_tutorials_category_id ON public.tutorials(category_id);
CREATE INDEX idx_tutorial_categories_sort_order ON public.tutorial_categories(sort_order);

-- Create trigger for updated_at
CREATE TRIGGER update_tutorial_categories_updated_at
BEFORE UPDATE ON public.tutorial_categories
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
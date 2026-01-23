-- Drop existing incorrect policies on tutorial_categories
DROP POLICY IF EXISTS "Anyone can view visible tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Admins can view all tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Admins can insert tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Admins can update tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Admins can delete tutorial categories" ON public.tutorial_categories;
DROP POLICY IF EXISTS "Admins can manage tutorial categories" ON public.tutorial_categories;

-- Recreate policies with correct parameter order: has_role(auth.uid(), 'admin')
CREATE POLICY "Anyone can view visible tutorial categories"
ON public.tutorial_categories FOR SELECT
USING (is_visible = true);

CREATE POLICY "Admins can view all tutorial categories"
ON public.tutorial_categories FOR SELECT
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can insert tutorial categories"
ON public.tutorial_categories FOR INSERT
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update tutorial categories"
ON public.tutorial_categories FOR UPDATE
USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete tutorial categories"
ON public.tutorial_categories FOR DELETE
USING (public.has_role(auth.uid(), 'admin'::app_role));
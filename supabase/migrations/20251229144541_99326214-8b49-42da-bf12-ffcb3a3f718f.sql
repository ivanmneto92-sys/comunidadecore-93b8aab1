-- Create polls table
CREATE TABLE public.polls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID REFERENCES public.channels(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  question TEXT NOT NULL,
  is_multiple_choice BOOLEAN DEFAULT false,
  closes_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create poll_options table
CREATE TABLE public.poll_options (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_text TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0
);

-- Create poll_votes table
CREATE TABLE public.poll_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  poll_id UUID REFERENCES public.polls(id) ON DELETE CASCADE NOT NULL,
  option_id UUID REFERENCES public.poll_options(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(poll_id, user_id, option_id)
);

-- Enable RLS
ALTER TABLE public.polls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.poll_votes ENABLE ROW LEVEL SECURITY;

-- Polls policies
CREATE POLICY "Authenticated users can view polls"
ON public.polls FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can create polls"
ON public.polls FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own polls"
ON public.polls FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all polls"
ON public.polls FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Poll options policies
CREATE POLICY "Authenticated users can view poll options"
ON public.poll_options FOR SELECT
USING (true);

CREATE POLICY "Poll creators can manage options"
ON public.poll_options FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.polls
    WHERE polls.id = poll_options.poll_id
    AND polls.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can manage all poll options"
ON public.poll_options FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Poll votes policies
CREATE POLICY "Authenticated users can view votes"
ON public.poll_votes FOR SELECT
USING (true);

CREATE POLICY "Authenticated users can vote"
ON public.poll_votes FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their own votes"
ON public.poll_votes FOR DELETE
USING (auth.uid() = user_id);

-- Enable realtime for polls
ALTER PUBLICATION supabase_realtime ADD TABLE public.polls;
ALTER PUBLICATION supabase_realtime ADD TABLE public.poll_votes;
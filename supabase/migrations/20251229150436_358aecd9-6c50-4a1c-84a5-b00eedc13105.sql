-- Create community_posts table for editorial content
CREATE TABLE public.community_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_type TEXT NOT NULL CHECK (post_type IN ('announcement', 'daily_result', 'risk_reading')),
  title TEXT NOT NULL,
  content TEXT,
  metadata JSONB DEFAULT '{}',
  is_pinned BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  report_id UUID REFERENCES reports_daily(id)
);

-- Create post_discussions table for contextual discussions
CREATE TABLE public.post_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES post_discussions(id) ON DELETE CASCADE,
  is_highlighted BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create post_reactions table for discrete reactions
CREATE TABLE public.post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID REFERENCES community_posts(id) ON DELETE CASCADE,
  discussion_id UUID REFERENCES post_discussions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reaction_type TEXT NOT NULL CHECK (reaction_type IN ('like', 'useful', 'insightful')),
  created_at TIMESTAMPTZ DEFAULT now(),
  CONSTRAINT unique_post_reaction UNIQUE(post_id, user_id, reaction_type),
  CONSTRAINT unique_discussion_reaction UNIQUE(discussion_id, user_id, reaction_type),
  CONSTRAINT must_have_target CHECK (post_id IS NOT NULL OR discussion_id IS NOT NULL)
);

-- Enable RLS
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for community_posts
CREATE POLICY "Anyone can view published posts"
ON public.community_posts FOR SELECT
USING (published_at IS NOT NULL AND published_at <= now());

CREATE POLICY "Admins can manage posts"
ON public.community_posts FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- RLS Policies for post_discussions
CREATE POLICY "Anyone authenticated can view discussions"
ON public.post_discussions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Authenticated users can create discussions"
ON public.post_discussions FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own discussions"
ON public.post_discussions FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own discussions"
ON public.post_discussions FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all discussions"
ON public.post_discussions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM user_roles 
    WHERE user_id = auth.uid() 
    AND role IN ('admin', 'moderator')
  )
);

-- RLS Policies for post_reactions
CREATE POLICY "Anyone can view reactions"
ON public.post_reactions FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Users can manage own reactions"
ON public.post_reactions FOR ALL
TO authenticated
USING (auth.uid() = user_id);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.community_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_discussions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.post_reactions;

-- Create indexes for performance
CREATE INDEX idx_community_posts_type ON public.community_posts(post_type);
CREATE INDEX idx_community_posts_published ON public.community_posts(published_at DESC);
CREATE INDEX idx_community_posts_pinned ON public.community_posts(is_pinned DESC, published_at DESC);
CREATE INDEX idx_post_discussions_post ON public.post_discussions(post_id);
CREATE INDEX idx_post_discussions_parent ON public.post_discussions(parent_id);
CREATE INDEX idx_post_reactions_post ON public.post_reactions(post_id);
CREATE INDEX idx_post_reactions_discussion ON public.post_reactions(discussion_id);
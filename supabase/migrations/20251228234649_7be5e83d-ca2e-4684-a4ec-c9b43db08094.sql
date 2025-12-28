-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create membership_tier enum
CREATE TYPE public.membership_tier AS ENUM ('free', 'plus', 'elite');

-- Create report_status enum
CREATE TYPE public.report_status AS ENUM ('success', 'warning', 'danger');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table (separate for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create memberships table
CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  tier membership_tier NOT NULL DEFAULT 'free',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create health_scores table (daily copy health tracking)
CREATE TABLE public.health_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  status report_status NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports_daily table (daily trading results)
CREATE TABLE public.reports_daily (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL UNIQUE,
  trades_count INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  pnl_percent DECIMAL(8,2) NOT NULL DEFAULT 0,
  drawdown_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  profile_type TEXT CHECK (profile_type IN ('defensive', 'normal', 'aggressive')),
  status report_status NOT NULL DEFAULT 'success',
  ai_comment TEXT,
  created_by UUID REFERENCES auth.users(id),
  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create reports_weekly table
CREATE TABLE public.reports_weekly (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  week_start DATE NOT NULL UNIQUE,
  week_end DATE NOT NULL,
  trades_count INTEGER NOT NULL DEFAULT 0,
  win_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
  pnl_percent DECIMAL(8,2) NOT NULL DEFAULT 0,
  drawdown_percent DECIMAL(5,2) NOT NULL DEFAULT 0,
  ai_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create channels table (community channels)
CREATE TABLE public.channels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  is_admin_only BOOLEAN NOT NULL DEFAULT false,
  is_bot_only BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create messages table (community messages)
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  is_bot_message BOOLEAN NOT NULL DEFAULT false,
  parent_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create message_reactions table
CREATE TABLE public.message_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  emoji TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (message_id, user_id, emoji)
);

-- Create tutorials table
CREATE TABLE public.tutorials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  content TEXT,
  video_url TEXT,
  category TEXT NOT NULL DEFAULT 'beginner',
  tier_required membership_tier NOT NULL DEFAULT 'free',
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_published BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create tutorial_progress table
CREATE TABLE public.tutorial_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tutorial_id UUID NOT NULL REFERENCES public.tutorials(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tutorial_id)
);

-- Create moderation_reports table
CREATE TABLE public.moderation_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
  reporter_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'dismissed')),
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports_weekly ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.channels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tutorial_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.moderation_reports ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to check if user is admin or moderator
CREATE OR REPLACE FUNCTION public.is_admin_or_mod(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('admin', 'moderator')
  )
$$;

-- Update timestamp function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_memberships_updated_at BEFORE UPDATE ON public.memberships FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_reports_daily_updated_at BEFORE UPDATE ON public.reports_daily FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON public.messages FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tutorials_updated_at BEFORE UPDATE ON public.tutorials FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', NEW.raw_user_meta_data ->> 'avatar_url');
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  INSERT INTO public.memberships (user_id, tier)
  VALUES (NEW.id, 'free');
  
  RETURN NEW;
END;
$$;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS Policies

-- Profiles: viewable by everyone, editable by owner
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- User roles: viewable by user themselves and admins
CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage roles" ON public.user_roles FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Memberships: viewable by user themselves, manageable by admins
CREATE POLICY "Users can view their own membership" ON public.memberships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all memberships" ON public.memberships FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage memberships" ON public.memberships FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Health scores: viewable by all authenticated users
CREATE POLICY "Authenticated users can view health scores" ON public.health_scores FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage health scores" ON public.health_scores FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reports daily: viewable by all authenticated, manageable by admins
CREATE POLICY "Authenticated users can view published reports" ON public.reports_daily FOR SELECT TO authenticated USING (published_at IS NOT NULL);
CREATE POLICY "Admins can view all reports" ON public.reports_daily FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can manage reports" ON public.reports_daily FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Reports weekly: viewable by all authenticated
CREATE POLICY "Authenticated users can view weekly reports" ON public.reports_weekly FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage weekly reports" ON public.reports_weekly FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Channels: viewable by all authenticated
CREATE POLICY "Authenticated users can view channels" ON public.channels FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage channels" ON public.channels FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Messages: viewable by all authenticated, insertable by authenticated in non-admin channels
CREATE POLICY "Authenticated users can view messages" ON public.messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can insert messages" ON public.messages FOR INSERT TO authenticated 
  WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM public.channels WHERE id = channel_id AND (is_admin_only = true OR is_bot_only = true)
    )
  );
CREATE POLICY "Users can update their own messages" ON public.messages FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own messages" ON public.messages FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Admins and mods can manage all messages" ON public.messages FOR ALL USING (public.is_admin_or_mod(auth.uid()));

-- Message reactions
CREATE POLICY "Authenticated users can view reactions" ON public.message_reactions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated users can add reactions" ON public.message_reactions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can remove their own reactions" ON public.message_reactions FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Tutorials: viewable by tier, manageable by admins
CREATE POLICY "Users can view published tutorials matching their tier" ON public.tutorials FOR SELECT TO authenticated USING (
  is_published = true AND (
    tier_required = 'free' OR
    EXISTS (
      SELECT 1 FROM public.memberships 
      WHERE user_id = auth.uid() AND (
        tier = 'elite' OR
        (tier = 'plus' AND tier_required IN ('free', 'plus'))
      )
    )
  )
);
CREATE POLICY "Admins can manage tutorials" ON public.tutorials FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Tutorial progress
CREATE POLICY "Users can view their own progress" ON public.tutorial_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own progress" ON public.tutorial_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Moderation reports
CREATE POLICY "Users can create reports" ON public.moderation_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = reporter_id);
CREATE POLICY "Admins and mods can view reports" ON public.moderation_reports FOR SELECT USING (public.is_admin_or_mod(auth.uid()));
CREATE POLICY "Admins and mods can manage reports" ON public.moderation_reports FOR ALL USING (public.is_admin_or_mod(auth.uid()));

-- Enable realtime for messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.message_reactions;

-- Create indexes for performance
CREATE INDEX idx_messages_channel_id ON public.messages(channel_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX idx_reports_daily_date ON public.reports_daily(date DESC);
CREATE INDEX idx_health_scores_date ON public.health_scores(date DESC);
CREATE INDEX idx_tutorials_category ON public.tutorials(category);
CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
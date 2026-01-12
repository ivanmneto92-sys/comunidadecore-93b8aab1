-- Create bot_templates table for message templates
CREATE TABLE public.bot_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'geral',
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create scheduled_posts table for scheduled bot messages
CREATE TABLE public.scheduled_posts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  template_id UUID REFERENCES public.bot_templates(id) ON DELETE SET NULL,
  channel_id UUID NOT NULL REFERENCES public.channels(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  repeat_type TEXT DEFAULT NULL,
  is_pinned BOOLEAN NOT NULL DEFAULT false,
  created_by UUID REFERENCES auth.users(id),
  executed_at TIMESTAMP WITH TIME ZONE,
  message_id UUID REFERENCES public.messages(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bot_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scheduled_posts ENABLE ROW LEVEL SECURITY;

-- RLS for bot_templates
CREATE POLICY "Admins can manage templates" ON public.bot_templates
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Authenticated can view active templates" ON public.bot_templates
  FOR SELECT USING (is_active = true);

-- RLS for scheduled_posts
CREATE POLICY "Admins can manage scheduled posts" ON public.scheduled_posts
  FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Add indexes
CREATE INDEX idx_scheduled_posts_status ON public.scheduled_posts(status);
CREATE INDEX idx_scheduled_posts_scheduled_for ON public.scheduled_posts(scheduled_for);
CREATE INDEX idx_bot_templates_category ON public.bot_templates(category);

-- Trigger for updated_at
CREATE TRIGGER update_bot_templates_updated_at
  BEFORE UPDATE ON public.bot_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_scheduled_posts_updated_at
  BEFORE UPDATE ON public.scheduled_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
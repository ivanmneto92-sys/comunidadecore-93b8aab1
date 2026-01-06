-- Create admin_activity_logs table for tracking admin actions
CREATE TABLE public.admin_activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  target_user_id UUID,
  target_resource_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view and manage activity logs
CREATE POLICY "Admins can manage activity logs"
ON public.admin_activity_logs
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Create broadcasts table for mass announcements
CREATE TABLE public.broadcasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  channel_id UUID REFERENCES public.channels(id) ON DELETE SET NULL,
  is_pinned BOOLEAN DEFAULT false,
  sent_by UUID NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  message_id UUID REFERENCES public.messages(id) ON DELETE SET NULL
);

-- Enable RLS
ALTER TABLE public.broadcasts ENABLE ROW LEVEL SECURITY;

-- Only admins can manage broadcasts
CREATE POLICY "Admins can manage broadcasts"
ON public.broadcasts
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- Add new columns to moderation_reports for tracking actions
ALTER TABLE public.moderation_reports 
ADD COLUMN IF NOT EXISTS action_taken TEXT,
ADD COLUMN IF NOT EXISTS action_note TEXT,
ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;
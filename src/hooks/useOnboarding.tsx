import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface OnboardingStep {
  key: 'avatar' | 'nickname' | 'channel' | 'message' | 'tutorial';
  label: string;
  description: string;
  done: boolean;
  href: string;
}

export function useOnboarding() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [steps, setSteps] = useState<OnboardingStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [completedAt, setCompletedAt] = useState<string | null>(null);
  const [dismissedAt, setDismissedAt] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);

    const [profileRes, channelRes, msgRes, tutRes, progressRes] = await Promise.all([
      supabase.from('profiles').select('display_name, avatar_id, avatar_url').eq('id', user.id).maybeSingle(),
      supabase.from('user_channel_read_status').select('user_id').eq('user_id', user.id).limit(1),
      supabase.from('messages').select('id').eq('user_id', user.id).limit(1),
      supabase.from('tutorial_progress').select('id').eq('user_id', user.id).limit(1),
      supabase.from('onboarding_progress').select('completed_at, dismissed_at').eq('user_id', user.id).maybeSingle(),
    ]);

    const profile = profileRes.data;
    const defaultName = user.email?.split('@')[0] ?? '';

    const next: OnboardingStep[] = [
      {
        key: 'avatar',
        label: 'Escolha seu avatar',
        description: 'Personalize sua presença na comunidade.',
        done: !!profile?.avatar_id,
        href: '/profile',
      },
      {
        key: 'nickname',
        label: 'Defina seu nickname',
        description: 'Como você quer ser chamado no chat.',
        done: !!profile?.display_name && profile.display_name.trim() !== defaultName,
        href: '/profile',
      },
      {
        key: 'channel',
        label: 'Entre em um canal',
        description: 'Abra um canal da comunidade.',
        done: (channelRes.data?.length ?? 0) > 0,
        href: '/community',
      },
      {
        key: 'message',
        label: 'Envie sua primeira mensagem',
        description: 'Apresente-se no chat.',
        done: (msgRes.data?.length ?? 0) > 0,
        href: '/community',
      },
      {
        key: 'tutorial',
        label: 'Abra um tutorial da Academy',
        description: 'Comece sua jornada de aprendizado.',
        done: (tutRes.data?.length ?? 0) > 0,
        href: '/academy',
      },
    ];

    setSteps(next);
    setCompletedAt(progressRes.data?.completed_at ?? null);
    setDismissedAt(progressRes.data?.dismissed_at ?? null);
    setLoading(false);
  }, [user]);

  useEffect(() => { void refresh(); }, [refresh]);

  const completedCount = useMemo(() => steps.filter(s => s.done).length, [steps]);
  const allDone = steps.length > 0 && completedCount === steps.length;
  const visible = !!user && !loading && !dismissedAt && !completedAt && steps.length > 0;

  const markComplete = useCallback(async () => {
    if (!user || completedAt) return;
    const nowIso = new Date().toISOString();
    await supabase.from('onboarding_progress').upsert(
      { user_id: user.id, completed_at: nowIso },
      { onConflict: 'user_id' },
    );

    // Award badge via SECURITY DEFINER RPC (idempotent, server-validated)
    await supabase.rpc('claim_achievement_by_code', { _code: 'onboarding_complete' });


    toast({ title: '🎯 Primeiros Passos desbloqueado!', description: '+50 XP — bem-vindo ao Instituto Trader.' });
    setCompletedAt(nowIso);
  }, [user, completedAt, toast]);

  const dismiss = useCallback(async () => {
    if (!user) return;
    const nowIso = new Date().toISOString();
    await supabase.from('onboarding_progress').upsert(
      { user_id: user.id, dismissed_at: nowIso },
      { onConflict: 'user_id' },
    );
    setDismissedAt(nowIso);
  }, [user]);

  // Auto-complete when all 5 are done
  useEffect(() => {
    if (allDone && !completedAt && !loading) {
      void markComplete();
    }
  }, [allDone, completedAt, loading, markComplete]);

  return { steps, completedCount, total: steps.length, visible, loading, refresh, dismiss };
}

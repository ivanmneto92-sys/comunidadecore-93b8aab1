import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { buildErrorToast } from '@/lib/toastError';
import { achievementDefinitions, AchievementCheckData } from '@/lib/achievementDefinitions';

interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  xp_reward: number;
  rarity: string;
  requirement_value: number;
  sort_order: number;
}

interface UserAchievement {
  id: string;
  achievement_id: string;
  unlocked_at: string;
}

interface AchievementWithProgress extends Achievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: { current: number; target: number };
}

export function useAchievements() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Fetch all achievements
  // Achievement definitions are static - cache aggressively
  const { data: achievements = [], isLoading: achievementsLoading } = useQuery({
    queryKey: ['achievements'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('achievements')
        .select('id, code, name, description, icon, category, xp_reward, rarity, requirement_value, sort_order')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return data as Achievement[];
    },
    staleTime: 30 * 60 * 1000, // 30 minutes - static data
    gcTime: 60 * 60 * 1000, // 1 hour
  });

  // Fetch user's unlocked achievements
  const { data: userAchievements = [], isLoading: userAchievementsLoading } = useQuery({
    queryKey: ['user-achievements', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('user_achievements')
        .select('id, achievement_id, unlocked_at')
        .eq('user_id', user.id);

      if (error) throw error;
      return data as UserAchievement[];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  // Fetch user progress data for calculations
  const { data: progressData, isLoading: progressLoading } = useQuery({
    queryKey: ['achievement-progress-data', user?.id],
    queryFn: async (): Promise<AchievementCheckData> => {
      if (!user) {
        return {
          checkinStreak: 0,
          tutorialsCompleted: 0,
          totalTutorials: 0,
          messagesCount: 0,
          performanceStreak: 0,
          affiliateEarnings: 0,
          memberSince: null,
          totalXp: 0,
        };
      }

      // Fetch all progress data in parallel
      const [
        checkinResult,
        tutorialProgressResult,
        totalTutorialsResult,
        messagesResult,
        streakResult,
        affiliateResult,
        profileResult,
        xpResult,
      ] = await Promise.all([
        // Check-in streak
        supabase
          .from('daily_checkins')
          .select('streak_count')
          .eq('user_id', user.id)
          .order('checkin_date', { ascending: false })
          .limit(1),
        // Tutorials completed
        supabase
          .from('tutorial_progress')
          .select('id')
          .eq('user_id', user.id)
          .not('completed_at', 'is', null),
        // Total tutorials
        supabase
          .from('tutorials')
          .select('id')
          .eq('is_published', true),
        // Messages count
        supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('user_id', user.id),
        // Performance streak: dias consecutivos com retorno positivo no MT5 pessoal
        supabase
          .from('mt5_accounts')
          .select('id, mt5_daily_metrics(date, operational_return)')
          .eq('user_id', user.id),
        // Affiliate earnings
        supabase
          .from('affiliates')
          .select('total_earnings')
          .eq('user_id', user.id)
          .maybeSingle(),
        // Profile for member since
        supabase
          .from('profiles')
          .select('created_at')
          .eq('id', user.id)
          .single(),
        // Total XP
        supabase
          .from('user_xp')
          .select('total_xp')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      // Performance streak — agrega dias de TODAS as contas MT5 do usuário,
      // ordenados desc, conta os primeiros dias com operational_return > 0
      let performanceStreak = 0;
      const accountsAny = (streakResult.data ?? []) as Array<{ mt5_daily_metrics?: Array<{ date: string; operational_return: number | null }> }>;
      const allDays: Array<{ date: string; ret: number }> = [];
      accountsAny.forEach(acc => (acc.mt5_daily_metrics ?? []).forEach(d => allDays.push({ date: d.date, ret: Number(d.operational_return ?? 0) })));
      allDays.sort((a, b) => b.date.localeCompare(a.date));
      for (const d of allDays) {
        if (d.ret > 0) performanceStreak++;
        else break;
      }

      const affiliateEarnings = Number(affiliateResult.data?.total_earnings ?? 0);

      return {
        checkinStreak: checkinResult.data?.[0]?.streak_count || 0,
        tutorialsCompleted: tutorialProgressResult.data?.length || 0,
        totalTutorials: totalTutorialsResult.data?.length || 10,
        messagesCount: messagesResult.count || 0,
        performanceStreak,
        affiliateEarnings,
        memberSince: profileResult.data?.created_at ? new Date(profileResult.data.created_at) : null,
        totalXp: xpResult.data?.total_xp || 0,
      };
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  // Calculate achievements with progress
  const achievementsWithProgress: AchievementWithProgress[] = achievements.map((achievement) => {
    const userAchievement = userAchievements.find((ua) => ua.achievement_id === achievement.id);
    const definition = achievementDefinitions.find((d) => d.code === achievement.code);

    const defaultProgress = { current: 0, target: achievement.requirement_value };
    const progress = definition && progressData
      ? definition.checkProgress(progressData)
      : defaultProgress;

    return {
      ...achievement,
      isUnlocked: !!userAchievement,
      unlockedAt: userAchievement?.unlocked_at || null,
      progress,
    };
  });

  // Stats
  const unlockedCount = achievementsWithProgress.filter((a) => a.isUnlocked).length;
  const totalCount = achievements.length;
  const percentage = totalCount > 0 ? Math.round((unlockedCount / totalCount) * 100) : 0;
  const totalXpEarned = achievementsWithProgress
    .filter((a) => a.isUnlocked)
    .reduce((sum, a) => sum + a.xp_reward, 0);

  // Unlock achievement via SECURITY DEFINER RPC (server-side validation + XP)
  const unlockAchievement = async (achievementId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data, error } = await supabase.rpc('claim_achievement', {
        _achievement_id: achievementId,
      });
      if (error) throw error;
      const result = (data ?? {}) as { claimed?: boolean; already?: boolean };
      return result.claimed === true && !result.already;
    } catch (error) {
      toast(buildErrorToast(error, { action: 'desbloquear a conquista', resource: 'conquista' }));
      return false;
    }
  };


  return {
    achievements: achievementsWithProgress,
    isLoading: achievementsLoading || userAchievementsLoading || progressLoading,
    stats: {
      unlockedCount,
      totalCount,
      percentage,
      totalXpEarned,
    },
    unlockAchievement,
    progressData,
  };
}

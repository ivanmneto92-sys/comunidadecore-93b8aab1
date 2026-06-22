import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  calculateCheckinXp, 
  getStreakMultiplier,
  XP_CAPS,
} from '@/lib/seasonXpCalculator';
import { useSeason } from './useSeason';

// Get local date string in YYYY-MM-DD format (user's timezone)
const getLocalDateString = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Get yesterday's date string in local timezone
const getYesterdayDateString = (): string => {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return getLocalDateString(yesterday);
};

// Get next milestone based on current streak
const getNextMilestone = (streak: number): number => {
  if (streak < 7) return 7;
  if (streak < 14) return 14;
  if (streak < 30) return 30;
  if (streak < 60) return 60;
  if (streak < 100) return 100;
  return streak + 30; // Every 30 days after 100
};

interface CheckinData {
  hasCheckedInToday: boolean;
  currentStreak: number;
  totalXp: number;
  todayXpReward: number;
  nextMilestone: number;
  streakMultiplier: number;
}

const fetchCheckinData = async (userId: string): Promise<CheckinData> => {
  const today = getLocalDateString();
  const yesterday = getYesterdayDateString();

  // Fetch all data in parallel (optimized)
  const [todayResult, yesterdayResult, xpResult] = await Promise.all([
    supabase
      .from('daily_checkins')
      .select('streak_count, xp_earned')
      .eq('user_id', userId)
      .eq('checkin_date', today)
      .maybeSingle(),
    supabase
      .from('daily_checkins')
      .select('streak_count')
      .eq('user_id', userId)
      .eq('checkin_date', yesterday)
      .maybeSingle(),
    supabase
      .from('user_xp')
      .select('total_xp')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  const todayCheckin = todayResult.data;
  const yesterdayCheckin = yesterdayResult.data;
  const userXp = xpResult.data;

  const currentStreak = todayCheckin?.streak_count || yesterdayCheckin?.streak_count || 0;
  const potentialStreak = todayCheckin ? currentStreak : (yesterdayCheckin?.streak_count || 0) + 1;
  const streakMultiplier = getStreakMultiplier(potentialStreak);
  
  // Use season XP calculator for accurate reward preview
  const todayXpReward = calculateCheckinXp(potentialStreak, false);

  return {
    hasCheckedInToday: !!todayCheckin,
    currentStreak: todayCheckin ? currentStreak : (yesterdayCheckin?.streak_count || 0),
    totalXp: userXp?.total_xp || 0,
    todayXpReward,
    nextMilestone: getNextMilestone(currentStreak),
    streakMultiplier,
  };
};

export function useCheckin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { currentSeason, userProgress, refetchProgress } = useSeason();

  const { data, isLoading } = useQuery({
    queryKey: ['checkin-data', user?.id],
    queryFn: () => fetchCheckinData(user!.id),
    enabled: !!user?.id,
    staleTime: 60 * 1000, // 1 minute
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  const checkinMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error('User not authenticated');

      const today = getLocalDateString();
      const yesterday = getYesterdayDateString();

      // Check yesterday's streak
      const { data: yesterdayCheckin } = await supabase
        .from('daily_checkins')
        .select('streak_count')
        .eq('user_id', user.id)
        .eq('checkin_date', yesterday)
        .maybeSingle();

      const newStreak = (yesterdayCheckin?.streak_count || 0) + 1;
      
      // Calculate XP using season calculator with streak multiplier
      const streakMultiplier = getStreakMultiplier(newStreak);
      const xpEarned = calculateCheckinXp(newStreak, false);

      // Upsert today's checkin (prevents duplicates)
      const { error: checkinError } = await supabase
        .from('daily_checkins')
        .upsert({
          user_id: user.id,
          checkin_date: today,
          streak_count: newStreak,
          xp_earned: xpEarned,
        }, { 
          onConflict: 'user_id,checkin_date',
          ignoreDuplicates: true 
        });

      if (checkinError) throw checkinError;

      // === SEASON XP INTEGRATION (via SECURITY DEFINER RPC) ===
      let seasonXpAdded = 0;

      const { data: xpResult, error: xpError } = await supabase.rpc('add_xp', {
        _source: 'checkin',
        _amount: xpEarned,
        _multiplier: streakMultiplier,
        _details: { streak: newStreak, base_xp: 10 } as never,
      });

      if (xpError) throw xpError;
      const r = (xpResult ?? {}) as { xp_added?: number };
      seasonXpAdded = r.xp_added ?? 0;


      return { 
        xpEarned: seasonXpAdded > 0 ? seasonXpAdded : xpEarned, 
        newStreak,
        streakMultiplier,
        seasonXpAdded,
      };
    },
    onSuccess: () => {
      // Invalidate and refetch checkin data
      queryClient.invalidateQueries({ queryKey: ['checkin-data', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['daily-xp-caps', user?.id] });
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
      refetchProgress();
    },
    onError: (error) => {
      console.error('Error performing checkin:', error);
      toast({
        title: 'Erro ao fazer check-in',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    },
  });

  const performCheckin = useCallback(async (): Promise<{ 
    success: boolean; 
    xpEarned: number; 
    newStreak: number;
    streakMultiplier?: number;
  }> => {
    if (!user?.id || data?.hasCheckedInToday) {
      return { success: false, xpEarned: 0, newStreak: 0 };
    }

    try {
      const result = await checkinMutation.mutateAsync();
      return { 
        success: true, 
        xpEarned: result.xpEarned, 
        newStreak: result.newStreak,
        streakMultiplier: result.streakMultiplier,
      };
    } catch {
      return { success: false, xpEarned: 0, newStreak: 0 };
    }
  }, [user?.id, data?.hasCheckedInToday, checkinMutation]);

  return {
    hasCheckedInToday: data?.hasCheckedInToday ?? false,
    currentStreak: data?.currentStreak ?? 0,
    totalXp: data?.totalXp ?? 0,
    todayXpReward: data?.todayXpReward ?? 10,
    nextMilestone: data?.nextMilestone ?? 7,
    streakMultiplier: data?.streakMultiplier ?? 1.0,
    isLoading,
    performCheckin,
    refetch: () => queryClient.invalidateQueries({ queryKey: ['checkin-data', user?.id] }),
  };
}

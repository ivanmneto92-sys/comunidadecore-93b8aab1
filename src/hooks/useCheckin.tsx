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

      // === SEASON XP INTEGRATION ===
      // Add season XP if there's an active season and user progress
      let seasonXpAdded = 0;
      let seasonXpTotal = 0;

      if (currentSeason?.id && userProgress) {
        // Check daily cap for checkin source
        const { data: capsData } = await supabase
          .rpc('get_daily_xp_caps', { p_user_id: user.id });
        
        const checkinCap = capsData?.find((c: { source: string }) => c.source === 'checkin');
        const remaining = checkinCap?.remaining ?? XP_CAPS.daily.checkin;
        
        // Apply cap
        const cappedXp = Math.min(xpEarned, remaining);
        
        if (cappedXp > 0) {
          // Calculate total XP (20% of season XP goes to permanent)
          seasonXpTotal = Math.round(cappedXp * 0.2);

          // Register XP transaction
          await supabase
            .from('xp_transactions')
            .insert([{
              user_id: user.id,
              season_id: currentSeason.id,
              source: 'checkin',
              xp_season: cappedXp,
              xp_total: seasonXpTotal,
              multiplier: streakMultiplier,
              details: { streak: newStreak, base_xp: 10 },
            }]);

          // Update season progress
          const newSeasonXp = (userProgress.season_xp || 0) + cappedXp;
          
          // Calculate new level using the same formula as the DB function
          let level = 1;
          let remainingXp = newSeasonXp;
          while (level < 50) {
            let xpNeeded: number;
            if (level <= 10) xpNeeded = level * 50;
            else if (level <= 25) xpNeeded = 500 + (level - 10) * 100;
            else if (level <= 40) xpNeeded = 2000 + (level - 25) * 200;
            else xpNeeded = 5000 + (level - 40) * 400;
            
            if (remainingXp >= xpNeeded) {
              remainingXp -= xpNeeded;
              level++;
            } else break;
          }
          level = Math.min(level, 50);

          await supabase
            .from('user_season_progress')
            .update({
              season_xp: newSeasonXp,
              season_level: level,
              updated_at: new Date().toISOString(),
            })
            .eq('id', userProgress.id);

          seasonXpAdded = cappedXp;
        }
      }

      // Update or insert user XP (permanent) with error handling
      const { data: existingXp } = await supabase
        .from('user_xp')
        .select('total_xp')
        .eq('user_id', user.id)
        .maybeSingle();

      // Total XP is the season contribution (20% of season XP)
      const permanentXpGain = seasonXpTotal > 0 ? seasonXpTotal : xpEarned;

      if (existingXp) {
        const { error: updateError } = await supabase
          .from('user_xp')
          .update({ total_xp: existingXp.total_xp + permanentXpGain })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_xp')
          .insert({ user_id: user.id, total_xp: permanentXpGain });
        
        if (insertError) throw insertError;
      }

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

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface CheckinData {
  hasCheckedInToday: boolean;
  currentStreak: number;
  totalXp: number;
  todayXpReward: number;
  nextMilestone: number;
  isLoading: boolean;
}

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

// Calculate XP reward based on streak
const calculateXpReward = (streak: number): number => {
  if (streak >= 30) return 100; // 30-day bonus
  if (streak >= 14) return 50;  // 2 weeks+ bonus
  if (streak >= 7) return 30;   // Week+ bonus
  if (streak >= 4) return 20;   // 4-6 days
  if (streak >= 2) return 15;   // 2-3 days
  return 10;                     // Day 1
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

export function useCheckin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<CheckinData>({
    hasCheckedInToday: false,
    currentStreak: 0,
    totalXp: 0,
    todayXpReward: 10,
    nextMilestone: 7,
    isLoading: true,
  });

  const fetchCheckinData = useCallback(async () => {
    if (!user?.id) {
      setData(prev => ({ ...prev, isLoading: false }));
      return;
    }

    try {
      const today = getLocalDateString();
      const yesterday = getYesterdayDateString();

      // Fetch all data in parallel (optimized)
      const [todayResult, yesterdayResult, xpResult] = await Promise.all([
        supabase
          .from('daily_checkins')
          .select('streak_count, xp_earned')
          .eq('user_id', user.id)
          .eq('checkin_date', today)
          .maybeSingle(),
        supabase
          .from('daily_checkins')
          .select('streak_count')
          .eq('user_id', user.id)
          .eq('checkin_date', yesterday)
          .maybeSingle(),
        supabase
          .from('user_xp')
          .select('total_xp')
          .eq('user_id', user.id)
          .maybeSingle(),
      ]);

      const todayCheckin = todayResult.data;
      const yesterdayCheckin = yesterdayResult.data;
      const userXp = xpResult.data;

      const currentStreak = todayCheckin?.streak_count || yesterdayCheckin?.streak_count || 0;
      const potentialStreak = todayCheckin ? currentStreak : (yesterdayCheckin?.streak_count || 0) + 1;

      setData({
        hasCheckedInToday: !!todayCheckin,
        currentStreak: todayCheckin ? currentStreak : (yesterdayCheckin?.streak_count || 0),
        totalXp: userXp?.total_xp || 0,
        todayXpReward: calculateXpReward(potentialStreak),
        nextMilestone: getNextMilestone(currentStreak),
        isLoading: false,
      });
    } catch (error) {
      console.error('Error fetching checkin data:', error);
      setData(prev => ({ ...prev, isLoading: false }));
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCheckinData();
  }, [fetchCheckinData]);

  const performCheckin = useCallback(async (): Promise<{ success: boolean; xpEarned: number; newStreak: number }> => {
    if (!user?.id || data.hasCheckedInToday) {
      return { success: false, xpEarned: 0, newStreak: 0 };
    }

    try {
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
      const xpEarned = calculateXpReward(newStreak);

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

      // Update or insert user XP with error handling
      const { data: existingXp } = await supabase
        .from('user_xp')
        .select('total_xp')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingXp) {
        const { error: updateError } = await supabase
          .from('user_xp')
          .update({ total_xp: existingXp.total_xp + xpEarned })
          .eq('user_id', user.id);
        
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_xp')
          .insert({ user_id: user.id, total_xp: xpEarned });
        
        if (insertError) throw insertError;
      }

      // Update local state
      setData(prev => ({
        ...prev,
        hasCheckedInToday: true,
        currentStreak: newStreak,
        totalXp: (existingXp?.total_xp || 0) + xpEarned,
        nextMilestone: getNextMilestone(newStreak),
      }));

      return { success: true, xpEarned, newStreak };
    } catch (error) {
      console.error('Error performing checkin:', error);
      toast({
        title: 'Erro ao fazer check-in',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
      return { success: false, xpEarned: 0, newStreak: 0 };
    }
  }, [user?.id, data.hasCheckedInToday, toast]);

  return {
    ...data,
    performCheckin,
    refetch: fetchCheckinData,
  };
}

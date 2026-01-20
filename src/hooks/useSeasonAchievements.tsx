import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSeason } from '@/hooks/useSeason';
import { useSeasonXp } from '@/hooks/useSeasonXp';

export interface SeasonAchievement {
  id: string;
  season_id: string | null;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  sort_order: number;
}

export interface UserSeasonAchievement {
  id: string;
  user_id: string;
  achievement_id: string;
  season_id: string;
  unlocked_at: string;
}

export interface SeasonAchievementWithProgress extends SeasonAchievement {
  isUnlocked: boolean;
  unlockedAt: string | null;
  progress: number;
}

export function useSeasonAchievements() {
  const { user } = useAuth();
  const { currentSeason } = useSeason();
  const { addXp } = useSeasonXp();
  const queryClient = useQueryClient();

  // Buscar conquistas da temporada
  const { data: achievements, isLoading: isLoadingAchievements } = useQuery({
    queryKey: ['season-achievements', currentSeason?.id],
    queryFn: async () => {
      if (!currentSeason?.id) return [];
      
      const { data, error } = await supabase
        .from('season_achievements')
        .select('*')
        .eq('season_id', currentSeason.id)
        .order('sort_order', { ascending: true });
      
      if (error) throw error;
      return data as SeasonAchievement[];
    },
    enabled: !!currentSeason?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Buscar conquistas desbloqueadas pelo usuário
  const { data: userAchievements, isLoading: isLoadingUserAchievements } = useQuery({
    queryKey: ['user-season-achievements', user?.id, currentSeason?.id],
    queryFn: async () => {
      if (!user?.id || !currentSeason?.id) return [];
      
      const { data, error } = await supabase
        .from('user_season_achievements')
        .select('*')
        .eq('user_id', user.id)
        .eq('season_id', currentSeason.id);
      
      if (error) throw error;
      return data as UserSeasonAchievement[];
    },
    enabled: !!user?.id && !!currentSeason?.id,
    staleTime: 60 * 1000,
  });

  // Buscar dados de progresso do usuário
  const { data: progressData } = useQuery({
    queryKey: ['season-achievement-progress', user?.id, currentSeason?.id],
    queryFn: async () => {
      if (!user?.id || !currentSeason?.id) return null;
      
      // Buscar dados necessários para calcular progresso
      const [checkinsResult, journalResult, messagesResult] = await Promise.all([
        // Dias ativos (check-ins) na temporada
        supabase
          .from('daily_checkins')
          .select('checkin_date, streak_count')
          .eq('user_id', user.id)
          .gte('checkin_date', currentSeason.start_date)
          .lte('checkin_date', currentSeason.end_date),
        
        // Entradas do journal
        supabase
          .from('user_trading_journal')
          .select('date, pnl_percent')
          .eq('user_id', user.id)
          .gte('date', currentSeason.start_date)
          .lte('date', currentSeason.end_date),
        
        // Mensagens na comunidade
        supabase
          .from('messages')
          .select('id')
          .eq('user_id', user.id)
          .gte('created_at', currentSeason.start_date),
      ]);

      const checkins = checkinsResult.data || [];
      const journal = journalResult.data || [];
      const messages = messagesResult.data || [];

      // Calcular streak máximo
      let maxStreak = 0;
      let currentStreak = 0;
      checkins.forEach(c => {
        if (c.streak_count > maxStreak) maxStreak = c.streak_count;
        currentStreak = c.streak_count;
      });

      // Dias positivos
      const positiveDays = journal.filter(j => j.pnl_percent > 0).length;

      return {
        activeDays: checkins.length,
        maxStreak,
        currentStreak,
        positiveDays,
        journalEntries: journal.length,
        messageCount: messages.length,
      };
    },
    enabled: !!user?.id && !!currentSeason?.id,
    staleTime: 60 * 1000,
  });

  // Combinar conquistas com progresso
  const achievementsWithProgress: SeasonAchievementWithProgress[] = (achievements || []).map(achievement => {
    const userAch = userAchievements?.find(ua => ua.achievement_id === achievement.id);
    const isUnlocked = !!userAch;
    
    // Calcular progresso baseado no tipo de requisito
    let progress = 0;
    if (progressData && !isUnlocked) {
      switch (achievement.requirement_type) {
        case 'active_days':
          progress = Math.min(100, (progressData.activeDays / achievement.requirement_value) * 100);
          break;
        case 'streak':
          progress = Math.min(100, (progressData.maxStreak / achievement.requirement_value) * 100);
          break;
        case 'streak_unbroken':
          progress = Math.min(100, (progressData.currentStreak / achievement.requirement_value) * 100);
          break;
        case 'positive_days':
          progress = Math.min(100, (progressData.positiveDays / achievement.requirement_value) * 100);
          break;
        case 'journal_entries':
          progress = Math.min(100, (progressData.journalEntries / achievement.requirement_value) * 100);
          break;
        default:
          progress = 0;
      }
    }
    
    return {
      ...achievement,
      isUnlocked,
      unlockedAt: userAch?.unlocked_at ?? null,
      progress: isUnlocked ? 100 : Math.round(progress),
    };
  });

  // Mutation para desbloquear conquista
  const unlockMutation = useMutation({
    mutationFn: async (achievementId: string) => {
      if (!user?.id || !currentSeason?.id) throw new Error('Missing data');
      
      const achievement = achievements?.find(a => a.id === achievementId);
      if (!achievement) throw new Error('Achievement not found');

      // Inserir conquista desbloqueada
      const { error } = await supabase
        .from('user_season_achievements')
        .insert({
          user_id: user.id,
          achievement_id: achievementId,
          season_id: currentSeason.id,
        });

      if (error) throw error;

      // Adicionar XP da conquista
      await addXp('achievement', achievement.xp_reward, {
        details: { achievement_id: achievementId, achievement_name: achievement.name },
      });

      return achievement;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-season-achievements'] });
      queryClient.invalidateQueries({ queryKey: ['user-season-progress'] });
    },
  });

  // Estatísticas
  const stats = {
    total: achievements?.length ?? 0,
    unlocked: userAchievements?.length ?? 0,
    percentage: achievements?.length 
      ? Math.round(((userAchievements?.length ?? 0) / achievements.length) * 100)
      : 0,
    totalXpAvailable: achievements?.reduce((sum, a) => sum + a.xp_reward, 0) ?? 0,
    xpEarned: achievementsWithProgress
      .filter(a => a.isUnlocked)
      .reduce((sum, a) => sum + a.xp_reward, 0),
  };

  return {
    achievements: achievementsWithProgress,
    isLoading: isLoadingAchievements || isLoadingUserAchievements,
    stats,
    progressData,
    unlockAchievement: unlockMutation.mutateAsync,
    isUnlocking: unlockMutation.isPending,
  };
}

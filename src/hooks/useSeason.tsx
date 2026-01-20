import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { getSeasonDefinition } from '@/lib/seasonDefinitions';
import { getLevelProgress, TOTAL_SEASON_XP } from '@/lib/seasonXpCalculator';

export interface Season {
  id: string;
  number: number;
  year: number;
  quarter: number;
  name: string;
  theme: string;
  theme_emoji: string;
  description: string | null;
  start_date: string;
  end_date: string;
  is_active: boolean;
  days_remaining?: number;
}

export interface UserSeasonProgress {
  id: string;
  user_id: string;
  season_id: string;
  season_xp: number;
  season_level: number;
  prestige_level: number;
  streak_penalty_until: string | null;
  created_at: string;
  updated_at: string;
}

export function useSeason() {
  const { user } = useAuth();

  // Buscar temporada ativa
  const { data: currentSeason, isLoading: isLoadingSeason } = useQuery({
    queryKey: ['active-season'],
    queryFn: async () => {
      // Primeiro tenta usar a função RPC
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_active_season');
      
      if (!rpcError && rpcData && rpcData.length > 0) {
        return rpcData[0] as Season & { days_remaining: number };
      }
      
      // Fallback: buscar diretamente
      const { data, error } = await supabase
        .from('seasons')
        .select('*')
        .eq('is_active', true)
        .single();
      
      if (error) throw error;
      
      // Calcular dias restantes
      const endDate = new Date(data.end_date);
      const today = new Date();
      const daysRemaining = Math.max(0, Math.ceil((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)));
      
      return { ...data, days_remaining: daysRemaining } as Season & { days_remaining: number };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  // Buscar progresso do usuário na temporada atual
  const { data: userProgress, isLoading: isLoadingProgress, refetch: refetchProgress } = useQuery({
    queryKey: ['user-season-progress', user?.id, currentSeason?.id],
    queryFn: async () => {
      if (!user?.id || !currentSeason?.id) return null;
      
      const { data, error } = await supabase
        .from('user_season_progress')
        .select('*')
        .eq('user_id', user.id)
        .eq('season_id', currentSeason.id)
        .maybeSingle();
      
      if (error) throw error;
      
      // Se não existe, criar registro inicial
      if (!data) {
        const { data: newProgress, error: insertError } = await supabase
          .from('user_season_progress')
          .insert({
            user_id: user.id,
            season_id: currentSeason.id,
            season_xp: 0,
            season_level: 1,
          })
          .select()
          .single();
        
        if (insertError) throw insertError;
        return newProgress as UserSeasonProgress;
      }
      
      return data as UserSeasonProgress;
    },
    enabled: !!user?.id && !!currentSeason?.id,
    staleTime: 60 * 1000, // 1 minuto
  });

  // Calcular progresso de nível
  const levelProgress = userProgress 
    ? getLevelProgress(userProgress.season_xp)
    : { currentLevel: 1, currentXp: 0, nextLevelXp: 50, progress: 0 };

  // Obter definição da temporada
  const seasonDefinition = currentSeason 
    ? getSeasonDefinition(currentSeason.quarter)
    : null;

  // Verificar se tem penalty de streak ativo
  const hasStreakPenalty = userProgress?.streak_penalty_until 
    ? new Date(userProgress.streak_penalty_until) > new Date()
    : false;

  return {
    // Temporada
    currentSeason,
    seasonDefinition,
    isLoadingSeason,
    
    // Progresso do usuário
    userProgress,
    levelProgress,
    isLoadingProgress,
    refetchProgress,
    
    // Cálculos derivados
    hasStreakPenalty,
    daysRemaining: currentSeason?.days_remaining ?? 0,
    seasonProgress: Math.round(((userProgress?.season_xp ?? 0) / TOTAL_SEASON_XP) * 100),
    
    // Status
    isLoading: isLoadingSeason || isLoadingProgress,
  };
}

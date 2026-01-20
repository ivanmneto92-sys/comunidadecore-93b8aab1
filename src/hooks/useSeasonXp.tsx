import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSeason } from '@/hooks/useSeason';
import { 
  XP_CAPS, 
  calculateTotalXp, 
  calculateLevelFromXp,
} from '@/lib/seasonXpCalculator';

export type XpSource = 'checkin' | 'performance' | 'community' | 'tutorial' | 'achievement' | 'affiliate' | 'bonus';

interface XpTransaction {
  source: XpSource;
  xp_season: number;
  xp_total: number;
  multiplier?: number;
  details?: Record<string, unknown>;
}

interface DailyCapUsage {
  source: string;
  cap: number;
  used: number;
  remaining: number;
}

export function useSeasonXp() {
  const { user } = useAuth();
  const { currentSeason, userProgress, refetchProgress } = useSeason();
  const queryClient = useQueryClient();

  // Buscar uso de caps do dia
  const { data: dailyCaps, refetch: refetchCaps } = useQuery({
    queryKey: ['daily-xp-caps', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .rpc('get_daily_xp_caps', { p_user_id: user.id });
      
      if (error) throw error;
      return data as DailyCapUsage[];
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 segundos
  });

  // Mutation para adicionar XP
  const addXpMutation = useMutation({
    mutationFn: async ({ source, amount, multiplier = 1.0, details }: {
      source: XpSource;
      amount: number;
      multiplier?: number;
      details?: Record<string, unknown>;
    }) => {
      if (!user?.id || !currentSeason?.id || !userProgress) {
        throw new Error('Missing user, season, or progress data');
      }

      // Verificar cap da fonte
      const sourceCap = dailyCaps?.find(c => c.source === source);
      const remaining = sourceCap?.remaining ?? XP_CAPS.daily[source] ?? 50;
      
      // Aplicar cap
      const cappedAmount = Math.min(amount, remaining);
      if (cappedAmount <= 0) {
        return { xpAdded: 0, capped: true };
      }

      // Calcular XP com multiplicador
      const xpSeason = Math.round(cappedAmount * multiplier);
      const xpTotal = calculateTotalXp(xpSeason);

      // Registrar transação
      const { error: txError } = await supabase
        .from('xp_transactions')
        .insert([{
          user_id: user.id,
          season_id: currentSeason.id,
          source,
          xp_season: xpSeason,
          xp_total: xpTotal,
          multiplier,
          details: details ? JSON.parse(JSON.stringify(details)) : null,
        }]);

      if (txError) throw txError;

      // Atualizar progresso da temporada
      const newSeasonXp = userProgress.season_xp + xpSeason;
      const newLevel = calculateLevelFromXp(newSeasonXp);

      const { error: progressError } = await supabase
        .from('user_season_progress')
        .update({
          season_xp: newSeasonXp,
          season_level: newLevel,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userProgress.id);

      if (progressError) throw progressError;

      // Atualizar XP total (permanente)
      const { data: existingXp } = await supabase
        .from('user_xp')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (existingXp) {
        await supabase
          .from('user_xp')
          .update({
            total_xp: existingXp.total_xp + xpTotal,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id);
      } else {
        await supabase
          .from('user_xp')
          .insert({
            user_id: user.id,
            total_xp: xpTotal,
          });
      }

      return { 
        xpAdded: xpSeason, 
        xpTotal: xpTotal,
        newSeasonXp,
        newLevel,
        capped: cappedAmount < amount,
      };
    },
    onSuccess: () => {
      refetchProgress();
      refetchCaps();
      queryClient.invalidateQueries({ queryKey: ['user-xp'] });
    },
  });

  // Função helper para adicionar XP com tipo
  const addXp = async (
    source: XpSource, 
    amount: number, 
    options?: { multiplier?: number; details?: Record<string, unknown> }
  ) => {
    return addXpMutation.mutateAsync({
      source,
      amount,
      multiplier: options?.multiplier,
      details: options?.details,
    });
  };

  // Obter cap restante para uma fonte
  const getRemainingCap = (source: XpSource): number => {
    const cap = dailyCaps?.find(c => c.source === source);
    return cap?.remaining ?? XP_CAPS.daily[source] ?? 0;
  };

  // Verificar se ainda pode ganhar XP hoje
  const canEarnXp = (source: XpSource): boolean => {
    return getRemainingCap(source) > 0;
  };

  return {
    addXp,
    dailyCaps,
    getRemainingCap,
    canEarnXp,
    isAddingXp: addXpMutation.isPending,
    refetchCaps,
  };
}

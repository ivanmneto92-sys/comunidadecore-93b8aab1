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

  // Mutation para adicionar XP (via RPC SECURITY DEFINER)
  const addXpMutation = useMutation({
    mutationFn: async ({ source, amount, multiplier = 1.0, details }: {
      source: XpSource;
      amount: number;
      multiplier?: number;
      details?: Record<string, unknown>;
    }) => {
      if (!user?.id) throw new Error('Not authenticated');

      const { data, error } = await supabase.rpc('add_xp', {
        _source: source,
        _amount: amount,
        _multiplier: multiplier,
        _details: details ? (JSON.parse(JSON.stringify(details)) as never) : null,
      });

      if (error) throw error;

      const result = (data ?? {}) as {
        xp_added?: number;
        xp_total_added?: number;
        new_season_xp?: number;
        new_season_level?: number;
        capped?: boolean;
      };

      return {
        xpAdded: result.xp_added ?? 0,
        xpTotal: result.xp_total_added ?? 0,
        newSeasonXp: result.new_season_xp ?? 0,
        newLevel: result.new_season_level ?? 0,
        capped: !!result.capped,
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

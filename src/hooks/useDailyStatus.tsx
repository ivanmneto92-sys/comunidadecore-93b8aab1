import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DailyStatus {
  score: number;
  status: 'success' | 'warning' | 'danger';
  profileType: 'defensivo' | 'normal' | 'agressivo';
  riskLevel: 'baixo' | 'moderado' | 'alto';
  drawdownStatus: 'controlado' | 'em_observacao' | 'fora_do_padrao';
  insightText: string;
}

interface DailyResult {
  pnlPercent: number;
  tradesCount: number;
  wins: number;
  losses: number;
}

interface CommunityHighlight {
  id: string;
  type: 'risk' | 'announcement' | 'market';
  title: string;
  channel: string;
}

export function useDailyStatus() {
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: healthScore, isLoading: isLoadingHealth } = useQuery({
    queryKey: ['health-score', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('health_scores')
        .select('*')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: dailyReport, isLoading: isLoadingReport } = useQuery({
    queryKey: ['daily-report', today],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('reports_daily')
        .select('*')
        .eq('date', today)
        .not('published_at', 'is', null)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 0,
    refetchOnMount: true,
  });

  const { data: highlights, isLoading: isLoadingHighlights } = useQuery({
    queryKey: ['community-highlights'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          content,
          is_bot_message,
          channel:channels(slug, name)
        `)
        .eq('is_highlight', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
  });

  const dailyStatus: DailyStatus | null = healthScore ? {
    score: healthScore.score,
    status: healthScore.status as 'success' | 'warning' | 'danger',
    profileType: (healthScore as any).profile_type || 'normal',
    riskLevel: (healthScore as any).risk_level || 'baixo',
    drawdownStatus: (healthScore as any).drawdown_status || 'controlado',
    insightText: (healthScore as any).insight_text || 'Mantenha o foco na gestão de risco e siga o plano operacional.',
  } : null;

  const dailyResult: DailyResult | null = dailyReport ? {
    pnlPercent: Number(dailyReport.pnl_percent),
    tradesCount: dailyReport.trades_count,
    wins: Math.round(dailyReport.trades_count * (Number(dailyReport.win_rate) / 100)),
    losses: dailyReport.trades_count - Math.round(dailyReport.trades_count * (Number(dailyReport.win_rate) / 100)),
  } : null;

  const communityHighlights: CommunityHighlight[] = (highlights || []).map((msg: any) => {
    const channelSlug = msg.channel?.slug || '';
    let type: 'risk' | 'announcement' | 'market' = 'market';
    if (channelSlug.includes('risco') || channelSlug.includes('leitura')) type = 'risk';
    else if (channelSlug.includes('anuncio') || channelSlug.includes('avisos')) type = 'announcement';

    return {
      id: msg.id,
      type,
      title: msg.content.substring(0, 80) + (msg.content.length > 80 ? '...' : ''),
      channel: msg.channel?.name || 'Comunidade',
    };
  });

  return {
    dailyStatus,
    dailyResult,
    communityHighlights,
    isLoading: isLoadingHealth || isLoadingReport || isLoadingHighlights,
  };
}

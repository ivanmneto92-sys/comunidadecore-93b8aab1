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
  winRate: number;
  positiveDays: number;
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
        .select('score, status, profile_type, risk_level, drawdown_status, insight_text')
        .eq('date', today)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  const { data: dailyReportData, isLoading: isLoadingReport } = useQuery({
    queryKey: ['daily-report-with-streak', today],
    queryFn: async () => {
      // Fetch today's report
      const { data: todayReport, error: todayError } = await supabase
        .from('reports_daily')
        .select('pnl_percent, trades_count, win_rate')
        .eq('date', today)
        .not('published_at', 'is', null)
        .maybeSingle();

      if (todayError) throw todayError;

      // Fetch all reports to calculate positive days streak
      const { data: allReports, error: allError } = await supabase
        .from('reports_daily')
        .select('pnl_percent, date')
        .not('published_at', 'is', null)
        .order('date', { ascending: false });

      if (allError) throw allError;

      let positiveDays = 0;
      if (allReports && allReports.length > 0) {
        for (const report of allReports) {
          if (Number(report.pnl_percent) > 0) {
            positiveDays++;
          } else {
            break;
          }
        }
      }

      return { todayReport, positiveDays };
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
          channel:channels(slug, name)
        `)
        .eq('is_highlight', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000,
  });

  const dailyStatus: DailyStatus | null = healthScore ? {
    score: healthScore.score,
    status: healthScore.status as 'success' | 'warning' | 'danger',
    profileType: (healthScore as any).profile_type || 'normal',
    riskLevel: (healthScore as any).risk_level || 'baixo',
    drawdownStatus: (healthScore as any).drawdown_status || 'controlado',
    insightText: (healthScore as any).insight_text || 'Mantenha o foco na gestão de risco e siga o plano operacional.',
  } : null;

  const dailyResult: DailyResult | null = dailyReportData?.todayReport ? {
    pnlPercent: Number(dailyReportData.todayReport.pnl_percent),
    tradesCount: dailyReportData.todayReport.trades_count,
    winRate: Number(dailyReportData.todayReport.win_rate),
    positiveDays: dailyReportData.positiveDays ?? 0,
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

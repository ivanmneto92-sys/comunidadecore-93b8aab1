import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { HealthScoreCard } from '@/components/dashboard/HealthScoreCard';
import { DailyResultCard } from '@/components/dashboard/DailyResultCard';
import { AISummaryCard } from '@/components/dashboard/AISummaryCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2 } from 'lucide-react';
import logoCore from '@/assets/logo-core.png';

interface HealthScore {
  score: number;
  status: 'success' | 'warning' | 'danger';
}

interface DailyReport {
  pnl_percent: number;
  trades_count: number;
  drawdown_percent: number;
  ai_comment: string | null;
  date: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [healthScore, setHealthScore] = useState<HealthScore | null>(null);
  const [todayReport, setTodayReport] = useState<DailyReport | null>(null);
  const [yesterdayReport, setYesterdayReport] = useState<DailyReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch health score
        const { data: healthData } = await supabase
          .from('health_scores')
          .select('score, status')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (healthData) {
          setHealthScore(healthData as HealthScore);
        }

        // Fetch daily reports
        const { data: reportsData } = await supabase
          .from('reports_daily')
          .select('pnl_percent, trades_count, drawdown_percent, ai_comment, date')
          .not('published_at', 'is', null)
          .order('date', { ascending: false })
          .limit(2);

        if (reportsData && reportsData.length > 0) {
          setTodayReport(reportsData[0] as DailyReport);
          if (reportsData.length > 1) {
            setYesterdayReport(reportsData[1] as DailyReport);
          }
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header with Logo */}
        <div className="flex items-center gap-3">
          <img src={logoCore} alt="CORE" className="h-8 w-auto" />
          <div>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>

        {/* Health Score */}
        {healthScore && (
          <HealthScoreCard score={healthScore.score} status={healthScore.status} />
        )}

        {/* Daily Results */}
        <div className="grid gap-4 sm:grid-cols-2">
          {todayReport && (
            <DailyResultCard
              label="Resultado de Hoje"
              pnlPercent={Number(todayReport.pnl_percent)}
              tradesCount={todayReport.trades_count}
              drawdownPercent={Number(todayReport.drawdown_percent)}
            />
          )}
          {yesterdayReport && (
            <DailyResultCard
              label="Ontem"
              pnlPercent={Number(yesterdayReport.pnl_percent)}
              tradesCount={yesterdayReport.trades_count}
              drawdownPercent={Number(yesterdayReport.drawdown_percent)}
            />
          )}
        </div>

        {/* AI Summary */}
        {todayReport?.ai_comment && (
          <AISummaryCard summary={todayReport.ai_comment} />
        )}

        {/* Quick Actions */}
        <QuickActions />

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

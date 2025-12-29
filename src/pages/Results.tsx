import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { ResultsFilter } from '@/components/results/ResultsFilter';
import { ResultsChart } from '@/components/results/ResultsChart';
import { DailyResultItem } from '@/components/results/DailyResultItem';
import { TodayResultCard } from '@/components/results/TodayResultCard';
import { PerformanceOverview } from '@/components/results/PerformanceOverview';
import { AccountGrowthChart } from '@/components/results/AccountGrowthChart';
import { MonthlyReturnsChart } from '@/components/results/MonthlyReturnsChart';
import { useAccountMetrics } from '@/hooks/useAccountMetrics';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, BarChart3 } from 'lucide-react';
import { subDays, startOfYear, parseISO, isAfter } from 'date-fns';

export type FilterPeriod = '7d' | '30d' | '90d' | 'ytd';

interface DailyReport {
  id: string;
  date: string;
  trades_count: number;
  win_rate: number;
  pnl_percent: number;
  drawdown_percent: number;
  profile_type: string | null;
  status: 'success' | 'warning' | 'danger';
  ai_comment: string | null;
}

export default function Results() {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const { metrics, monthlyReturns, growthData, loading: metricsLoading } = useAccountMetrics();
  const [filter, setFilter] = useState<FilterPeriod>('30d');

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports_daily')
          .select('*')
          .not('published_at', 'is', null)
          .order('date', { ascending: false });

        if (error) throw error;
        setReports((data || []) as DailyReport[]);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  const filteredReports = useMemo(() => {
    const now = new Date();
    let startDate: Date;

    switch (filter) {
      case '7d':
        startDate = subDays(now, 7);
        break;
      case '30d':
        startDate = subDays(now, 30);
        break;
      case '90d':
        startDate = subDays(now, 90);
        break;
      case 'ytd':
        startDate = startOfYear(now);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return reports.filter((report) => {
      const reportDate = parseISO(report.date);
      return isAfter(reportDate, startDate);
    });
  }, [reports, filter]);

  const stats = useMemo(() => {
    if (filteredReports.length === 0) {
      return {
        totalTrades: 0,
        avgWinRate: 0,
        totalPnl: 0,
        maxDrawdown: 0,
        winDays: 0,
        lossDays: 0,
      };
    }

    const totalTrades = filteredReports.reduce((sum, r) => sum + r.trades_count, 0);
    const avgWinRate = filteredReports.reduce((sum, r) => sum + Number(r.win_rate), 0) / filteredReports.length;
    const totalPnl = filteredReports.reduce((sum, r) => sum + Number(r.pnl_percent), 0);
    const maxDrawdown = Math.max(...filteredReports.map((r) => Number(r.drawdown_percent)));
    const winDays = filteredReports.filter((r) => Number(r.pnl_percent) > 0).length;
    const lossDays = filteredReports.filter((r) => Number(r.pnl_percent) < 0).length;

    return { totalTrades, avgWinRate, totalPnl, maxDrawdown, winDays, lossDays };
  }, [filteredReports]);

  const todayResult = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const todayReport = reports.find((r) => r.date === today);
    
    if (!todayReport) {
      return { pnlPercent: null, tradesCount: 0, winRate: 0 };
    }
    
    return {
      pnlPercent: Number(todayReport.pnl_percent),
      tradesCount: todayReport.trades_count,
      winRate: Number(todayReport.win_rate),
    };
  }, [reports]);

  const chartData = useMemo(() => {
    // Sort by date ascending for chart
    const sorted = [...filteredReports].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let cumulativePnl = 0;
    return sorted.map((report) => {
      cumulativePnl += Number(report.pnl_percent);
      return {
        date: report.date,
        pnl: Number(report.pnl_percent),
        cumulativePnl: Number(cumulativePnl.toFixed(2)),
        drawdown: Number(report.drawdown_percent),
      };
    });
  }, [filteredReports]);

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
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
            <BarChart3 className="h-6 w-6 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resultados</h1>
            <p className="text-sm text-muted-foreground">Performance do Copy</p>
          </div>
        </div>

        {/* Filters */}
        <ResultsFilter value={filter} onChange={setFilter} />

        {/* Today's Result */}
        <TodayResultCard 
          pnlPercent={todayResult.pnlPercent} 
          tradesCount={todayResult.tradesCount} 
          winRate={todayResult.winRate} 
        />

        {/* Performance Overview */}
        <PerformanceOverview metrics={metrics} />

        {/* Growth Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <AccountGrowthChart data={growthData} />
          <MonthlyReturnsChart data={monthlyReturns} />
        </div>

        {/* PnL Chart */}
        {chartData.length > 0 && <ResultsChart data={chartData} />}

        {/* Daily Results Feed */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Histórico Diário</h2>
          {filteredReports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado encontrado para este período.
            </p>
          ) : (
            <div className="space-y-2">
              {filteredReports.map((report) => (
                <DailyResultItem key={report.id} report={report} />
              ))}
            </div>
          )}
        </div>

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-4">
          Resultados passados não garantem resultados futuros.
        </p>
      </div>
    </AppLayout>
  );
}

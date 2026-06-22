import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ResultsFilter } from '@/components/results/ResultsFilter';
import { ResultsChart } from '@/components/results/ResultsChart';
import { DailyResultItem } from '@/components/results/DailyResultItem';
import { TodayResultCard } from '@/components/results/TodayResultCard';
import { PerformanceOverview } from '@/components/results/PerformanceOverview';
import { AccountGrowthChart } from '@/components/results/AccountGrowthChart';
import { MonthlyReturnsChart } from '@/components/results/MonthlyReturnsChart';
import { PositiveStreakBadge } from '@/components/results/PositiveStreakBadge';
import { ResultsSkeleton } from '@/components/results/ResultsSkeleton';
import { useAccountMetrics, FilterPeriod } from '@/hooks/useAccountMetrics';
import { supabase } from '@/integrations/supabase/client';
import { TrendingUp } from 'lucide-react';
import { subDays, parseISO, isAfter, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

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
  const [filter, setFilter] = useState<FilterPeriod>('30d');
  const [visibleCount, setVisibleCount] = useState(15); // Virtualization: start with 15 items
  
  // Pass filter to useAccountMetrics so all data respects the filter
  const { metrics, monthlyReturns, growthData, loading: metricsLoading } = useAccountMetrics(filter);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('reports_daily')
          .select('id, date, trades_count, win_rate, pnl_percent, drawdown_percent, profile_type, status, ai_comment')
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
  
  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(15);
  }, [filter]);

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
      case '12m':
        startDate = subDays(now, 365);
        break;
      default:
        startDate = subDays(now, 30);
    }

    return reports.filter((report) => {
      const reportDate = parseISO(report.date);
      return isAfter(reportDate, startDate);
    });
  }, [reports, filter]);

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

  const streakStats = useMemo(() => {
    // Ordena ascendente para varrer e detectar sequências
    const ascending = [...filteredReports].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let bestStreak = 0;
    let running = 0;
    for (const r of ascending) {
      if (Number(r.pnl_percent) > 0) {
        running += 1;
        if (running > bestStreak) bestStreak = running;
      } else {
        running = 0;
      }
    }

    // Streak atual: do mais recente para trás
    let currentStreak = 0;
    for (let i = ascending.length - 1; i >= 0; i--) {
      if (Number(ascending[i].pnl_percent) > 0) currentStreak += 1;
      else break;
    }

    return { currentStreak, bestStreak };
  }, [filteredReports]);

  if (loading) {
    return (
      <AppLayout>
        <ResultsSkeleton />
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4 overflow-x-hidden">
        {/* Header */}
        <div className={cn('flex items-center gap-3 animate-fade-in')}>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg">
            <TrendingUp className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-xl font-bold">Resultados</h1>
            <p className="text-xs text-muted-foreground">Performance do Copy</p>
          </div>
        </div>

        {/* Filters */}
        <div className="animate-fade-in" style={{ animationDelay: '50ms' }}>
          <ResultsFilter value={filter} onChange={setFilter} />
        </div>

        {/* Positive Days Streak Badge */}
        <div className="animate-fade-in" style={{ animationDelay: '75ms' }}>
          <PositiveStreakBadge
            currentStreak={streakStats.currentStreak}
            bestStreak={streakStats.bestStreak}
            period={filter}
          />
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="charts">Gráficos</TabsTrigger>
            <TabsTrigger value="history">Histórico</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-4 space-y-4">
            <TodayResultCard
              pnlPercent={todayResult.pnlPercent}
              tradesCount={todayResult.tradesCount}
              winRate={todayResult.winRate}
            />
            <PerformanceOverview metrics={metrics} />
          </TabsContent>

          <TabsContent value="charts" className="mt-4 space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <AccountGrowthChart data={growthData} />
              <MonthlyReturnsChart data={monthlyReturns} />
            </div>
            {chartData.length > 0 && <ResultsChart data={chartData} />}
          </TabsContent>

          <TabsContent value="history" className="mt-4">


        {/* Daily Results Feed - Grouped by month with sticky headers */}
        <div className="space-y-2 animate-fade-in" style={{ animationDelay: '300ms' }}>
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Histórico Diário
          </h2>
          {filteredReports.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              Nenhum resultado para este período.
            </p>
          ) : (() => {
            const visibleReports = filteredReports.slice(0, visibleCount);
            const groups: { key: string; label: string; total: number; items: typeof visibleReports }[] = [];
            visibleReports.forEach((r) => {
              const d = parseISO(r.date);
              const key = format(d, 'yyyy-MM');
              let g = groups.find((x) => x.key === key);
              if (!g) {
                g = {
                  key,
                  label: format(d, "MMMM 'de' yyyy", { locale: ptBR }),
                  total: 0,
                  items: [],
                };
                groups.push(g);
              }
              g.items.push(r);
              g.total += Number(r.pnl_percent);
            });

            let runningIndex = 0;
            return (
              <div className="space-y-4">
                {groups.map((g) => (
                  <section key={g.key} className="space-y-2">
                    <div className="sticky top-0 z-10 -mx-4 px-4 py-2 bg-background/85 backdrop-blur-md border-b border-border/50 flex items-center justify-between">
                      <h3 className="text-xs font-semibold uppercase tracking-wide text-foreground capitalize">
                        {g.label}
                      </h3>
                      <span
                        className={cn(
                          'text-xs font-bold tabular-nums',
                          g.total > 0 ? 'text-emerald-400' : g.total < 0 ? 'text-red-400' : 'text-muted-foreground'
                        )}
                      >
                        {g.total > 0 ? '+' : ''}{g.total.toFixed(2)}%
                      </span>
                    </div>
                    <div className="space-y-2">
                      {g.items.map((report) => {
                        const i = runningIndex++;
                        return (
                          <div
                            key={report.id}
                            className="animate-fade-in"
                            style={{ animationDelay: `${Math.min(i * 20, 150)}ms` }}
                          >
                            <DailyResultItem report={report} />
                          </div>
                        );
                      })}
                    </div>
                  </section>
                ))}

                {visibleCount < filteredReports.length && (
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 15)}
                    className="w-full py-3 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Carregar mais ({filteredReports.length - visibleCount} restantes)
                  </button>
                )}
              </div>
            );
          })()}
        </div>
          </TabsContent>
        </Tabs>

        {/* Compliance disclaimer */}
        <p className="text-center text-[10px] text-muted-foreground/60 pt-4 pb-2">
          Resultados passados não garantem resultados futuros.
        </p>
      </div>
    </AppLayout>
  );
}

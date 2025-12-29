import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AccountMetrics {
  totalReturn: number;
  deposits1m: number;
  withdrawals1m: number;
  maxDrawdown: number;
  totalProfit: number;
  quarterReturn: number;
  monthReturn: number;
  weekReturn: number;
  dayReturn: number;
  accountBalance: number;
}

interface MonthlyReturn {
  month: string;
  returnPercent: number;
}

interface AccountGrowthPoint {
  date: string;
  balance: number;
}

export function useAccountMetrics() {
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [growthData, setGrowthData] = useState<AccountGrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch latest account metrics
        const { data: metricsData } = await supabase
          .from('account_metrics')
          .select('*')
          .order('date', { ascending: false })
          .limit(1)
          .single();

        if (metricsData) {
          setMetrics({
            totalReturn: Number(metricsData.total_return),
            deposits1m: Number(metricsData.deposits_1m),
            withdrawals1m: Number(metricsData.withdrawals_1m),
            maxDrawdown: Number(metricsData.max_drawdown),
            totalProfit: Number(metricsData.total_profit),
            quarterReturn: Number(metricsData.quarter_return),
            monthReturn: Number(metricsData.month_return),
            weekReturn: Number(metricsData.week_return),
            dayReturn: Number(metricsData.day_return),
            accountBalance: Number(metricsData.account_balance),
          });
        }

        // Fetch monthly returns for chart
        const { data: monthlyData } = await supabase
          .from('monthly_returns')
          .select('*')
          .order('month', { ascending: true });

        if (monthlyData) {
          setMonthlyReturns(
            monthlyData.map((m) => ({
              month: new Date(m.month).toLocaleDateString('pt-BR', { month: 'short' }),
              returnPercent: Number(m.return_percent),
            }))
          );
        }

        // Generate growth data from daily reports for chart
        const { data: reportsData } = await supabase
          .from('reports_daily')
          .select('date, pnl_percent')
          .not('published_at', 'is', null)
          .order('date', { ascending: true });

        if (reportsData && reportsData.length > 0) {
          let balance = 1000; // Starting balance
          const growth: AccountGrowthPoint[] = [
            { date: 'Início', balance: 1000 }
          ];
          
          reportsData.forEach((report, index) => {
            balance = balance * (1 + Number(report.pnl_percent) / 100);
            const dateLabel = new Date(report.date).toLocaleDateString('pt-BR', { 
              month: 'short', 
              day: 'numeric' 
            });
            growth.push({ 
              date: dateLabel, 
              balance: Math.round(balance * 100) / 100 
            });
          });
          
          setGrowthData(growth);
        }
      } catch (error) {
        console.error('Error fetching account metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return { metrics, monthlyReturns, growthData, loading };
}

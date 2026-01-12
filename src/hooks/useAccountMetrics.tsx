import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfYear, subDays } from 'date-fns';

export type FilterPeriod = '7d' | '30d' | '90d' | 'ytd';

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

export function useAccountMetrics(filterPeriod: FilterPeriod = '30d') {
  const [metrics, setMetrics] = useState<AccountMetrics | null>(null);
  const [monthlyReturns, setMonthlyReturns] = useState<MonthlyReturn[]>([]);
  const [growthData, setGrowthData] = useState<AccountGrowthPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    // Calculate date range based on filter
    const now = new Date();
    let startDate: Date;
    
    switch (filterPeriod) {
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
    
    const startDateStr = startDate.toISOString().split('T')[0];
    
    try {
      // Fetch all data in parallel for better performance
      const [metricsResult, monthlyResult, reportsResult] = await Promise.all([
        // Latest account metrics (optimized select)
        supabase
          .from('account_metrics')
          .select('total_return, deposits_1m, withdrawals_1m, max_drawdown, total_profit, quarter_return, month_return, week_return, day_return, account_balance')
          .order('date', { ascending: false })
          .limit(1)
          .single(),
        // Monthly returns for chart
        supabase
          .from('monthly_returns')
          .select('month, return_percent')
          .gte('month', startDateStr.substring(0, 7))
          .order('month', { ascending: true }),
        // Daily reports for growth chart
        supabase
          .from('reports_daily')
          .select('date, pnl_percent')
          .not('published_at', 'is', null)
          .gte('date', startDateStr)
          .order('date', { ascending: true }),
      ]);

      const metricsData = metricsResult.data;

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

      // Process monthly returns
      if (monthlyResult.data) {
        setMonthlyReturns(
          monthlyResult.data.map((m) => ({
            month: new Date(m.month).toLocaleDateString('pt-BR', { month: 'short' }),
            returnPercent: Number(m.return_percent),
          }))
        );
      }

      // Process growth data from daily reports
      const reportsData = reportsResult.data;

      if (reportsData && reportsData.length > 0) {
        let balance = 1000; // Starting balance
        const growth: AccountGrowthPoint[] = [];
        
        reportsData.forEach((report) => {
          balance = balance * (1 + Number(report.pnl_percent) / 100);
          const date = new Date(report.date);
          const dateLabel = `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          growth.push({ 
            date: dateLabel, 
            balance: Math.round(balance) 
          });
        });
        
        setGrowthData(growth);
      } else {
        setGrowthData([]);
      }
    } catch (err) {
      console.error('Error fetching account metrics:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch metrics'));
    } finally {
      setLoading(false);
    }
  }, [filterPeriod]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const refetch = () => {
    fetchData();
  };

  return { metrics, monthlyReturns, growthData, loading, error, refetch };
}

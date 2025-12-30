import { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      
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

        // Fetch monthly returns for chart - filtered by period
        const { data: monthlyData } = await supabase
          .from('monthly_returns')
          .select('*')
          .gte('month', startDateStr.substring(0, 7))
          .order('month', { ascending: true });

        if (monthlyData) {
          setMonthlyReturns(
            monthlyData.map((m) => ({
              month: new Date(m.month).toLocaleDateString('pt-BR', { month: 'short' }),
              returnPercent: Number(m.return_percent),
            }))
          );
        }

        // Generate growth data from daily reports - filtered by period
        const { data: reportsData } = await supabase
          .from('reports_daily')
          .select('date, pnl_percent')
          .not('published_at', 'is', null)
          .gte('date', startDateStr)
          .order('date', { ascending: true });

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
      } catch (error) {
        console.error('Error fetching account metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filterPeriod]);

  return { metrics, monthlyReturns, growthData, loading };
}

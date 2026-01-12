import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { startOfDay, subDays, startOfMonth, startOfQuarter, startOfYear, format, parseISO } from 'date-fns';

export type FilterPeriod = '7d' | '30d' | '90d' | 'ytd' | 'all';

export interface AccountMetrics {
  totalReturn: number;
  deposits1m: number;
  withdrawals1m: number;
  maxDrawdown: number;
  totalProfit: number;
  quarterReturn: number;
  monthReturn: number;
  weekReturn: number;
  dayReturn: number;
}

export interface MonthlyReturn {
  month: string;
  returnPercent: number;
}

export interface AccountGrowthPoint {
  date: string;
  balance: number;
}

interface DailyReport {
  date: string;
  pnl_percent: number;
  drawdown_percent: number;
}

export function useAccountMetrics(filterPeriod: FilterPeriod = '30d') {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all published reports for calculations
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports_daily')
        .select('date, pnl_percent, drawdown_percent')
        .not('published_at', 'is', null)
        .order('date', { ascending: true });

      if (reportsError) throw reportsError;

      setReports(reportsData || []);
    } catch (err) {
      setError(err as Error);
      console.error('Error fetching account metrics:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Calculate metrics dynamically from reports_daily
  const metrics = useMemo((): AccountMetrics | null => {
    if (!reports.length) return null;

    const today = format(new Date(), 'yyyy-MM-dd');
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const quarterAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');

    // Total return (all time)
    const totalReturn = reports.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Day return (today only)
    const todayReport = reports.find(r => r.date === today);
    const dayReturn = todayReport?.pnl_percent || 0;

    // Week return (last 7 days)
    const weekReturn = reports
      .filter(r => r.date >= weekAgo)
      .reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Month return (last 30 days)
    const monthReturn = reports
      .filter(r => r.date >= monthAgo)
      .reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Quarter return (last 90 days)
    const quarterReturn = reports
      .filter(r => r.date >= quarterAgo)
      .reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Max drawdown (from filtered period based on filterPeriod)
    let filteredForDrawdown = reports;
    if (filterPeriod === '7d') {
      filteredForDrawdown = reports.filter(r => r.date >= weekAgo);
    } else if (filterPeriod === '30d') {
      filteredForDrawdown = reports.filter(r => r.date >= monthAgo);
    } else if (filterPeriod === '90d') {
      filteredForDrawdown = reports.filter(r => r.date >= quarterAgo);
    } else if (filterPeriod === 'ytd') {
      const yearStart = format(startOfYear(new Date()), 'yyyy-MM-dd');
      filteredForDrawdown = reports.filter(r => r.date >= yearStart);
    }

    const maxDrawdown = Math.max(...filteredForDrawdown.map(r => r.drawdown_percent || 0), 0);

    // Placeholder values for deposits/withdrawals (would need separate data source)
    const deposits1m = 0;
    const withdrawals1m = 0;

    // Total profit calculation (assuming $100k initial balance for display)
    const initialBalance = 100000;
    const totalProfit = initialBalance * (totalReturn / 100);

    return {
      totalReturn,
      deposits1m,
      withdrawals1m,
      maxDrawdown,
      totalProfit,
      quarterReturn,
      monthReturn,
      weekReturn,
      dayReturn,
    };
  }, [reports, filterPeriod]);

  // Calculate monthly returns dynamically
  const monthlyReturns = useMemo((): MonthlyReturn[] => {
    if (!reports.length) return [];

    // Group by month and sum pnl_percent
    const monthlyMap = reports.reduce((acc, report) => {
      const month = report.date.substring(0, 7); // "2026-01"
      acc[month] = (acc[month] || 0) + (report.pnl_percent || 0);
      return acc;
    }, {} as Record<string, number>);

    // Convert to array and sort by month
    return Object.entries(monthlyMap)
      .map(([month, returnPercent]) => ({ month, returnPercent }))
      .sort((a, b) => a.month.localeCompare(b.month));
  }, [reports]);

  // Calculate growth data (cumulative balance)
  const growthData = useMemo((): AccountGrowthPoint[] => {
    if (!reports.length) return [];

    const initialBalance = 100000;
    let cumulativeReturn = 0;

    // Filter based on filterPeriod
    let filteredReports = reports;
    const today = new Date();
    
    if (filterPeriod === '7d') {
      const cutoff = format(subDays(today, 7), 'yyyy-MM-dd');
      filteredReports = reports.filter(r => r.date >= cutoff);
    } else if (filterPeriod === '30d') {
      const cutoff = format(subDays(today, 30), 'yyyy-MM-dd');
      filteredReports = reports.filter(r => r.date >= cutoff);
    } else if (filterPeriod === '90d') {
      const cutoff = format(subDays(today, 90), 'yyyy-MM-dd');
      filteredReports = reports.filter(r => r.date >= cutoff);
    } else if (filterPeriod === 'ytd') {
      const yearStart = format(startOfYear(today), 'yyyy-MM-dd');
      filteredReports = reports.filter(r => r.date >= yearStart);
    }

    // Calculate cumulative balance starting from the first report in the filter
    // First, calculate the cumulative return up to the start of filtered period
    const firstFilteredDate = filteredReports[0]?.date;
    if (firstFilteredDate) {
      const beforeFiltered = reports.filter(r => r.date < firstFilteredDate);
      cumulativeReturn = beforeFiltered.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);
    }

    return filteredReports.map(report => {
      cumulativeReturn += report.pnl_percent || 0;
      const balance = initialBalance * (1 + cumulativeReturn / 100);
      return {
        date: report.date,
        balance: Math.round(balance),
      };
    });
  }, [reports, filterPeriod]);

  return {
    metrics,
    monthlyReturns,
    growthData,
    loading,
    error,
    refetch: fetchData,
  };
}

export { useAccountMetrics as default };

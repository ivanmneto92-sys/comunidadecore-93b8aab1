import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfYear, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

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
  initialBalance: number;
  currency: string;
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

interface TradingConfig {
  initial_balance: number;
  start_date: string;
  currency: string;
}

interface SavedMonthlyReturn {
  month: string;
  return_percent: number | null;
}

export function useAccountMetrics(filterPeriod: FilterPeriod = '30d') {
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [savedMonthlyReturns, setSavedMonthlyReturns] = useState<SavedMonthlyReturn[]>([]);
  const [config, setConfig] = useState<TradingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch trading config
      const { data: configData } = await supabase
        .from('trading_config')
        .select('initial_balance, start_date, currency')
        .limit(1)
        .single();

      if (configData) {
        setConfig(configData);
      }

      // Fetch all published reports for calculations
      const { data: reportsData, error: reportsError } = await supabase
        .from('reports_daily')
        .select('date, pnl_percent, drawdown_percent')
        .not('published_at', 'is', null)
        .order('date', { ascending: true });

      if (reportsError) throw reportsError;

      // Fetch saved monthly returns (historical data)
      const { data: monthlyData, error: monthlyError } = await supabase
        .from('monthly_returns')
        .select('month, return_percent')
        .order('month', { ascending: true });

      if (monthlyError) throw monthlyError;

      setReports(reportsData || []);
      setSavedMonthlyReturns(monthlyData || []);
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

  // Combine monthly_returns (historical) with calculated from reports_daily
  const combinedMonthlyReturns = useMemo((): MonthlyReturn[] => {
    // Create a map from saved monthly returns (format: "2024-06-01" -> "2024-06")
    const savedMap = new Map<string, number>();
    savedMonthlyReturns.forEach(mr => {
      const monthKey = mr.month.substring(0, 7); // "2024-06-01" -> "2024-06"
      savedMap.set(monthKey, mr.return_percent || 0);
    });

    // Calculate monthly returns from reports_daily
    const calculatedMap = new Map<string, number>();
    reports.forEach(report => {
      const monthKey = report.date.substring(0, 7); // "2026-01-10" -> "2026-01"
      calculatedMap.set(monthKey, (calculatedMap.get(monthKey) || 0) + (report.pnl_percent || 0));
    });

    // Combine: prefer saved data, fallback to calculated for recent months
    const allMonths = new Set([...savedMap.keys(), ...calculatedMap.keys()]);
    const result: MonthlyReturn[] = [];

    allMonths.forEach(monthKey => {
      // If we have saved data for this month, use it
      // Otherwise use calculated data
      const returnPercent = savedMap.has(monthKey) 
        ? savedMap.get(monthKey)! 
        : calculatedMap.get(monthKey) || 0;
      
      // Format month label (e.g., "Jun 24")
      const date = parse(monthKey + '-01', 'yyyy-MM-dd', new Date());
      const formattedMonth = format(date, 'MMM yy', { locale: ptBR });
      
      result.push({ month: formattedMonth, returnPercent });
    });

    // Sort by original month key
    const monthKeys = [...allMonths].sort();
    return monthKeys.map(key => {
      const returnPercent = savedMap.has(key) 
        ? savedMap.get(key)! 
        : calculatedMap.get(key) || 0;
      const date = parse(key + '-01', 'yyyy-MM-dd', new Date());
      const formattedMonth = format(date, 'MMM yy', { locale: ptBR });
      return { month: formattedMonth, returnPercent };
    });
  }, [reports, savedMonthlyReturns]);

  // Calculate metrics dynamically combining saved monthly returns + daily reports
  const metrics = useMemo((): AccountMetrics | null => {
    // Use config values or defaults
    const initialBalance = config?.initial_balance || 100000;
    const currency = config?.currency || 'USD';

    const today = format(new Date(), 'yyyy-MM-dd');
    const weekAgo = format(subDays(new Date(), 7), 'yyyy-MM-dd');
    const monthAgo = format(subDays(new Date(), 30), 'yyyy-MM-dd');
    const quarterAgo = format(subDays(new Date(), 90), 'yyyy-MM-dd');

    // Get months with saved returns
    const savedMonthsSet = new Set<string>();
    savedMonthlyReturns.forEach(mr => {
      savedMonthsSet.add(mr.month.substring(0, 7));
    });

    // Total return = sum of saved monthly returns + daily reports for months NOT in saved
    const savedTotal = savedMonthlyReturns.reduce((sum, mr) => sum + (mr.return_percent || 0), 0);
    
    // Calculate from daily reports only for months not in savedMonthlyReturns
    const dailyNotInSaved = reports.filter(r => {
      const monthKey = r.date.substring(0, 7);
      return !savedMonthsSet.has(monthKey);
    });
    const dailyTotal = dailyNotInSaved.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);
    
    const totalReturn = savedTotal + dailyTotal;

    // Day return (today only) - always from reports_daily
    const todayReport = reports.find(r => r.date === today);
    const dayReturn = todayReport?.pnl_percent || 0;

    // Week return (last 7 days) - from reports_daily
    const weekReturn = reports
      .filter(r => r.date >= weekAgo)
      .reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Month return (last 30 days) - from reports_daily
    const monthReturn = reports
      .filter(r => r.date >= monthAgo)
      .reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Quarter return (last 90 days) - from reports_daily
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

    const maxDrawdown = filteredForDrawdown.length > 0 
      ? Math.max(...filteredForDrawdown.map(r => r.drawdown_percent || 0), 0)
      : 0;

    // Placeholder values for deposits/withdrawals (would need separate data source)
    const deposits1m = 0;
    const withdrawals1m = 0;

    // Total profit calculation using configured initial balance
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
      initialBalance,
      currency,
    };
  }, [reports, savedMonthlyReturns, config, filterPeriod]);

  // Calculate growth data (cumulative balance)
  const growthData = useMemo((): AccountGrowthPoint[] => {
    if (!reports.length) return [];

    const initialBalance = config?.initial_balance || 100000;
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
  }, [reports, config, filterPeriod]);

  return {
    metrics,
    monthlyReturns: combinedMonthlyReturns,
    growthData,
    loading,
    error,
    refetch: fetchData,
  };
}

export { useAccountMetrics as default };

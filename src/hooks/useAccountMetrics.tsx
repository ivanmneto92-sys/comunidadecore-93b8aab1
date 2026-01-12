import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { subDays, startOfYear, startOfWeek, endOfWeek, format, parse } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export type FilterPeriod = '7d' | '30d' | '90d' | 'ytd' | 'all';

export interface AccountMetrics {
  totalReturn: number;
  periodReturn: number; // Return for selected filter period
  deposits1m: number;
  withdrawals1m: number;
  maxDrawdown: number;
  totalProfit: number;
  periodProfit: number; // Profit for selected filter period
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
  total_deposits: number;
  total_withdrawals: number;
  max_drawdown_override: number | null;
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
        .select('initial_balance, start_date, currency, total_deposits, total_withdrawals, max_drawdown_override')
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

  // Helper function to calculate compound return from an array of percentages
  const calculateCompoundReturn = (returns: number[]): number => {
    if (returns.length === 0) return 0;
    // Multiply all factors: (1 + r1/100) × (1 + r2/100) × ...
    const compoundFactor = returns.reduce((acc, r) => acc * (1 + r / 100), 1);
    // Return percentage: (factor - 1) × 100
    return (compoundFactor - 1) * 100;
  };

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

    // Collect all monthly returns in order for compound calculation
    // First: saved monthly returns (sorted by month)
    const savedReturnsList = [...savedMonthlyReturns]
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(mr => mr.return_percent || 0);

    // Second: daily returns for months NOT in saved (grouped by month, then summed)
    const dailyByMonth = new Map<string, number>();
    reports.forEach(r => {
      const monthKey = r.date.substring(0, 7);
      if (!savedMonthsSet.has(monthKey)) {
        dailyByMonth.set(monthKey, (dailyByMonth.get(monthKey) || 0) + (r.pnl_percent || 0));
      }
    });
    
    // Sort unsaved months and get their returns
    const unsavedMonthReturns = [...dailyByMonth.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([_, ret]) => ret);

    // Combine: simple sum of all monthly returns
    const allMonthlyReturns = [...savedReturnsList, ...unsavedMonthReturns];
    const totalReturn = allMonthlyReturns.reduce((sum, r) => sum + r, 0);

    // Day return (today only) - always from reports_daily
    const todayReport = reports.find(r => r.date === today);
    const dayReturn = todayReport?.pnl_percent || 0;

    // Week return (current calendar week - Monday to Sunday)
    const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const weekEnd = format(endOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');
    const currentWeekReports = reports.filter(r => r.date >= weekStart && r.date <= weekEnd);
    const weekReturn = currentWeekReports.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Month return (current month - sum of all days in the current month)
    const currentMonthKey = format(new Date(), 'yyyy-MM');
    const currentMonthReports = reports.filter(r => r.date.startsWith(currentMonthKey));
    const monthReturn = currentMonthReports.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);

    // Quarter return (last 3 months - simple sum of monthly returns)
    const sortedMonthlyReturns = [...combinedMonthlyReturns].slice(-3);
    const quarterReturn = sortedMonthlyReturns.reduce((sum, m) => sum + m.returnPercent, 0);

    // Calculate period-based return (based on filterPeriod)
    let filteredForPeriod = reports;
    if (filterPeriod === '7d') {
      filteredForPeriod = reports.filter(r => r.date >= weekAgo);
    } else if (filterPeriod === '30d') {
      filteredForPeriod = reports.filter(r => r.date >= monthAgo);
    } else if (filterPeriod === '90d') {
      // 90 dias = soma dos últimos 3 meses (não filtra reports, usa monthly_returns)
      filteredForPeriod = reports.filter(r => r.date >= quarterAgo);
    } else if (filterPeriod === 'ytd') {
      const yearStart = format(startOfYear(new Date()), 'yyyy-MM-dd');
      filteredForPeriod = reports.filter(r => r.date >= yearStart);
    }

    // Period return: sum of PnL% for the selected period
    // For 90d, use the sum of the last 3 months from monthly_returns
    let periodReturn: number;
    if (filterPeriod === '90d') {
      const last3Months = [...combinedMonthlyReturns].slice(-3);
      periodReturn = last3Months.reduce((sum, m) => sum + m.returnPercent, 0);
    } else {
      periodReturn = filteredForPeriod.reduce((sum, r) => sum + (r.pnl_percent || 0), 0);
    }

    // Max drawdown (from filtered period)
    const calculatedMaxDrawdown = filteredForPeriod.length > 0 
      ? Math.max(...filteredForPeriod.map(r => r.drawdown_percent || 0), 0)
      : 0;

    // Use the greater of calculated or override (historical max) only for 'all' filter
    const maxDrawdown = filterPeriod === 'all' 
      ? Math.max(calculatedMaxDrawdown, config?.max_drawdown_override || 0)
      : calculatedMaxDrawdown;

    // Get deposits/withdrawals from trading config
    const deposits1m = config?.total_deposits || 0;
    const withdrawals1m = config?.total_withdrawals || 0;

    // Total profit calculation (all time)
    const totalProfit = initialBalance * (totalReturn / 100);
    
    // Period profit calculation
    const periodProfit = initialBalance * (periodReturn / 100);

    return {
      totalReturn,
      periodReturn,
      deposits1m,
      withdrawals1m,
      maxDrawdown,
      totalProfit,
      periodProfit,
      quarterReturn,
      monthReturn,
      weekReturn,
      dayReturn,
      initialBalance,
      currency,
    };
  }, [reports, savedMonthlyReturns, combinedMonthlyReturns, config, filterPeriod]);

  // Calculate growth data (cumulative balance using compound returns)
  const growthData = useMemo((): AccountGrowthPoint[] => {
    if (!reports.length) return [];

    const initialBalance = config?.initial_balance || 100000;

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

    // Calculate the starting balance (compound up to the first filtered date)
    const firstFilteredDate = filteredReports[0]?.date;
    let startingBalance = initialBalance;
    
    if (firstFilteredDate) {
      const beforeFiltered = reports.filter(r => r.date < firstFilteredDate);
      // Apply compound returns for all days before the filtered period
      beforeFiltered.forEach(r => {
        startingBalance *= (1 + (r.pnl_percent || 0) / 100);
      });
    }

    // Build growth data using compound calculation
    let currentBalance = startingBalance;
    return filteredReports.map(report => {
      currentBalance *= (1 + (report.pnl_percent || 0) / 100);
      return {
        date: report.date,
        balance: Math.round(currentBalance),
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

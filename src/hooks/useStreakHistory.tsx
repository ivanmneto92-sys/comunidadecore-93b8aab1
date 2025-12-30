import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface StreakRecord {
  startDate: string;
  endDate: string;
  days: number;
  totalPnl: number;
}

export function useStreakHistory() {
  const { data, isLoading } = useQuery({
    queryKey: ['streak-history'],
    queryFn: async () => {
      // Fetch all reports ordered by date
      const { data: reports, error } = await supabase
        .from('reports_daily')
        .select('date, pnl_percent')
        .order('date', { ascending: true });

      if (error) {
        console.error('Error fetching streak history:', error);
        return { streaks: [], bestStreak: 0, currentStreak: 0, totalPositiveDays: 0 };
      }

      if (!reports || reports.length === 0) {
        return { streaks: [], bestStreak: 0, currentStreak: 0, totalPositiveDays: 0 };
      }

      // Calculate all streaks
      const streaks: StreakRecord[] = [];
      let currentStreakStart: string | null = null;
      let currentStreakDays = 0;
      let currentStreakPnl = 0;
      let totalPositiveDays = 0;

      for (let i = 0; i < reports.length; i++) {
        const report = reports[i];
        
        if (report.pnl_percent > 0) {
          totalPositiveDays++;
          
          if (currentStreakStart === null) {
            currentStreakStart = report.date;
            currentStreakDays = 1;
            currentStreakPnl = report.pnl_percent;
          } else {
            currentStreakDays++;
            currentStreakPnl += report.pnl_percent;
          }
        } else {
          // End current streak if exists
          if (currentStreakStart && currentStreakDays >= 2) {
            streaks.push({
              startDate: currentStreakStart,
              endDate: reports[i - 1].date,
              days: currentStreakDays,
              totalPnl: currentStreakPnl,
            });
          }
          currentStreakStart = null;
          currentStreakDays = 0;
          currentStreakPnl = 0;
        }
      }

      // Add final streak if still ongoing
      if (currentStreakStart && currentStreakDays >= 2) {
        streaks.push({
          startDate: currentStreakStart,
          endDate: reports[reports.length - 1].date,
          days: currentStreakDays,
          totalPnl: currentStreakPnl,
        });
      }

      // Sort by days descending
      const sortedStreaks = streaks.sort((a, b) => b.days - a.days);
      const bestStreak = sortedStreaks.length > 0 ? sortedStreaks[0].days : 0;

      // Calculate current streak (from most recent)
      let currentStreak = 0;
      for (let i = reports.length - 1; i >= 0; i--) {
        if (reports[i].pnl_percent > 0) {
          currentStreak++;
        } else {
          break;
        }
      }

      return {
        streaks: sortedStreaks.slice(0, 10), // Top 10 streaks
        bestStreak,
        currentStreak,
        totalPositiveDays,
      };
    },
    staleTime: 5 * 60 * 1000,
  });

  return {
    streaks: data?.streaks || [],
    bestStreak: data?.bestStreak || 0,
    currentStreak: data?.currentStreak || 0,
    totalPositiveDays: data?.totalPositiveDays || 0,
    isLoading,
  };
}

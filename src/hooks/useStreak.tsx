import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStreak() {
  const { data: streakDays = 0, isLoading } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      // Fetch last 30 days of reports ordered by date desc
      const { data, error } = await supabase
        .from('reports_daily')
        .select('date, pnl_percent')
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching streak data:', error);
        return 0;
      }

      if (!data || data.length === 0) {
        return 0;
      }

      // Count consecutive positive days from most recent
      let streak = 0;
      for (const report of data) {
        if (report.pnl_percent > 0) {
          streak++;
        } else {
          // Break on first non-positive day
          break;
        }
      }

      return streak;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return { streakDays, isLoading };
}

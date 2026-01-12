import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export function useStreak() {
  const { data: streakDays = 0, isLoading, isError, refetch } = useQuery({
    queryKey: ['streak'],
    queryFn: async () => {
      // Fetch last 30 days of reports ordered by date desc (optimized select)
      const { data, error } = await supabase
        .from('reports_daily')
        .select('pnl_percent')
        .not('published_at', 'is', null)
        .order('date', { ascending: false })
        .limit(30);

      if (error) {
        console.error('Error fetching streak data:', error);
        throw error;
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
    staleTime: 10 * 60 * 1000, // 10 minutes - streak data doesn't change often
    gcTime: 30 * 60 * 1000, // Keep in garbage collection for 30 min
  });

  return { streakDays, isLoading, isError, refetch };
}

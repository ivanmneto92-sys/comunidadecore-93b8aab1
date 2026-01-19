import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';

export function useStreak() {
  const queryClient = useQueryClient();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  // Reuse the streak data from useDailyStatus cache to avoid duplicate queries
  const cachedData = queryClient.getQueryData<{ todayReport: any; positiveDays: number }>(['daily-report-with-streak', today]);
  
  const streakDays = cachedData?.positiveDays ?? 0;
  
  const refetch = () => {
    queryClient.invalidateQueries({ queryKey: ['daily-report-with-streak', today] });
  };

  return { streakDays, isLoading: false, isError: false, refetch };
}

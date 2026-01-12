import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface JournalStreakData {
  currentStreak: number;
  longestStreak: number;
  lastPositiveDate: string | null;
  isLoading: boolean;
}

export function useJournalStreak(): JournalStreakData {
  const { user } = useAuth();
  const [data, setData] = useState<JournalStreakData>({
    currentStreak: 0,
    longestStreak: 0,
    lastPositiveDate: null,
    isLoading: true,
  });

  useEffect(() => {
    const fetchStreak = async () => {
      if (!user) {
        setData(prev => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Fetch all entries ordered by date descending
        const { data: entries, error } = await supabase
          .from('user_trading_journal')
          .select('date, pnl_percent')
          .eq('user_id', user.id)
          .order('date', { ascending: false });

        if (error) throw error;

        if (!entries || entries.length === 0) {
          setData({
            currentStreak: 0,
            longestStreak: 0,
            lastPositiveDate: null,
            isLoading: false,
          });
          return;
        }

        // Calculate current streak (consecutive positive days from most recent)
        let currentStreak = 0;
        let lastPositiveDate: string | null = null;

        // Get today's date string
        const today = new Date();
        const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

        // Helper to get previous date string
        const getPreviousDate = (dateStr: string): string => {
          const date = new Date(dateStr + 'T12:00:00');
          date.setDate(date.getDate() - 1);
          return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
        };

        // Create a map for quick lookup
        const entriesMap = new Map<string, number>();
        entries.forEach(e => entriesMap.set(e.date, e.pnl_percent));

        // Start from today or the most recent entry date
        let checkDate = todayStr;
        const mostRecentEntry = entries[0]?.date;
        
        // If most recent entry is today or yesterday, start counting from there
        if (mostRecentEntry) {
          const mostRecentPnl = entriesMap.get(mostRecentEntry);
          
          // Check if the streak is still active (most recent entry is today or yesterday)
          const yesterday = getPreviousDate(todayStr);
          const isStreakActive = mostRecentEntry === todayStr || mostRecentEntry === yesterday;
          
          if (isStreakActive && mostRecentPnl !== undefined && mostRecentPnl > 0) {
            checkDate = mostRecentEntry;
            currentStreak = 1;
            lastPositiveDate = mostRecentEntry;
            
            // Count backwards
            let prevDate = getPreviousDate(checkDate);
            while (true) {
              const pnl = entriesMap.get(prevDate);
              if (pnl !== undefined && pnl > 0) {
                currentStreak++;
                prevDate = getPreviousDate(prevDate);
              } else {
                break;
              }
            }
          }
        }

        // Calculate longest streak
        let longestStreak = 0;
        let tempStreak = 0;
        
        // Sort entries by date ascending for longest streak calculation
        const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
        
        for (let i = 0; i < sortedEntries.length; i++) {
          const entry = sortedEntries[i];
          
          if (entry.pnl_percent > 0) {
            // Check if this is consecutive with previous positive day
            if (i === 0) {
              tempStreak = 1;
            } else {
              const prevEntry = sortedEntries[i - 1];
              const expectedPrev = getPreviousDate(entry.date);
              
              if (prevEntry.date === expectedPrev && prevEntry.pnl_percent > 0) {
                tempStreak++;
              } else {
                tempStreak = 1;
              }
            }
            
            longestStreak = Math.max(longestStreak, tempStreak);
          } else {
            tempStreak = 0;
          }
        }

        setData({
          currentStreak,
          longestStreak: Math.max(longestStreak, currentStreak),
          lastPositiveDate,
          isLoading: false,
        });
      } catch (err) {
        console.error('Error fetching journal streak:', err);
        setData(prev => ({ ...prev, isLoading: false }));
      }
    };

    fetchStreak();
  }, [user]);

  return data;
}

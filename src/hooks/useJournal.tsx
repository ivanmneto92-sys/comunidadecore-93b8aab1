import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface JournalEntry {
  id: string;
  user_id: string;
  date: string;
  trades_count: number;
  wins: number;
  losses: number;
  pnl_percent: number;
  notes: string | null;
  emotional_state: 'good' | 'neutral' | 'stressed' | null;
  followed_plan: boolean;
  created_at: string;
  updated_at: string;
}

export interface JournalEntryInput {
  date: string;
  trades_count: number;
  wins: number;
  losses: number;
  pnl_percent: number;
  notes?: string;
  emotional_state?: 'good' | 'neutral' | 'stressed';
  followed_plan?: boolean;
}

export interface MonthStats {
  positiveDays: number;
  negativeDays: number;
  neutralDays: number;
  totalPnL: number;
  avgWinRate: number;
  totalTrades: number;
  daysFollowedPlan: number;
}

export function useJournal(selectedMonth?: Date) {
  const { user } = useAuth();
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const currentMonth = selectedMonth || new Date();

  // Get first and last day of the month
  const getMonthRange = useCallback(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const formatDate = (d: Date) => {
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };
    
    return {
      start: formatDate(firstDay),
      end: formatDate(lastDay),
    };
  }, [currentMonth]);

  // Fetch entries for the current month
  const fetchEntries = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { start, end } = getMonthRange();
      
      const { data, error: fetchError } = await supabase
        .from('user_trading_journal')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', start)
        .lte('date', end)
        .order('date', { ascending: false });

      if (fetchError) throw fetchError;

      setEntries((data as JournalEntry[]) || []);
    } catch (err: any) {
      console.error('Error fetching journal entries:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, getMonthRange]);

  useEffect(() => {
    fetchEntries();
  }, [fetchEntries]);

  // Add or update entry (upsert)
  const saveEntry = useCallback(async (input: JournalEntryInput) => {
    if (!user) {
      toast.error('Você precisa estar logado');
      return false;
    }

    try {
      const { error: upsertError } = await supabase
        .from('user_trading_journal')
        .upsert({
          user_id: user.id,
          date: input.date,
          trades_count: input.trades_count,
          wins: input.wins,
          losses: input.losses,
          pnl_percent: input.pnl_percent,
          notes: input.notes || null,
          emotional_state: input.emotional_state || null,
          followed_plan: input.followed_plan ?? true,
        }, {
          onConflict: 'user_id,date',
        });

      if (upsertError) throw upsertError;

      toast.success('Registro salvo com sucesso!');
      await fetchEntries();
      return true;
    } catch (err: any) {
      console.error('Error saving journal entry:', err);
      toast.error('Erro ao salvar registro');
      return false;
    }
  }, [user, fetchEntries]);

  // Delete entry
  const deleteEntry = useCallback(async (id: string) => {
    if (!user) return false;

    try {
      const { error: deleteError } = await supabase
        .from('user_trading_journal')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      toast.success('Registro excluído');
      await fetchEntries();
      return true;
    } catch (err: any) {
      console.error('Error deleting journal entry:', err);
      toast.error('Erro ao excluir registro');
      return false;
    }
  }, [user, fetchEntries]);

  // Get entry by date
  const getEntryByDate = useCallback((dateStr: string): JournalEntry | undefined => {
    return entries.find(e => e.date === dateStr);
  }, [entries]);

  // Calculate month stats
  const monthStats: MonthStats = entries.reduce((acc, entry) => {
    if (entry.pnl_percent > 0) acc.positiveDays++;
    else if (entry.pnl_percent < 0) acc.negativeDays++;
    else acc.neutralDays++;

    acc.totalPnL += Number(entry.pnl_percent);
    acc.totalTrades += entry.trades_count;
    if (entry.followed_plan) acc.daysFollowedPlan++;

    return acc;
  }, {
    positiveDays: 0,
    negativeDays: 0,
    neutralDays: 0,
    totalPnL: 0,
    avgWinRate: 0,
    totalTrades: 0,
    daysFollowedPlan: 0,
  });

  // Calculate average win rate
  const totalWins = entries.reduce((acc, e) => acc + e.wins, 0);
  const totalLosses = entries.reduce((acc, e) => acc + e.losses, 0);
  const totalOperations = totalWins + totalLosses;
  monthStats.avgWinRate = totalOperations > 0 
    ? Math.round((totalWins / totalOperations) * 100) 
    : 0;

  return {
    entries,
    isLoading,
    error,
    saveEntry,
    deleteEntry,
    getEntryByDate,
    monthStats,
    refetch: fetchEntries,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface JournalSettings {
  id: string;
  user_id: string;
  initial_balance: number;
  start_date: string;
  created_at: string;
  updated_at: string;
}

export interface JournalSettingsInput {
  initial_balance: number;
  start_date: string;
}

export function useJournalSettings() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<JournalSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    if (!user) {
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('user_journal_settings' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      setSettings(data as unknown as JournalSettings | null);
    } catch (err) {
      console.error('Error fetching journal settings:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const saveSettings = useCallback(async (input: JournalSettingsInput) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('user_journal_settings' as any)
        .upsert({
          user_id: user.id,
          initial_balance: input.initial_balance,
          start_date: input.start_date,
        }, {
          onConflict: 'user_id'
        })
        .select()
        .single();

      if (error) throw error;
      
      const settings = data as unknown as JournalSettings;
      setSettings(settings);
      toast.success('Configurações salvas!');
      return settings;
    } catch (err) {
      console.error('Error saving journal settings:', err);
      toast.error('Erro ao salvar configurações');
      throw err;
    }
  }, [user]);

  return {
    settings,
    isLoading,
    saveSettings,
    refetch: fetchSettings,
  };
}

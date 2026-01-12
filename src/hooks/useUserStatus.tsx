import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type PresenceStatus = 'online' | 'idle' | 'dnd' | 'invisible';

export function useUserStatus() {
  const { user } = useAuth();
  const [currentStatus, setCurrentStatus] = useState<PresenceStatus>('online');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchStatus = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('presence_status')
        .eq('id', user.id)
        .single();

      if (!error && data?.presence_status) {
        setCurrentStatus(data.presence_status as PresenceStatus);
      }
      setLoading(false);
    };

    fetchStatus();
  }, [user]);

  const setStatus = useCallback(async (status: PresenceStatus) => {
    if (!user) return;

    const { error } = await supabase
      .from('profiles')
      .update({ presence_status: status })
      .eq('id', user.id);

    if (!error) {
      setCurrentStatus(status);
    }
  }, [user]);

  return { currentStatus, setStatus, loading };
}

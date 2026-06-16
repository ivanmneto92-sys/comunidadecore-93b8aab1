import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<Record<string, number>>({});

  const fetchUnreadCounts = useCallback(async () => {
    if (!user) {
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    try {
      // Use the optimized RPC function instead of N+1 queries
      const { data, error } = await supabase.rpc('get_unread_counts', {
        p_user_id: user.id
      });

      if (error) throw error;

      const counts: Record<string, number> = {};
      if (data) {
        for (const row of data) {
          counts[row.channel_id] = Number(row.unread_count);
        }
      }

      setUnreadCounts(counts);
    } catch (error) {
      console.error('Error fetching unread counts:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  const markAsRead = useCallback(async (channelId: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('user_channel_read_status')
        .upsert({
          user_id: user.id,
          channel_id: channelId,
          last_read_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,channel_id'
        });

      if (error) throw error;

      // Update local state
      setUnreadCounts(prev => {
        const newCounts = { ...prev };
        delete newCounts[channelId];
        return newCounts;
      });
    } catch (error) {
      console.error('Error marking channel as read:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchUnreadCounts();
  }, [fetchUnreadCounts]);

  // Debounced batch update for realtime messages
  const flushPendingUpdates = useCallback(() => {
    if (Object.keys(pendingUpdatesRef.current).length === 0) return;
    
    setUnreadCounts(prev => {
      const newCounts = { ...prev };
      for (const [channelId, count] of Object.entries(pendingUpdatesRef.current)) {
        newCounts[channelId] = (newCounts[channelId] || 0) + count;
      }
      return newCounts;
    });
    
    pendingUpdatesRef.current = {};
  }, []);

  // Listen for new messages in realtime with debounce
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('unread-messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new as { channel_id: string; user_id: string; parent_id: string | null };
          
          // Don't count own messages or replies
          if (message.user_id === user.id || message.parent_id) return;

          // Batch updates with debounce (500ms)
          pendingUpdatesRef.current[message.channel_id] = 
            (pendingUpdatesRef.current[message.channel_id] || 0) + 1;

          if (debounceTimerRef.current) {
            clearTimeout(debounceTimerRef.current);
          }
          
          debounceTimerRef.current = setTimeout(flushPendingUpdates, 500);
        }
      )
      .subscribe();

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      supabase.removeChannel(channel);
    };
  }, [user, flushPendingUpdates]);

  const totalUnread = useMemo(() => 
    Object.values(unreadCounts).reduce((acc, count) => acc + count, 0),
    [unreadCounts]
  );

  return {
    unreadCounts,
    totalUnread,
    loading,
    markAsRead,
    refetch: fetchUnreadCounts,
  };
}

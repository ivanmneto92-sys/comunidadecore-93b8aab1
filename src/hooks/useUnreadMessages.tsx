import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export function useUnreadMessages() {
  const { user } = useAuth();
  const userId = user?.id;
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pendingUpdatesRef = useRef<Record<string, number>>({});
  const channelSequenceRef = useRef(0);

  const fetchUnreadCounts = useCallback(async () => {
    if (!userId) {
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    try {
      // Use the optimized RPC function instead of N+1 queries
      const { data, error } = await supabase.rpc('get_unread_counts', {
        p_user_id: userId
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
  }, [userId]);

  const markAsRead = useCallback(async (channelId: string) => {
    if (!userId) return;

    try {
      const { error } = await supabase
        .from('user_channel_read_status')
        .upsert({
          user_id: userId,
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
  }, [userId]);

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
    if (!userId) return;

    let cancelled = false;
    const channelName = `unread-messages-${userId}-${Date.now()}-${channelSequenceRef.current++}`;

    // Build the channel + register listeners BEFORE subscribing, all in one chain
    const channel = supabase
      .channel(channelName)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
        },
        (payload) => {
          const message = payload.new as { channel_id: string; user_id: string; parent_id: string | null };
          if (message.user_id === userId || message.parent_id) return;

          pendingUpdatesRef.current[message.channel_id] =
            (pendingUpdatesRef.current[message.channel_id] || 0) + 1;

          if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
          debounceTimerRef.current = setTimeout(flushPendingUpdates, 500);
        }
      );

    // Defer subscribe to the next tick so StrictMode's synchronous mount/cleanup/mount
    // cycle cannot leave a half-subscribed channel that rejects further .on() calls.
    queueMicrotask(() => {
      if (cancelled) return;
      channel.subscribe();
    });

    return () => {
      cancelled = true;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
    };
  }, [userId, flushPendingUpdates]);


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

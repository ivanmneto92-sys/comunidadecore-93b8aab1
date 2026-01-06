import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UnreadCount {
  channelId: string;
  count: number;
}

export function useUnreadMessages() {
  const { user } = useAuth();
  const [unreadCounts, setUnreadCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  const fetchUnreadCounts = useCallback(async () => {
    if (!user) {
      setUnreadCounts({});
      setLoading(false);
      return;
    }

    try {
      // Buscar todos os canais
      const { data: channels } = await supabase
        .from('channels')
        .select('id');

      if (!channels) return;

      // Buscar status de leitura do usuário
      const { data: readStatus } = await supabase
        .from('user_channel_read_status')
        .select('channel_id, last_read_at')
        .eq('user_id', user.id);

      const readMap = new Map(
        readStatus?.map(r => [r.channel_id, new Date(r.last_read_at)]) || []
      );

      // Contar mensagens não lidas por canal
      const counts: Record<string, number> = {};

      for (const channel of channels) {
        const lastRead = readMap.get(channel.id);
        
        let query = supabase
          .from('messages')
          .select('id', { count: 'exact', head: true })
          .eq('channel_id', channel.id)
          .is('parent_id', null);

        if (lastRead) {
          query = query.gt('created_at', lastRead.toISOString());
        }

        const { count } = await query;
        
        if (count && count > 0) {
          counts[channel.id] = count;
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

      // Atualizar estado local
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

  // Escutar novas mensagens em tempo real
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
          
          // Não contar mensagens do próprio usuário ou replies
          if (message.user_id === user.id || message.parent_id) return;

          setUnreadCounts(prev => ({
            ...prev,
            [message.channel_id]: (prev[message.channel_id] || 0) + 1
          }));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const totalUnread = Object.values(unreadCounts).reduce((acc, count) => acc + count, 0);

  return {
    unreadCounts,
    totalUnread,
    loading,
    markAsRead,
    refetch: fetchUnreadCounts,
  };
}

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface PresenceState {
  user_id: string;
  display_name: string;
  avatar_url: string | null;
  online_at: string;
}

export function useOnlinePresence(channelId: string | null) {
  const { user } = useAuth();
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);
  const [onlineCount, setOnlineCount] = useState(0);

  useEffect(() => {
    if (!channelId || !user) return;

    const channel = supabase.channel(`presence:${channelId}`);

    // Track presence state changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as unknown as PresenceState[];
        setOnlineUsers(users);
        setOnlineCount(users.length);
      })
      .on('presence', { event: 'join' }, ({ newPresences }) => {
        const newUsers = newPresences as unknown as PresenceState[];
        setOnlineUsers(prev => [...prev, ...newUsers]);
        setOnlineCount(prev => prev + newUsers.length);
      })
      .on('presence', { event: 'leave' }, ({ leftPresences }) => {
        const leftUsers = leftPresences as unknown as PresenceState[];
        const leftIds = leftUsers.map(p => p.user_id);
        setOnlineUsers(prev => prev.filter(u => !leftIds.includes(u.user_id)));
        setOnlineCount(prev => Math.max(0, prev - leftUsers.length));
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        // Get user profile for presence data
        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        // Track this user's presence
        await channel.track({
          user_id: user.id,
          display_name: profile?.display_name || 'Usuário',
          avatar_url: profile?.avatar_url,
          online_at: new Date().toISOString(),
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, user]);

  return { onlineUsers, onlineCount };
}

// Global community presence (for all channels)
export function useCommunityPresence() {
  const { user } = useAuth();
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState<PresenceState[]>([]);

  useEffect(() => {
    if (!user) return;

    const channel = supabase.channel('presence:community');

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users = Object.values(state).flat() as unknown as PresenceState[];
        // Remove duplicates by user_id
        const uniqueUsers = users.filter((u, i, self) => 
          i === self.findIndex(t => t.user_id === u.user_id)
        );
        setOnlineUsers(uniqueUsers);
        setOnlineCount(uniqueUsers.length);
      })
      .subscribe(async (status) => {
        if (status !== 'SUBSCRIBED') return;

        const { data: profile } = await supabase
          .from('profiles')
          .select('display_name, avatar_url')
          .eq('id', user.id)
          .maybeSingle();

        await channel.track({
          user_id: user.id,
          display_name: profile?.display_name || 'Usuário',
          avatar_url: profile?.avatar_url,
          online_at: new Date().toISOString(),
        });
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return { onlineCount, onlineUsers };
}

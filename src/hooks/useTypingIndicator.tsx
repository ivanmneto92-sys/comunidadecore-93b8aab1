import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  userId: string;
  displayName: string;
}

export function useTypingIndicator(channelId: string) {
  const { user } = useAuth();
  const userId = user?.id;
  const displayName = user?.user_metadata?.display_name || 'Usuário';
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const isSubscribedRef = useRef(false);

  useEffect(() => {
    if (!channelId || !userId) return;

    let isActive = true;
    const topic = `typing:${channelId}`;

    const setupChannel = async () => {
      // Supabase reuses channels by topic. Remove stale instances first so StrictMode/HMR
      // cannot return a channel that's already joining/subscribed before we add listeners.
      const staleChannels = supabase.getChannels().filter((channel) => channel.topic === `realtime:${topic}`);
      if (staleChannels.length > 0) {
        await Promise.all(staleChannels.map((channel) => supabase.removeChannel(channel)));
      }

      if (!isActive) return;

      const channel = supabase.channel(topic, {
        config: { presence: { key: userId } },
      });
      channelRef.current = channel;

      channel.on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.userId !== userId && presence.isTyping) {
              users.push({
                userId: presence.userId,
                displayName: presence.displayName,
              });
            }
          });
        });
        
        setTypingUsers(users);
      });

      channel.subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          isSubscribedRef.current = true;
          // Track initial presence
          await channel.track({
            userId,
            displayName,
            isTyping: false,
          });
        }
      });
    };

    setupChannel();

    return () => {
      isActive = false;
      isSubscribedRef.current = false;
      setTypingUsers([]);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      const channel = channelRef.current;
      channelRef.current = null;
      if (channel) supabase.removeChannel(channel);
    };
  }, [channelId, userId, displayName]);

  const startTyping = useCallback(async () => {
    if (!channelRef.current || !isSubscribedRef.current || !userId) return;

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Atualizar presença para "digitando"
    await channelRef.current.track({
      userId,
      displayName,
      isTyping: true,
    });

    // Auto-parar após 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [userId, displayName]);

  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !isSubscribedRef.current || !userId) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({
      userId,
      displayName,
      isTyping: false,
    });
  }, [userId, displayName]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}

import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface TypingUser {
  userId: string;
  displayName: string;
}

export function useTypingIndicator(channelId: string) {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    if (!channelId || !user) return;

    const channel = supabase.channel(`typing:${channelId}`);
    channelRef.current = channel;

    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const users: TypingUser[] = [];
        
        Object.values(state).forEach((presences: any[]) => {
          presences.forEach((presence) => {
            if (presence.userId !== user.id && presence.isTyping) {
              users.push({
                userId: presence.userId,
                displayName: presence.displayName,
              });
            }
          });
        });
        
        setTypingUsers(users);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Track initial presence
          await channel.track({
            userId: user.id,
            displayName: user.user_metadata?.display_name || 'Usuário',
            isTyping: false,
          });
        }
      });

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [channelId, user]);

  const startTyping = useCallback(async () => {
    if (!channelRef.current || !user) return;

    // Limpar timeout anterior
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Atualizar presença para "digitando"
    await channelRef.current.track({
      userId: user.id,
      displayName: user.user_metadata?.display_name || 'Usuário',
      isTyping: true,
    });

    // Auto-parar após 3 segundos
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 3000);
  }, [user]);

  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !user) return;

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    await channelRef.current.track({
      userId: user.id,
      displayName: user.user_metadata?.display_name || 'Usuário',
      isTyping: false,
    });
  }, [user]);

  return {
    typingUsers,
    startTyping,
    stopTyping,
  };
}

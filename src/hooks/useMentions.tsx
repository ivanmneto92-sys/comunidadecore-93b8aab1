import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface MentionUser {
  id: string;
  display_name: string;
  username: string | null;
  avatar_url: string | null;
  isOnline: boolean;
}

export function useMentions(query: string, onlineUserIds: string[] = []) {
  const { user } = useAuth();
  const [users, setUsers] = useState<MentionUser[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      if (query.length === 0) {
        // Show online users when no query
        if (onlineUserIds.length > 0) {
          setLoading(true);
          const { data } = await supabase
            .from('profiles')
            .select('id, display_name, username, avatar_url')
            .in('id', onlineUserIds)
            .neq('id', user?.id || '')
            .limit(8);

          if (data) {
            setUsers(
              data.map(u => ({
                ...u,
                display_name: u.display_name || u.username || 'Usuário',
                isOnline: true,
              }))
            );
          }
          setLoading(false);
        } else {
          setUsers([]);
        }
        return;
      }

      setLoading(true);
      const searchQuery = `%${query}%`;

      const { data } = await supabase
        .from('profiles')
        .select('id, display_name, username, avatar_url')
        .or(`display_name.ilike.${searchQuery},username.ilike.${searchQuery}`)
        .neq('id', user?.id || '')
        .limit(8);

      if (data) {
        // Sort: online users first
        const sorted = data
          .map(u => ({
            ...u,
            display_name: u.display_name || u.username || 'Usuário',
            isOnline: onlineUserIds.includes(u.id),
          }))
          .sort((a, b) => {
            if (a.isOnline && !b.isOnline) return -1;
            if (!a.isOnline && b.isOnline) return 1;
            return 0;
          });

        setUsers(sorted);
      }
      setLoading(false);
    };

    const debounce = setTimeout(fetchUsers, 150);
    return () => clearTimeout(debounce);
  }, [query, onlineUserIds, user?.id]);

  return { users, loading };
}

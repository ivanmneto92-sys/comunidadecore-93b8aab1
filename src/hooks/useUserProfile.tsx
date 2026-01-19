import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type MembershipTier = 'free' | 'plus' | 'elite';
export type AppRole = 'admin' | 'moderator' | 'user';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
  avatar_id: string | null;
  bio: string | null;
  created_at: string;
}

interface UserRole {
  role: AppRole;
}

interface Membership {
  tier: MembershipTier;
  expires_at: string | null;
}

interface UserProfileData {
  profile: Profile | null;
  roles: AppRole[];
  membership: MembershipTier;
  isAdmin: boolean;
  isModerator: boolean;
  loading: boolean;
  error: Error | null;
}

export function useUserProfile(): UserProfileData & { refetch: () => void } {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user) return null;

      // Fetch all user data in parallel for speed
      const [profileResult, rolesResult, membershipResult] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('user_roles').select('role').eq('user_id', user.id),
        supabase.from('memberships').select('tier, expires_at').eq('user_id', user.id).single(),
      ]);

      return {
        profile: profileResult.data as Profile | null,
        roles: ((rolesResult.data as UserRole[]) || []).map(r => r.role),
        membership: (membershipResult.data as Membership)?.tier || 'free',
      };
    },
    enabled: !authLoading && !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data rarely changes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
  });

  // Handle case when user logs out
  if (!user && !authLoading) {
    return {
      profile: null,
      roles: [],
      membership: 'free',
      isAdmin: false,
      isModerator: false,
      loading: false,
      error: null,
      refetch: () => queryClient.invalidateQueries({ queryKey: ['user-profile'] }),
    };
  }

  const roles = data?.roles || [];

  return {
    profile: data?.profile || null,
    roles,
    membership: data?.membership || 'free',
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    loading: authLoading || isLoading,
    error: error instanceof Error ? error : null,
    refetch: () => refetch(),
  };
}

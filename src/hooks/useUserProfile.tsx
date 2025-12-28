import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type MembershipTier = 'free' | 'plus' | 'elite';
export type AppRole = 'admin' | 'moderator' | 'user';

interface Profile {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_url: string | null;
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
}

export function useUserProfile(): UserProfileData {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<AppRole[]>([]);
  const [membership, setMembership] = useState<MembershipTier>('free');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setRoles([]);
      setMembership('free');
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Fetch profile
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        setProfile(profileData);

        // Fetch roles
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);
        
        setRoles((rolesData as UserRole[] || []).map(r => r.role));

        // Fetch membership
        const { data: membershipData } = await supabase
          .from('memberships')
          .select('tier, expires_at')
          .eq('user_id', user.id)
          .single();
        
        if (membershipData) {
          setMembership((membershipData as Membership).tier);
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [user]);

  return {
    profile,
    roles,
    membership,
    isAdmin: roles.includes('admin'),
    isModerator: roles.includes('moderator'),
    loading
  };
}

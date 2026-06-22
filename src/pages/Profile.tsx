import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { ProfileHero } from '@/components/profile/ProfileHero';
import { ProfileMenuList } from '@/components/profile/ProfileMenuList';
import { EditProfileModal } from '@/components/profile/EditProfileModal';
import { AvatarSelectorModal } from '@/components/profile/AvatarSelectorModal';
import { useAuth } from '@/hooks/useAuth';
import { useUserProfile } from '@/hooks/useUserProfile';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function Profile() {
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, roles, membership, loading: profileLoading, refetch } = useUserProfile();
  
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [affiliateBalance, setAffiliateBalance] = useState(0);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchAffiliateBalance();
    }
  }, [user]);

  const fetchAffiliateBalance = async () => {
    if (!user) return;
    
    try {
      const { data } = await supabase
        .from('affiliates')
        .select('available_balance')
        .eq('user_id', user.id)
        .single();
      
      if (data) {
        setAffiliateBalance(data.available_balance);
      }
    } catch (error) {
      // User might not be an affiliate
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Até logo!');
      navigate('/auth');
    } catch (error) {
      toast.error('Erro ao sair');
    }
  };

  const handleProfileUpdated = () => {
    refetch?.();
  };

  if (authLoading || profileLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <div className="flex flex-col items-center pt-8">
            <Skeleton className="w-28 h-28 rounded-full" />
            <Skeleton className="h-6 w-40 mt-4" />
            <Skeleton className="h-4 w-24 mt-2" />
          </div>
          <Skeleton className="h-48 w-full rounded-xl mt-8" />
          <Skeleton className="h-32 w-full rounded-xl" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-full pb-24">
        <ProfileHero
          profile={profile}
          tier={membership}
          roles={roles}
          onEditClick={() => setShowEditModal(true)}
          onAvatarClick={() => setShowAvatarModal(true)}
        />

        <ProfileMenuList
          affiliateBalance={affiliateBalance}
          onEditProfile={() => setShowEditModal(true)}
          onChangeAvatar={() => setShowAvatarModal(true)}
          onSignOut={handleSignOut}
        />

        <EditProfileModal
          open={showEditModal}
          onOpenChange={setShowEditModal}
          profile={profile}
          userEmail={user?.email}
          onProfileUpdated={handleProfileUpdated}
        />

        {profile && (
          <AvatarSelectorModal
            open={showAvatarModal}
            onOpenChange={setShowAvatarModal}
            currentAvatarId={profile.avatar_id}
            currentAvatarUrl={profile.avatar_url}
            userId={profile.id}
            onAvatarUpdated={handleProfileUpdated}
          />
        )}
      </div>
    </AppLayout>
  );
}

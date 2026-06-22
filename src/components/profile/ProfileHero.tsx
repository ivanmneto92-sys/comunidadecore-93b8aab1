import { useAvatar, renderAvatar } from '@/hooks/useAvatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Camera, Edit3, Shield, Crown, Star } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MembershipTier, AppRole } from '@/hooks/useUserProfile';
import { StatusSelector, StatusIndicator } from '@/components/community/StatusSelector';
import { useUserStatus } from '@/hooks/useUserStatus';

interface ProfileHeroProps {
  profile: {
    id: string;
    username: string | null;
    display_name: string | null;
    avatar_url: string | null;
    avatar_id: string | null;
    created_at: string;
  } | null;
  tier: MembershipTier;
  roles: AppRole[];
  onEditClick: () => void;
  onAvatarClick: () => void;
}

const tierConfig = {
  free: { label: 'Free', color: 'bg-muted text-muted-foreground', icon: null },
  plus: { label: 'Plus', color: 'bg-primary/20 text-primary', icon: Star },
  elite: { label: 'Elite', color: 'bg-gradient-to-r from-primary to-amber-400 text-background', icon: Crown },
};

const statusLabels = {
  online: 'Online',
  idle: 'Ausente',
  dnd: 'Não Perturbe',
  invisible: 'Invisível',
};

export function ProfileHero({ profile, tier, roles, onEditClick, onAvatarClick }: ProfileHeroProps) {
  const displayName = profile?.display_name || profile?.username || 'Usuário';
  const avatarResult = useAvatar(profile?.avatar_id, displayName, profile?.avatar_url);
  const { currentStatus } = useUserStatus();
  
  const isAdmin = roles.includes('admin');
  const isModerator = roles.includes('moderator');
  const tierInfo = tierConfig[tier];
  const TierIcon = tierInfo.icon;

  const memberSince = profile?.created_at 
    ? format(new Date(profile.created_at), "MMM 'de' yyyy", { locale: ptBR })
    : '';

  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent" />
      
      {/* Content */}
      <div className="relative px-4 pt-8 pb-6 flex flex-col items-center animate-fade-in">
        {/* Avatar with gradient border */}
        <button 
          onClick={onAvatarClick}
          className="relative group mb-4"
        >
          <div className="absolute -inset-1 bg-gradient-to-r from-primary via-amber-400 to-primary rounded-full opacity-75 blur-sm group-hover:opacity-100 transition-opacity" />
          <div className="relative w-28 h-28 rounded-full overflow-hidden border-4 border-background">
            {renderAvatar(avatarResult, 'w-full h-full object-cover')}
          </div>
          <div className="absolute bottom-0 right-0 p-2 bg-primary rounded-full shadow-lg group-hover:scale-110 transition-transform">
            <Camera className="w-4 h-4 text-primary-foreground" />
          </div>
        </button>

        {/* Name and username */}
        <h1 className="text-xl font-bold text-foreground mb-1">
          {displayName}
        </h1>
        
        <div className="flex items-center gap-2 mb-3">
          {profile?.username && (
            <span className="text-sm text-muted-foreground">@{profile.username}</span>
          )}
          
          {/* Tier badge */}
          <Badge className={`${tierInfo.color} border-0 flex items-center gap-1`}>
            {TierIcon && <TierIcon className="w-3 h-3" />}
            {tierInfo.label}
          </Badge>
        </div>

        {/* Status Selector */}
        <StatusSelector align="center">
          <Button variant="ghost" size="sm" className="gap-2 mb-3">
            <StatusIndicator status={currentStatus} size="md" />
            <span className="text-sm">{statusLabels[currentStatus]}</span>
          </Button>
        </StatusSelector>

        {/* Role badges */}
        {(isAdmin || isModerator) && (
          <div className="flex gap-2 mb-3">
            {isAdmin && (
              <Badge variant="outline" className="border-red-500/50 text-red-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Admin
              </Badge>
            )}
            {isModerator && !isAdmin && (
              <Badge variant="outline" className="border-blue-500/50 text-blue-500 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Moderador
              </Badge>
            )}
          </div>
        )}

        {/* Member since */}
        <p className="text-xs text-muted-foreground mb-4">
          Membro desde {memberSince}
        </p>

        {/* Action button */}
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onEditClick}
          className="gap-2"
        >
          <Edit3 className="w-4 h-4" />
          Editar Perfil
        </Button>
      </div>
    </div>
  );
}

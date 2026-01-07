import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/hooks/useUserProfile';
import { Flame, Bell } from 'lucide-react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { getAvatarById } from '@/lib/avatarLibrary';
import { cn } from '@/lib/utils';

interface PersonalizedHeaderProps {
  streakDays?: number;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Bom dia';
  if (hour < 18) return 'Boa tarde';
  return 'Boa noite';
}

export function PersonalizedHeader({ streakDays = 0 }: PersonalizedHeaderProps) {
  const { user } = useAuth();
  const { profile } = useUserProfile();
  const navigate = useNavigate();
  
  const displayName = profile?.display_name 
    || user?.user_metadata?.display_name 
    || user?.email?.split('@')[0] 
    || 'Trader';

  const greeting = getGreeting();

  // Get avatar from library
  const avatarData = profile?.avatar_id ? getAvatarById(profile.avatar_id) : null;
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center justify-between gap-3">
      {/* Left: Avatar + Greeting */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <button
          onClick={() => navigate('/profile')}
          className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background rounded-full"
        >
          <Avatar className="h-12 w-12 border-2 border-primary/30 hover:border-primary/60 transition-colors">
            {avatarData ? (
              <div 
                className="w-full h-full"
                dangerouslySetInnerHTML={{ __html: avatarData.svg }} 
              />
            ) : (
              <AvatarFallback className="bg-primary/20 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            )}
          </Avatar>
        </button>
        <div className="flex flex-col min-w-0">
          <span className="text-xs text-muted-foreground">{greeting},</span>
          <span className="text-lg font-bold text-foreground truncate">
            {displayName}
          </span>
        </div>
      </div>

      {/* Right: Notifications + Streak */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Notification Bell */}
        <button
          onClick={() => navigate('/community')}
          className="relative p-2 rounded-full bg-secondary/50 hover:bg-secondary/80 transition-colors"
        >
          <Bell className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Streak Badge */}
        <button
          onClick={() => navigate('/streaks')}
          className={cn(
            'flex items-center gap-1.5 px-3 py-2 rounded-full',
            'bg-gradient-to-r from-primary/20 to-primary/10',
            'border border-primary/30 hover:border-primary/50',
            'transition-all duration-200'
          )}
        >
          <Flame className="w-4 h-4 text-primary" />
          <span className="text-sm font-bold text-primary">{streakDays}</span>
        </button>
      </div>
    </div>
  );
}

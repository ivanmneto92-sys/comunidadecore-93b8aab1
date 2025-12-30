import { useAuth } from '@/hooks/useAuth';
import { Flame } from 'lucide-react';
import logoCore from '@/assets/logo-core.png';

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
  
  // Get display name from user metadata or email
  const displayName = user?.user_metadata?.display_name 
    || user?.email?.split('@')[0] 
    || 'Trader';

  const greeting = getGreeting();

  return (
    <div className="flex items-center justify-between">
      {/* Left: Logo + Greeting */}
      <div className="flex items-center gap-3">
        <img src={logoCore} alt="CORE" className="h-8 w-auto" />
        <div className="flex flex-col">
          <span className="text-sm text-muted-foreground">{greeting},</span>
          <span className="text-base font-semibold text-foreground capitalize">
            {displayName} 👋
          </span>
        </div>
      </div>

      {/* Right: Streak Badge */}
      {streakDays > 0 && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20">
          <Flame className="w-4 h-4 text-primary animate-pulse" />
          <span className="text-sm font-semibold text-primary">{streakDays}</span>
          <span className="text-xs text-primary/70">dias</span>
        </div>
      )}
    </div>
  );
}

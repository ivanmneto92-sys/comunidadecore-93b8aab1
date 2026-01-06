import { User, Shield, Crown, Star, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProfileStatusCardProps {
  tier: 'free' | 'plus' | 'elite';
  isAdmin: boolean;
  isModerator: boolean;
  memberSince: string;
  displayName?: string | null;
}

const tierConfig = {
  free: {
    label: 'Free',
    icon: User,
    gradient: 'from-muted to-muted/60',
    glow: 'shadow-muted/20',
    badgeVariant: 'secondary' as const,
  },
  plus: {
    label: 'Plus',
    icon: Star,
    gradient: 'from-primary to-primary/60',
    glow: 'shadow-primary/30',
    badgeVariant: 'default' as const,
  },
  elite: {
    label: 'Elite',
    icon: Crown,
    gradient: 'from-amber-500 to-amber-600',
    glow: 'shadow-amber-500/30',
    badgeVariant: 'default' as const,
  },
};

export function ProfileStatusCard({
  tier,
  isAdmin,
  isModerator,
  memberSince,
  displayName,
}: ProfileStatusCardProps) {
  const config = tierConfig[tier];
  const TierIcon = config.icon;

  return (
    <Card className={`overflow-hidden border-border/50 shadow-lg ${config.glow}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Tier Icon with Glow */}
          <div className="relative">
            <div
              className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center shadow-lg`}
            >
              <TierIcon className="w-10 h-10 text-background" />
            </div>
            {tier !== 'free' && (
              <div
                className={`absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-gradient-to-br ${config.gradient} flex items-center justify-center ring-2 ring-background`}
              >
                <span className="text-xs font-bold text-background">
                  {tier === 'plus' ? '+' : '★'}
                </span>
              </div>
            )}
          </div>

          {/* User Info */}
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">
                {displayName || 'Usuário'}
              </h2>
              <Badge variant={config.badgeVariant} className="text-xs">
                {config.label}
              </Badge>
              {isAdmin && (
                <Badge variant="destructive" className="text-xs">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
              {isModerator && !isAdmin && (
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  <Shield className="w-3 h-3 mr-1" />
                  Mod
                </Badge>
              )}
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>
                Membro desde{' '}
                {format(new Date(memberSince), "MMMM 'de' yyyy", { locale: ptBR })}
              </span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

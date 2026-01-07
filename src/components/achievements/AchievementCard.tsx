import { Lock, Check } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { rarityColors } from '@/lib/achievementDefinitions';
import { cn } from '@/lib/utils';

interface AchievementCardProps {
  name: string;
  description: string;
  icon: string;
  rarity: string;
  xpReward: number;
  isUnlocked: boolean;
  progress: { current: number; target: number };
  onClick?: () => void;
}

export function AchievementCard({
  name,
  description,
  icon,
  rarity,
  xpReward,
  isUnlocked,
  progress,
  onClick,
}: AchievementCardProps) {
  const colors = rarityColors[rarity] || rarityColors.common;
  const progressPercent = Math.min((progress.current / progress.target) * 100, 100);

  return (
    <Card
      className={cn(
        'relative overflow-hidden transition-all cursor-pointer hover:scale-[1.02]',
        isUnlocked
          ? `${colors.border} border-2`
          : 'border-border/50 opacity-70 hover:opacity-90'
      )}
      onClick={onClick}
    >
      {isUnlocked && (
        <div className="absolute top-2 right-2">
          <div className="p-1 rounded-full bg-green-500/20">
            <Check className="h-3 w-3 text-green-500" />
          </div>
        </div>
      )}

      <CardContent className="pt-4 pb-4">
        <div className="text-center space-y-2">
          {/* Icon */}
          <div
            className={cn(
              'mx-auto w-14 h-14 rounded-xl flex items-center justify-center text-2xl',
              isUnlocked ? colors.bg : 'bg-muted'
            )}
          >
            {isUnlocked ? icon : <Lock className="h-5 w-5 text-muted-foreground" />}
          </div>

          {/* Name */}
          <h3 className={cn(
            'font-semibold text-sm line-clamp-1',
            isUnlocked ? 'text-foreground' : 'text-muted-foreground'
          )}>
            {name}
          </h3>

          {/* Rarity Badge */}
          <Badge variant="outline" className={cn('text-xs', colors.text, colors.bg)}>
            +{xpReward} XP
          </Badge>

          {/* Progress or Status */}
          {!isUnlocked && (
            <div className="pt-1 space-y-1">
              <Progress value={progressPercent} className="h-1.5" />
              <p className="text-xs text-muted-foreground">
                {progress.current}/{progress.target}
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

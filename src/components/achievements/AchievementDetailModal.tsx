import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Check, Lock, Sparkles } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { rarityColors, categoryLabels } from '@/lib/achievementDefinitions';
import { cn } from '@/lib/utils';

interface AchievementDetailModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  achievement: {
    name: string;
    description: string;
    icon: string;
    category: string;
    rarity: string;
    xpReward: number;
    isUnlocked: boolean;
    unlockedAt: string | null;
    progress: { current: number; target: number };
  } | null;
}

const rarityLabels: Record<string, string> = {
  common: 'Comum',
  rare: 'Raro',
  epic: 'Épico',
  legendary: 'Lendário',
};

export function AchievementDetailModal({
  open,
  onOpenChange,
  achievement,
}: AchievementDetailModalProps) {
  if (!achievement) return null;

  const colors = rarityColors[achievement.rarity] || rarityColors.common;
  const progressPercent = Math.min(
    (achievement.progress.current / achievement.progress.target) * 100,
    100
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-auto max-h-[85vh] rounded-t-3xl">
        <SheetHeader className="text-center pb-2">
          <SheetTitle className="sr-only">{achievement.name}</SheetTitle>
        </SheetHeader>

        <div className="space-y-6 pb-6">
          {/* Icon */}
          <div className="flex justify-center">
            <div
              className={cn(
                'w-24 h-24 rounded-2xl flex items-center justify-center text-5xl',
                achievement.isUnlocked ? colors.bg : 'bg-muted'
              )}
            >
              {achievement.isUnlocked ? (
                achievement.icon
              ) : (
                <Lock className="h-10 w-10 text-muted-foreground" />
              )}
            </div>
          </div>

          {/* Name and status */}
          <div className="text-center space-y-2">
            <h2 className="text-xl font-bold">{achievement.name}</h2>
            <p className="text-muted-foreground">{achievement.description}</p>

            <div className="flex justify-center gap-2">
              <Badge variant="outline" className={cn(colors.text, colors.bg)}>
                {rarityLabels[achievement.rarity]}
              </Badge>
              <Badge variant="outline">
                {categoryLabels[achievement.category]}
              </Badge>
            </div>
          </div>

          {/* XP Reward */}
          <div className="flex items-center justify-center gap-2 py-3 bg-primary/10 rounded-xl">
            <Sparkles className="h-5 w-5 text-primary" />
            <span className="font-semibold text-primary">+{achievement.xpReward} XP</span>
          </div>

          {/* Status */}
          {achievement.isUnlocked ? (
            <div className="flex items-center justify-center gap-3 py-4 bg-green-500/10 rounded-xl">
              <div className="p-2 rounded-full bg-green-500/20">
                <Check className="h-5 w-5 text-green-500" />
              </div>
              <div className="text-center">
                <p className="font-semibold text-green-500">Conquistado!</p>
                {achievement.unlockedAt && (
                  <p className="text-xs text-muted-foreground">
                    em {format(new Date(achievement.unlockedAt), "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3 py-4 px-4 bg-muted/50 rounded-xl">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progresso</span>
                <span className="font-medium">
                  {achievement.progress.current}/{achievement.progress.target}
                </span>
              </div>
              <Progress value={progressPercent} className="h-2" />
              <p className="text-xs text-center text-muted-foreground">
                Faltam {achievement.progress.target - achievement.progress.current} para desbloquear
              </p>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

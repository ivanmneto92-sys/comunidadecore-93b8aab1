import { Trophy, Sparkles } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface AchievementProgressCardProps {
  unlockedCount: number;
  totalCount: number;
  percentage: number;
  totalXpEarned: number;
}

export function AchievementProgressCard({
  unlockedCount,
  totalCount,
  percentage,
  totalXpEarned,
}: AchievementProgressCardProps) {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-background to-accent/5 border-primary/20">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/20">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Conquistas Desbloqueadas</p>
              <p className="text-2xl font-bold">
                {unlockedCount}
                <span className="text-muted-foreground text-lg font-normal">/{totalCount}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-1 text-primary">
              <Sparkles className="h-4 w-4" />
              <span className="font-semibold">+{totalXpEarned} XP</span>
            </div>
            <p className="text-xs text-muted-foreground">ganhos com conquistas</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium">{percentage}%</span>
          </div>
          <Progress value={percentage} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}

import { Flame, Trophy } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface JournalStreakCardProps {
  currentStreak: number;
  longestStreak: number;
  isLoading?: boolean;
}

export function JournalStreakCard({ 
  currentStreak, 
  longestStreak,
  isLoading 
}: JournalStreakCardProps) {
  const hasActiveStreak = currentStreak > 0;
  const isNewRecord = currentStreak > 0 && currentStreak >= longestStreak;

  if (isLoading) {
    return (
      <Card className="p-4 animate-pulse">
        <div className="h-16 bg-muted rounded" />
      </Card>
    );
  }

  return (
    <Card className={cn(
      "p-4 transition-all",
      hasActiveStreak && "bg-gradient-to-br from-warning/10 via-warning/5 to-transparent border-warning/30"
    )}>
      <div className="flex items-center justify-between">
        {/* Current Streak */}
        <div className="flex items-center gap-3">
          <div className={cn(
            "p-2 rounded-xl",
            hasActiveStreak ? "bg-warning/20" : "bg-muted"
          )}>
            <Flame className={cn(
              "h-6 w-6",
              hasActiveStreak ? "text-warning" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Dias Positivos</p>
            <div className="flex items-baseline gap-1">
              <span className={cn(
                "text-2xl font-bold",
                hasActiveStreak ? "text-warning" : "text-muted-foreground"
              )}>
                {currentStreak}
              </span>
              <span className="text-xs text-muted-foreground">
                {currentStreak === 1 ? 'dia' : 'dias'}
              </span>
            </div>
            {isNewRecord && currentStreak > 1 && (
              <p className="text-[10px] text-warning font-medium animate-pulse">
                🎉 Novo recorde!
              </p>
            )}
          </div>
        </div>

        {/* Longest Streak */}
        <div className="flex items-center gap-2 text-right">
          <div>
            <p className="text-xs text-muted-foreground">Recorde</p>
            <div className="flex items-baseline gap-1 justify-end">
              <span className="text-lg font-semibold text-foreground">
                {longestStreak}
              </span>
              <span className="text-xs text-muted-foreground">dias</span>
            </div>
          </div>
          <Trophy className="h-5 w-5 text-primary/60" />
        </div>
      </div>

      {/* Progress hint */}
      {!hasActiveStreak && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          Complete um dia positivo para iniciar seu streak! 🔥
        </p>
      )}
      
      {hasActiveStreak && currentStreak < longestStreak && (
        <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border">
          Faltam <span className="text-warning font-medium">{longestStreak - currentStreak}</span> dias para bater seu recorde!
        </p>
      )}
    </Card>
  );
}

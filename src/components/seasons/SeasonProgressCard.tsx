import { useSeason } from '@/hooks/useSeason';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Zap, TrendingUp } from 'lucide-react';
import { LEVEL_MILESTONES } from '@/lib/seasonXpCalculator';

export function SeasonProgressCard() {
  const { levelProgress, userProgress, seasonDefinition, hasStreakPenalty } = useSeason();
  
  const { currentLevel, currentXp, nextLevelXp, progress } = levelProgress;
  
  // Encontrar próximo marco
  const nextMilestone = LEVEL_MILESTONES.find(m => m.level > currentLevel);
  
  return (
    <Card className="border-0 shadow-lg">
      <CardContent className="p-4">
        {/* Nível atual */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center text-primary-foreground">
              <span className="text-2xl font-bold">{currentLevel}</span>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Nível da Temporada</p>
              <p className="font-semibold">
                {currentLevel >= 50 ? 'Nível Máximo!' : `Próximo: Nível ${currentLevel + 1}`}
              </p>
            </div>
          </div>
          
          {hasStreakPenalty && (
            <Badge variant="destructive" className="text-xs">
              Penalty ativo
            </Badge>
          )}
        </div>
        
        {/* Barra de progresso */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="w-3 h-3 text-primary" />
              {currentXp} XP
            </span>
            <span className="text-muted-foreground">{nextLevelXp} XP</span>
          </div>
          <Progress value={progress} className="h-3" />
        </div>
        
        {/* XP Total da temporada */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">XP Total:</span>
            <span className="font-semibold">{userProgress?.season_xp ?? 0}</span>
          </div>
          
          {nextMilestone && (
            <div className="text-right">
              <span className="text-xs text-muted-foreground">Próximo marco:</span>
              <p className="text-xs font-medium">Nível {nextMilestone.level} - {nextMilestone.description}</p>
            </div>
          )}
        </div>
        
        {/* Título da temporada se nível 50 */}
        {currentLevel >= 50 && seasonDefinition && (
          <div className="mt-4 pt-4 border-t text-center">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">
              {seasonDefinition.titleReward.emoji} {seasonDefinition.titleReward.name}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

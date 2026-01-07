import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trophy, ChevronRight, Sparkles } from 'lucide-react';
import { getAffiliateLevel, getNextLevel, getLevelProgress, type AffiliateLevel } from '@/lib/affiliateLevels';
import type { Referral } from '@/hooks/useAffiliate';

interface AffiliateLevelCardProps {
  referrals: Referral[];
}

export function AffiliateLevelCard({ referrals }: AffiliateLevelCardProps) {
  const convertedCount = referrals.filter((r) => r.status === 'converted').length;
  const currentLevel = getAffiliateLevel(convertedCount);
  const nextLevel = getNextLevel(currentLevel);
  const progress = getLevelProgress(convertedCount, currentLevel, nextLevel);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardContent className="p-5 space-y-4">
        {/* Level Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${currentLevel.color} flex items-center justify-center shadow-lg text-2xl`}>
              {currentLevel.icon}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-lg">Nível {currentLevel.name}</h3>
                {currentLevel.id === 'diamond' && (
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {convertedCount} indicações convertidas
              </p>
            </div>
          </div>
          <Trophy className="w-6 h-6 text-primary/50" />
        </div>

        {/* Progress to Next Level */}
        {nextLevel ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Próximo nível</span>
              <div className="flex items-center gap-1">
                <span className="font-medium">{nextLevel.icon} {nextLevel.name}</span>
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              </div>
            </div>
            <Progress value={progress} className="h-2" />
            <p className="text-xs text-muted-foreground text-center">
              Faltam <span className="font-semibold text-primary">{nextLevel.minReferrals - convertedCount}</span> indicações para {nextLevel.name}
            </p>
          </div>
        ) : (
          <div className="text-center py-2">
            <Badge variant="outline" className="gap-1">
              <Sparkles className="w-3 h-3" />
              Nível Máximo Alcançado!
            </Badge>
          </div>
        )}

        {/* Benefits */}
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Seus benefícios
          </p>
          <div className="flex flex-wrap gap-1.5">
            {currentLevel.benefits.map((benefit, index) => (
              <Badge key={index} variant="secondary" className="text-xs font-normal">
                {benefit}
              </Badge>
            ))}
          </div>
        </div>

        {/* Bonus Multiplier */}
        {currentLevel.bonusMultiplier > 1 && (
          <div className="flex items-center justify-center gap-2 p-2 rounded-lg bg-primary/10 border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">
              Bônus de +{((currentLevel.bonusMultiplier - 1) * 100).toFixed(0)}% em todas as comissões!
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

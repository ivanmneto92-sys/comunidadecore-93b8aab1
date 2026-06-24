import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Activity, Target } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TodayResultCardProps {
  pnlPercent: number | null;
  tradesCount: number;
  winRate: number;
}

export function TodayResultCard({ pnlPercent, tradesCount, winRate }: TodayResultCardProps) {
  if (tradesCount === 0 || pnlPercent === null) {
    return null;
  }


  const isPositive = pnlPercent >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  return (
    <Card className={cn(
      'overflow-hidden relative',
      isPositive 
        ? 'bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20' 
        : 'bg-gradient-to-br from-destructive/10 via-background to-background border-destructive/20'
    )}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-full',
              isPositive ? 'bg-emerald-500/20' : 'bg-destructive/20'
            )}>
              <Icon className={cn(
                'h-6 w-6',
                isPositive ? 'text-emerald-500' : 'text-destructive'
              )} />
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Resultado do Dia
              </p>
              <p className={cn(
                'text-2xl font-bold',
                isPositive ? 'text-emerald-500' : 'text-destructive'
              )}>
                {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              <span>{tradesCount} trades</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Target className="h-3.5 w-3.5" />
              <span>{winRate.toFixed(0)}% win</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

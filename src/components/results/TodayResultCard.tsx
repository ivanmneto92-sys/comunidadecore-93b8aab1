import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface TodayResultCardProps {
  pnlPercent: number | null;
  tradesCount: number;
  winRate: number;
}

export function TodayResultCard({ pnlPercent, tradesCount, winRate }: TodayResultCardProps) {
  // Semantic fallback when no trades today
  if (tradesCount === 0 || pnlPercent === null) {
    return (
      <Card className="border-border/50">
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-medium text-primary mb-2">Resultado do Dia</h3>
          <p className="text-sm text-foreground">Sem operações até o momento</p>
          <p className="text-xs text-muted-foreground/70 mt-1 italic">
            Preservação também é estratégia
          </p>
        </CardContent>
      </Card>
    );
  }

  const isPositive = pnlPercent >= 0;

  return (
    <Card className="border-border/50">
      <CardContent className="pt-4 pb-4">
        <h3 className="text-sm font-medium text-primary mb-3">Resultado do Dia</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className={cn(
              'text-xl font-bold',
              isPositive ? 'text-emerald-500' : 'text-destructive'
            )}
          >
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{tradesCount} trades</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{winRate.toFixed(0)}% win rate</span>
        </div>
      </CardContent>
    </Card>
  );
}

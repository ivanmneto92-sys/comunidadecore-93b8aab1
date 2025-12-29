import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface DayResultCardProps {
  pnlPercent: number;
  tradesCount: number;
  wins: number;
  losses: number;
  isRiskMode: boolean;
}

export function DayResultCard({ pnlPercent, tradesCount, wins, losses, isRiskMode }: DayResultCardProps) {
  const isPositive = pnlPercent >= 0;

  // Semantic fallback when no trades yet
  if (tradesCount === 0 && !isRiskMode) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Resultado do Dia</h3>
          <p className="text-sm text-foreground">Sem operações até o momento</p>
          <p className="text-xs text-muted-foreground/70 mt-1 italic">
            Preservação também é estratégia
          </p>
        </CardContent>
      </Card>
    );
  }

  if (isRiskMode) {
    return (
      <Card>
        <CardContent className="pt-4 pb-4">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">Resultado do Dia</h3>
          <p className="text-sm text-muted-foreground italic">
            Resultado indisponível – foco em preservação
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-4 pb-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Resultado do Dia</h3>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className={cn(
              'text-xl font-bold',
              isPositive ? 'text-status-success' : 'text-status-danger'
            )}
          >
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{tradesCount} trades</span>
          <span className="text-sm text-muted-foreground">•</span>
          <span className="text-sm text-muted-foreground">{wins}W / {losses}L</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Pause } from 'lucide-react';

interface DailyReportPreviewProps {
  pnlPercent: number;
  tradesCount: number;
  wins: number;
  losses: number;
  hasOperations: boolean;
}

export function DailyReportPreview({ 
  pnlPercent, 
  tradesCount, 
  wins, 
  losses,
  hasOperations 
}: DailyReportPreviewProps) {
  const isPositive = pnlPercent >= 0;
  const isNeutral = pnlPercent === 0;

  if (!hasOperations) {
    return (
      <Card className="bg-muted/30 border-dashed">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <Pause className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-muted-foreground">Prévia do Resultado</h3>
          </div>
          <p className="text-sm text-foreground">Sem operações</p>
          <p className="text-xs text-muted-foreground/70 mt-1 italic">
            Preservação também é estratégia
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn(
      "border-2 transition-all",
      isNeutral ? "border-border bg-muted/30" :
      isPositive ? "border-status-success/30 bg-status-success/5" : "border-status-danger/30 bg-status-danger/5"
    )}>
      <CardContent className="pt-4 pb-4">
        <div className="flex items-center gap-2 mb-3">
          {isNeutral ? (
            <Pause className="h-4 w-4 text-muted-foreground" />
          ) : isPositive ? (
            <TrendingUp className="h-4 w-4 text-status-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-status-danger" />
          )}
          <h3 className="text-sm font-medium text-muted-foreground">Prévia do Resultado</h3>
        </div>
        <div className="flex items-center gap-4 flex-wrap">
          <span
            className={cn(
              'text-2xl font-bold',
              isNeutral ? 'text-muted-foreground' :
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

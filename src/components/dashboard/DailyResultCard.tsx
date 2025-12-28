import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyResultCardProps {
  label: string;
  pnlPercent: number;
  tradesCount: number;
  drawdownPercent: number;
}

export function DailyResultCard({ label, pnlPercent, tradesCount, drawdownPercent }: DailyResultCardProps) {
  const isPositive = pnlPercent >= 0;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{label}</CardTitle>
        {isPositive ? (
          <TrendingUp className="h-4 w-4 text-status-success" />
        ) : (
          <TrendingDown className="h-4 w-4 text-status-danger" />
        )}
      </CardHeader>
      <CardContent>
        <div className="flex items-baseline gap-2">
          <span
            className={cn(
              'text-2xl font-bold',
              isPositive ? 'text-status-success' : 'text-status-danger'
            )}
          >
            {isPositive ? '+' : ''}{pnlPercent.toFixed(2)}%
          </span>
          <span className="text-sm text-muted-foreground">PnL</span>
        </div>
        <div className="mt-2 flex gap-4 text-sm text-muted-foreground">
          <span>{tradesCount} trades</span>
          <span>DD: {drawdownPercent.toFixed(2)}%</span>
        </div>
      </CardContent>
    </Card>
  );
}

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, AlertTriangle, Calendar, BarChart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ResultsStatsProps {
  stats: {
    totalTrades: number;
    avgWinRate: number;
    totalPnl: number;
    maxDrawdown: number;
    winDays: number;
    lossDays: number;
  };
}

export function ResultsStats({ stats }: ResultsStatsProps) {
  const isPositive = stats.totalPnl >= 0;

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {/* Total PnL */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-status-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-status-danger" />
            )}
            <span className="text-xs text-muted-foreground">PnL Total</span>
          </div>
          <p className={cn(
            'text-xl font-bold mt-1',
            isPositive ? 'text-status-success' : 'text-status-danger'
          )}>
            {isPositive ? '+' : ''}{stats.totalPnl.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      {/* Win Rate */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-primary" />
            <span className="text-xs text-muted-foreground">Win Rate</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {stats.avgWinRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      {/* Max Drawdown */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-status-warning" />
            <span className="text-xs text-muted-foreground">Max DD</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {stats.maxDrawdown.toFixed(2)}%
          </p>
        </CardContent>
      </Card>

      {/* Total Trades */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <BarChart className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Trades</span>
          </div>
          <p className="text-xl font-bold mt-1">
            {stats.totalTrades}
          </p>
        </CardContent>
      </Card>

      {/* Win Days */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-status-success" />
            <span className="text-xs text-muted-foreground">Dias +</span>
          </div>
          <p className="text-xl font-bold mt-1 text-status-success">
            {stats.winDays}
          </p>
        </CardContent>
      </Card>

      {/* Loss Days */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-status-danger" />
            <span className="text-xs text-muted-foreground">Dias -</span>
          </div>
          <p className="text-xl font-bold mt-1 text-status-danger">
            {stats.lossDays}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

import { TrendingUp, TrendingDown, Activity, BarChart3, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsGridProps {
  pnlPercent: number;
  tradesCount: number;
  winRate: number;
  positiveDays: number;
  isRiskMode: boolean;
}

export function MetricsGrid({ pnlPercent, tradesCount, winRate, positiveDays, isRiskMode }: MetricsGridProps) {
  const isPositive = pnlPercent >= 0;

  const metrics = [
    {
      label: 'Resultado',
      value: isRiskMode ? '—' : `${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}%`,
      icon: isPositive ? TrendingUp : TrendingDown,
      color: isRiskMode ? 'text-muted-foreground' : isPositive ? 'text-status-success' : 'text-status-danger',
      bgColor: isRiskMode ? 'bg-muted/30' : isPositive ? 'bg-status-success/10' : 'bg-status-danger/10',
    },
    {
      label: 'Operações',
      value: tradesCount.toString(),
      icon: Activity,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Win Rate',
      value: tradesCount > 0 ? `${Math.round(winRate)}%` : '—',
      icon: BarChart3,
      color: winRate >= 50 ? 'text-status-success' : 'text-status-warning',
      bgColor: winRate >= 50 ? 'bg-status-success/10' : 'bg-status-warning/10',
    },
    {
      label: 'Dias Positivos',
      value: positiveDays.toString(),
      icon: Flame,
      color: positiveDays > 0 ? 'text-status-success' : 'text-muted-foreground',
      bgColor: positiveDays > 0 ? 'bg-status-success/10' : 'bg-muted/30',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className={cn(
            'p-4 rounded-xl border border-border/50',
            'bg-card/50 backdrop-blur-sm',
            'flex flex-col gap-1'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground font-medium">{metric.label}</span>
            <div className={cn('p-1.5 rounded-lg', metric.bgColor)}>
              <metric.icon className={cn('w-3.5 h-3.5', metric.color)} />
            </div>
          </div>
          <span className={cn('text-xl font-bold', metric.color)}>
            {metric.value}
          </span>
        </div>
      ))}
    </div>
  );
}

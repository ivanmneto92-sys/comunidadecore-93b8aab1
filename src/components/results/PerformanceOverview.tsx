import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, ArrowUpRight, AlertTriangle, Calendar, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PerformanceOverviewProps {
  metrics: {
    totalReturn: number;
    deposits1m: number;
    withdrawals1m: number;
    maxDrawdown: number;
    totalProfit: number;
    quarterReturn: number;
    monthReturn: number;
    weekReturn: number;
    dayReturn: number;
  } | null;
}

export function PerformanceOverview({ metrics }: PerformanceOverviewProps) {
  if (!metrics) {
    return (
      <Card className="p-4">
        <p className="text-center text-muted-foreground text-sm">
          Métricas de performance não disponíveis.
        </p>
      </Card>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const mainMetrics = [
    {
      label: 'Retorno Total',
      value: formatPercent(metrics.totalReturn),
      icon: TrendingUp,
      isPositive: metrics.totalReturn >= 0,
    },
    {
      label: 'Depósitos',
      value: formatCurrency(metrics.deposits1m),
      icon: DollarSign,
      isPositive: true,
    },
    {
      label: 'Retiradas',
      value: formatCurrency(metrics.withdrawals1m),
      icon: ArrowUpRight,
      isPositive: true,
    },
    {
      label: 'Drawdown Máx.',
      value: `${metrics.maxDrawdown.toFixed(2)}%`,
      icon: AlertTriangle,
      isDanger: true,
    },
  ];

  const timeMetrics = [
    { label: 'Trimestre', value: formatPercent(metrics.quarterReturn), isPositive: metrics.quarterReturn >= 0, icon: Calendar },
    { label: 'Mês', value: formatPercent(metrics.monthReturn), isPositive: metrics.monthReturn >= 0, icon: Calendar },
    { label: 'Semana', value: formatPercent(metrics.weekReturn), isPositive: metrics.weekReturn >= 0, icon: Clock },
    { label: 'Dia', value: formatPercent(metrics.dayReturn), isPositive: metrics.dayReturn >= 0, icon: Clock },
  ];

  return (
    <div className="space-y-3">
      {/* Main Metrics - 2x2 grid always */}
      <div className="grid grid-cols-2 gap-2">
        {mainMetrics.map((metric) => (
          <Card key={metric.label} className="p-3">
            <div className="flex items-center gap-2 mb-1">
              <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide truncate">
                {metric.label}
              </span>
            </div>
            <span
              className={cn(
                'text-lg font-bold block',
                metric.isDanger
                  ? 'text-destructive'
                  : metric.isPositive
                  ? 'text-emerald-500'
                  : 'text-destructive'
              )}
            >
              {metric.value}
            </span>
          </Card>
        ))}
      </div>

      {/* Time-based Metrics - 2x2 grid on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {timeMetrics.map((metric) => (
          <Card key={metric.label} className="p-3">
            <div className="flex items-center gap-1.5 mb-1">
              <metric.icon className="h-3 w-3 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </span>
            </div>
            <span
              className={cn(
                'text-base font-semibold',
                metric.isPositive ? 'text-emerald-500' : 'text-destructive'
              )}
            >
              {metric.value}
            </span>
          </Card>
        ))}
      </div>

      {/* Total Profit */}
      <Card className="p-3 bg-primary/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Lucro Total
            </span>
          </div>
          <span className={cn(
            'text-lg font-bold',
            metrics.totalProfit >= 0 ? 'text-emerald-500' : 'text-destructive'
          )}>
            {formatCurrency(metrics.totalProfit)}
          </span>
        </div>
      </Card>
    </div>
  );
}

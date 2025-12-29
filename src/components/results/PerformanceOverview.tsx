import { Card } from '@/components/ui/card';
import { TrendingUp, DollarSign, ArrowUpRight, AlertTriangle } from 'lucide-react';

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
      <Card className="p-6">
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
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const mainMetrics = [
    {
      label: 'RETORNO (TOTAL)',
      value: formatPercent(metrics.totalReturn),
      icon: TrendingUp,
      isPositive: metrics.totalReturn >= 0,
      isPercentage: true,
    },
    {
      label: 'DEPÓSITOS (1M)',
      value: formatCurrency(metrics.deposits1m),
      icon: DollarSign,
      isPositive: true,
      isPercentage: false,
    },
    {
      label: 'RETIRADAS (1M)',
      value: formatCurrency(metrics.withdrawals1m),
      icon: ArrowUpRight,
      isPositive: true,
      isPercentage: false,
    },
    {
      label: 'REBAIXAMENTO',
      value: `${metrics.maxDrawdown.toFixed(2)}%`,
      icon: AlertTriangle,
      isPositive: false,
      isPercentage: true,
      isDanger: true,
    },
  ];

  const secondaryMetrics = [
    {
      label: 'LUCRO TOTAL',
      value: formatCurrency(metrics.totalProfit),
      isPositive: metrics.totalProfit >= 0,
    },
    {
      label: 'TRIMESTRE',
      value: formatPercent(metrics.quarterReturn),
      isPositive: metrics.quarterReturn >= 0,
    },
    {
      label: 'MÊS',
      value: formatPercent(metrics.monthReturn),
      isPositive: metrics.monthReturn >= 0,
    },
    {
      label: 'SEMANA',
      value: formatPercent(metrics.weekReturn),
      isPositive: metrics.weekReturn >= 0,
    },
    {
      label: 'DIA',
      value: formatPercent(metrics.dayReturn),
      isPositive: metrics.dayReturn >= 0,
    },
  ];

  return (
    <div className="space-y-3">
      {/* Main Metrics - 2x2 grid on mobile, 4 cols on desktop */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        {mainMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="p-3 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5">
              <metric.icon className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                {metric.label}
              </span>
            </div>
            <span
              className={`text-lg font-bold ${
                metric.isDanger
                  ? 'text-destructive'
                  : metric.isPositive
                  ? 'text-emerald-500'
                  : 'text-destructive'
              }`}
            >
              {metric.value}
            </span>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics - scrollable on mobile */}
      <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 lg:grid lg:grid-cols-5">
        {secondaryMetrics.map((metric) => (
          <Card
            key={metric.label}
            className="p-3 flex flex-col gap-0.5 min-w-[100px] lg:min-w-0 shrink-0"
          >
            <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
              {metric.label}
            </span>
            <span
              className={`text-base font-semibold ${
                metric.isPositive ? 'text-emerald-500' : 'text-destructive'
              }`}
            >
              {metric.value}
            </span>
          </Card>
        ))}
      </div>
    </div>
  );
}

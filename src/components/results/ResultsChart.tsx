import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface ChartDataPoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
  drawdown: number;
}

interface ResultsChartProps {
  data: ChartDataPoint[];
}

type ChartType = 'cumulative' | 'daily' | 'drawdown';

export function ResultsChart({ data }: ResultsChartProps) {
  const [chartType, setChartType] = useState<ChartType>('cumulative');

  const formatDate = (dateStr: string) => {
    try {
      return format(parseISO(dateStr), 'dd/MM', { locale: ptBR });
    } catch {
      return dateStr;
    }
  };

  const getDataKey = () => {
    switch (chartType) {
      case 'cumulative':
        return 'cumulativePnl';
      case 'daily':
        return 'pnl';
      case 'drawdown':
        return 'drawdown';
      default:
        return 'cumulativePnl';
    }
  };

  const getColor = () => {
    switch (chartType) {
      case 'cumulative':
        return 'hsl(var(--chart-1))';
      case 'daily':
        return 'hsl(var(--chart-2))';
      case 'drawdown':
        return 'hsl(var(--destructive))';
      default:
        return 'hsl(var(--chart-1))';
    }
  };

  const getLabel = () => {
    switch (chartType) {
      case 'cumulative':
        return 'PnL Acumulado';
      case 'daily':
        return 'PnL Diário';
      case 'drawdown':
        return 'Drawdown';
      default:
        return 'PnL Acumulado';
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-2 shadow-lg">
          <p className="text-[10px] text-muted-foreground mb-0.5">
            {formatDate(label)}
          </p>
          <p className={cn(
            'text-sm font-semibold',
            chartType === 'drawdown' 
              ? 'text-destructive'
              : payload[0].value >= 0 
                ? 'text-emerald-500' 
                : 'text-destructive'
          )}>
            {chartType === 'drawdown' ? '-' : payload[0].value >= 0 ? '+' : ''}
            {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const chartTypes: { type: ChartType; label: string }[] = [
    { type: 'cumulative', label: 'Acum.' },
    { type: 'daily', label: 'Diário' },
    { type: 'drawdown', label: 'DD' },
  ];

  // Show fewer labels on mobile
  const tickInterval = data.length > 10 ? Math.ceil(data.length / 6) : 0;

  return (
    <Card className="min-w-0">
      <CardHeader className="pb-2 px-4 pt-4">
        <div className="flex items-center justify-between gap-2">
          <h3 className="text-sm font-semibold">{getLabel()}</h3>
          <div className="flex gap-0.5 p-0.5 bg-muted/50 rounded-md">
            {chartTypes.map(({ type, label }) => (
              <button
                key={type}
                onClick={() => setChartType(type)}
                className={cn(
                  'px-2 py-1 text-[10px] font-medium rounded transition-all',
                  chartType === type
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0 px-4 pb-4">
        <div className="h-[180px] min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 5, right: 5, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="resultColorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getColor()} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                interval={tickInterval}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 9 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
                width={35}
              />
              <Tooltip content={<CustomTooltip />} />
              {chartType !== 'drawdown' && (
                <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              )}
              <Area
                type="monotone"
                dataKey={getDataKey()}
                stroke={getColor()}
                strokeWidth={2}
                fill="url(#resultColorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

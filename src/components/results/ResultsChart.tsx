import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        return 'hsl(var(--status-danger))';
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
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-xs text-muted-foreground mb-1">
            {formatDate(label)}
          </p>
          <p className={cn(
            'text-sm font-semibold',
            chartType === 'drawdown' 
              ? 'text-status-danger'
              : payload[0].value >= 0 
                ? 'text-status-success' 
                : 'text-status-danger'
          )}>
            {chartType === 'drawdown' ? '-' : payload[0].value >= 0 ? '+' : ''}
            {payload[0].value.toFixed(2)}%
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{getLabel()}</CardTitle>
          <div className="flex gap-1">
            {(['cumulative', 'daily', 'drawdown'] as ChartType[]).map((type) => (
              <Button
                key={type}
                variant={chartType === type ? 'default' : 'ghost'}
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => setChartType(type)}
              >
                {type === 'cumulative' ? 'Acum.' : type === 'daily' ? 'Diário' : 'DD'}
              </Button>
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={getColor()} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={getColor()} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                tickFormatter={formatDate}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}%`}
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
                fill="url(#colorGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}

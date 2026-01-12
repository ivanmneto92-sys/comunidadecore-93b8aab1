import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { JournalEntry } from '@/hooks/useJournal';

interface JournalBalanceChartProps {
  entries: JournalEntry[];
  initialBalance: number;
}

export function JournalBalanceChart({ entries, initialBalance }: JournalBalanceChartProps) {
  const chartData = useMemo(() => {
    // Sort entries by date ascending
    const sortedEntries = [...entries].sort((a, b) => a.date.localeCompare(b.date));
    
    let cumulativeBalance = initialBalance;
    
    return sortedEntries.map((entry) => {
      // Calculate the daily change in reais based on pnl_percent
      const dailyChange = cumulativeBalance * (entry.pnl_percent / 100);
      cumulativeBalance += dailyChange;
      
      // Format date for display
      const dateObj = new Date(entry.date + 'T00:00:00');
      const dayLabel = dateObj.toLocaleDateString('pt-BR', { 
        day: '2-digit',
        month: '2-digit'
      });
      
      return {
        date: dayLabel,
        fullDate: entry.date,
        balance: Math.round(cumulativeBalance * 100) / 100,
        pnl: entry.pnl_percent,
      };
    });
  }, [entries, initialBalance]);

  const currentBalance = chartData.length > 0 
    ? chartData[chartData.length - 1].balance 
    : initialBalance;
  
  const totalChange = currentBalance - initialBalance;
  const totalChangePercent = initialBalance > 0 
    ? ((totalChange / initialBalance) * 100).toFixed(2) 
    : '0.00';
  const isPositive = totalChange >= 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (entries.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Evolução do Saldo</CardTitle>
          <div className={`flex items-center gap-1 text-sm font-semibold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            {isPositive ? '+' : ''}{formatCurrency(totalChange)} ({isPositive ? '+' : ''}{totalChangePercent}%)
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold">{formatCurrency(currentBalance)}</span>
          <span className="text-xs text-muted-foreground">saldo atual</span>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
              <defs>
                <linearGradient id="balanceGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop 
                    offset="5%" 
                    stopColor={isPositive ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0.3}
                  />
                  <stop 
                    offset="95%" 
                    stopColor={isPositive ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'} 
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>
              <XAxis 
                dataKey="date" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                interval="preserveStartEnd"
              />
              <YAxis 
                hide
                domain={['dataMin - 100', 'dataMax + 100']}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: number) => [formatCurrency(value), 'Saldo']}
                labelFormatter={(label) => `Data: ${label}`}
              />
              <ReferenceLine 
                y={initialBalance} 
                stroke="hsl(var(--muted-foreground))" 
                strokeDasharray="3 3" 
                strokeOpacity={0.5}
              />
              <Area
                type="monotone"
                dataKey="balance"
                stroke={isPositive ? 'hsl(var(--chart-2))' : 'hsl(var(--destructive))'}
                strokeWidth={2}
                fill="url(#balanceGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-2">
          <span>Início: {formatCurrency(initialBalance)}</span>
          <span>Linha tracejada = saldo inicial</span>
        </div>
      </CardContent>
    </Card>
  );
}

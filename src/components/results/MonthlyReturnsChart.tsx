import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface MonthlyReturnsChartProps {
  data: Array<{
    month: string;
    returnPercent: number;
  }>;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const isPositive = value >= 0;
    return (
      <div className="bg-background/95 backdrop-blur-sm border border-border rounded-lg px-3 py-2 shadow-lg">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={`text-sm font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
          {isPositive ? '+' : ''}{value.toFixed(2)}%
        </p>
      </div>
    );
  }
  return null;
};

export function MonthlyReturnsChart({ data }: MonthlyReturnsChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Retornos Mensais</h3>
        <p className="text-center text-muted-foreground text-sm py-8">
          Dados mensais não disponíveis.
        </p>
      </Card>
    );
  }

  const maxReturn = Math.max(...data.map((d) => Math.abs(d.returnPercent)));
  const yAxisMax = Math.ceil(maxReturn / 5) * 5 + 5;
  const hasNegative = data.some(d => d.returnPercent < 0);
  const yAxisMin = hasNegative ? -yAxisMax : 0;

  return (
    <Card className="p-4 min-w-0">
      <h3 className="text-sm font-semibold mb-3">Retornos Mensais</h3>
      <div className="h-[180px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 5, left: 0, bottom: 5 }}
          >
            <XAxis
              dataKey="month"
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
              width={35}
            />
            <Tooltip 
              content={<CustomTooltip />}
              cursor={{ fill: 'transparent' }}
            />
            <Bar dataKey="returnPercent" radius={[4, 4, 0, 0]} maxBarSize={40} fill="transparent">
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.returnPercent >= 0 ? '#22C55E' : '#EF4444'}
                  stroke={entry.returnPercent >= 0 ? '#22C55E' : '#EF4444'}
                  fillOpacity={1}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

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
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [`${value.toFixed(2)}%`, 'Retorno']}
            />
            <Bar dataKey="returnPercent" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.returnPercent >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

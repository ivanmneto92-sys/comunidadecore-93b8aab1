import { Card } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
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

  const maxReturn = Math.max(...data.map((d) => d.returnPercent));
  const yAxisMax = Math.ceil(maxReturn / 5) * 5 + 5;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-semibold mb-3">Retornos Mensais</h3>
      <div className="h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 20, right: 5, left: -20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[0, yAxisMax]}
              tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `${v}%`}
              tickLine={false}
              axisLine={false}
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
            <Bar dataKey="returnPercent" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.returnPercent >= 0 ? 'hsl(var(--primary))' : 'hsl(var(--destructive))'}
                />
              ))}
              <LabelList
                dataKey="returnPercent"
                position="top"
                formatter={(value: number) => `${value.toFixed(1)}%`}
                style={{
                  fontSize: 9,
                  fill: 'hsl(var(--muted-foreground))',
                }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

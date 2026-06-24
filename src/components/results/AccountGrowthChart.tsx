import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

interface AccountGrowthChartProps {
  data: Array<{
    date: string;
    balance: number;
  }>;
}

export function AccountGrowthChart({ data }: AccountGrowthChartProps) {
  if (data.length === 0) {
    return (
      <Card className="p-4">
        <h3 className="text-sm font-semibold mb-3">Crescimento da Conta</h3>
        <p className="text-center text-muted-foreground text-sm py-8">
          Dados de crescimento não disponíveis.
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

  const maxBalance = Math.max(...data.map((d) => d.balance));
  const minBalance = Math.min(...data.map((d) => d.balance));
  const yAxisMax = Math.ceil(maxBalance / 100) * 100 + 100;
  const yAxisMin = Math.floor(minBalance / 100) * 100 - 100;

  // Show fewer labels on mobile
  const tickInterval = data.length > 10 ? Math.ceil(data.length / 5) : 0;

  return (
    <Card className="p-4 min-w-0 overflow-hidden">
      <h3 className="text-sm font-semibold mb-3">Crescimento da Conta</h3>
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 10, right: 12, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              tickLine={false}
              axisLine={false}
              interval={tickInterval}
            />
            <YAxis
              domain={[yAxisMin, yAxisMax]}
              tick={{ fontSize: 9, fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(v) => `$${v}`}
              tickLine={false}
              axisLine={false}
              width={45}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--popover))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
              formatter={(value: number) => [formatCurrency(value), 'Saldo']}
            />
            <Line
              type="monotone"
              dataKey="balance"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: 'hsl(var(--primary))' }}
            />
          </LineChart>

        </ResponsiveContainer>
      </div>
    </Card>
  );
}

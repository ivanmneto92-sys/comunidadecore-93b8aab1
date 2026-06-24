import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LabelList,
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
        <p
          className={`text-sm font-bold ${isPositive ? 'text-emerald-500' : 'text-destructive'}`}
        >
          {isPositive ? '+' : ''}
          {value.toFixed(2)}%
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
  const hasNegative = data.some((d) => d.returnPercent < 0);
  const yAxisMin = hasNegative ? -yAxisMax : 0;

  const positiveColor = 'hsl(var(--chart-2))';
  const negativeColor = 'hsl(var(--destructive))';
  const lineColor = 'hsl(var(--chart-1))';

  return (
    <Card className="p-4 min-w-0 overflow-hidden">
      <h3 className="text-sm font-semibold mb-3">Retornos Mensais</h3>
      <div className="h-[240px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data}
            margin={{ top: 24, right: 12, left: 0, bottom: 5 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              vertical={false}
            />
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
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="returnPercent"
              stroke={lineColor}
              strokeWidth={2}
              dot={(props: any) => {
                const { cx, cy, payload, index } = props;
                const fill =
                  payload.returnPercent >= 0 ? positiveColor : negativeColor;
                return (
                  <circle
                    key={`dot-${index}`}
                    cx={cx}
                    cy={cy}
                    r={4}
                    fill={fill}
                    stroke="hsl(var(--background))"
                    strokeWidth={1.5}
                  />
                );
              }}
              activeDot={{ r: 6 }}
            >
              <LabelList
                dataKey="returnPercent"
                position="top"
                formatter={(value: number) =>
                  `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
                }
                style={{
                  fontSize: '10px',
                  fontWeight: 500,
                  fill: 'hsl(var(--foreground))',
                }}
              />
            </Line>
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

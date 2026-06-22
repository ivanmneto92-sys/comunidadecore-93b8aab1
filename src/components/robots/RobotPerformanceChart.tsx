import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine } from 'recharts';
import type { MonthlyReturn } from '@/hooks/useRobots';

interface Props {
  data: MonthlyReturn[];
  height?: number;
  showAxes?: boolean;
}

const monthLabel = (m: string) => {
  const [, mm] = m.split('-');
  const names = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return names[Math.max(0, Number(mm) - 1)] ?? m;
};

export function RobotPerformanceChart({ data, height = 200, showAxes = true }: Props) {
  if (!data?.length) {
    return (
      <div
        className="flex items-center justify-center rounded-lg bg-muted/30 text-xs text-muted-foreground"
        style={{ height }}
      >
        Sem dados de performance
      </div>
    );
  }

  const rows = data.map((d) => ({ ...d, label: monthLabel(d.month) }));

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="robotPerfFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
            </linearGradient>
          </defs>
          {showAxes && (
            <>
              <XAxis
                dataKey="label"
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => `${v}%`}
                width={36}
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Tooltip
                cursor={{ stroke: 'hsl(var(--primary))', strokeOpacity: 0.3 }}
                contentStyle={{
                  background: 'hsl(var(--card))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v: number) => [`${v.toFixed(2)}%`, 'Retorno']}
              />
            </>
          )}
          <Area
            type="monotone"
            dataKey="return"
            stroke="hsl(var(--primary))"
            strokeWidth={2}
            fill="url(#robotPerfFill)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

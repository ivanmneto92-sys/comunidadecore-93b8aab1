import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { AccountGrowthChart } from './AccountGrowthChart';
import { MonthlyReturnsChart } from './MonthlyReturnsChart';
import { ResultsChart } from './ResultsChart';

interface ChartDataPoint {
  date: string;
  pnl: number;
  cumulativePnl: number;
  drawdown: number;
}

interface ChartSwitcherProps {
  growthData: Array<{ date: string; balance: number }>;
  monthlyReturns: Array<{ month: string; returnPercent: number }>;
  chartData: ChartDataPoint[];
}

type ChartView = 'growth' | 'monthly' | 'daily';

const tabs: { id: ChartView; label: string; hint: string }[] = [
  { id: 'growth', label: 'Crescimento', hint: 'Saldo ao longo do tempo' },
  { id: 'monthly', label: 'Mensal', hint: 'Retorno por mês' },
  { id: 'daily', label: 'Diário / DD', hint: 'Detalhe operacional' },
];

export function ChartSwitcher({
  growthData,
  monthlyReturns,
  chartData,
}: ChartSwitcherProps) {
  const [view, setView] = useState<ChartView>('growth');

  return (
    <div className="space-y-3 min-w-0">
      <Card className="p-1">
        <div className="grid grid-cols-3 gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={cn(
                'px-2 py-2 rounded-md text-xs font-medium transition-all text-center',
                view === tab.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </Card>

      <p className="text-[10px] text-muted-foreground text-center -mt-1">
        {tabs.find((t) => t.id === view)?.hint}
      </p>

      <div className="min-w-0">
        {view === 'growth' && <AccountGrowthChart data={growthData} />}
        {view === 'monthly' && <MonthlyReturnsChart data={monthlyReturns} />}
        {view === 'daily' && chartData.length > 0 && (
          <ResultsChart data={chartData} />
        )}
        {view === 'daily' && chartData.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Sem dados diários para este período.
          </Card>
        )}
      </div>
    </div>
  );
}

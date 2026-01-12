import { Card } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Target, Percent } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JournalStatsProps {
  positiveDays: number;
  negativeDays: number;
  totalPnL: number;
  avgWinRate: number;
  monthLabel: string;
}

export function JournalStats({ 
  positiveDays, 
  negativeDays, 
  totalPnL, 
  avgWinRate,
  monthLabel 
}: JournalStatsProps) {
  const isPositivePnL = totalPnL >= 0;

  return (
    <Card className="p-4">
      <h3 className="text-sm font-medium text-muted-foreground mb-3">{monthLabel}</h3>
      <div className="grid grid-cols-4 gap-2">
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-4 w-4 text-success" />
          </div>
          <p className="text-lg font-bold text-success">{positiveDays}</p>
          <p className="text-[10px] text-muted-foreground">dias +</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingDown className="h-4 w-4 text-destructive" />
          </div>
          <p className="text-lg font-bold text-destructive">{negativeDays}</p>
          <p className="text-[10px] text-muted-foreground">dias -</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Percent className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className={cn(
            "text-lg font-bold",
            isPositivePnL ? "text-success" : "text-destructive"
          )}>
            {isPositivePnL ? '+' : ''}{totalPnL.toFixed(1)}%
          </p>
          <p className="text-[10px] text-muted-foreground">total</p>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-4 w-4 text-muted-foreground" />
          </div>
          <p className="text-lg font-bold text-foreground">{avgWinRate}%</p>
          <p className="text-[10px] text-muted-foreground">win rate</p>
        </div>
      </div>
    </Card>
  );
}

import { Flame, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { FilterPeriod } from '@/hooks/useAccountMetrics';

interface PositiveStreakBadgeProps {
  currentStreak: number;
  bestStreak: number;
  period: FilterPeriod;
}

const PERIOD_LABEL: Record<FilterPeriod, string> = {
  '7d': '7 dias',
  '30d': '30 dias',
  '90d': '90 dias',
  '12m': '12 meses',
};

export function PositiveStreakBadge({ currentStreak, bestStreak, period }: PositiveStreakBadgeProps) {
  if (bestStreak === 0) return null;

  const isHot = currentStreak >= 3;
  const isActive = currentStreak > 0;

  return (
    <div
      className={cn(
        'flex items-center justify-between gap-3 rounded-2xl border bg-card px-4 py-3 shadow-sm transition-transform hover:scale-[1.01]',
        isHot ? 'border-primary/40' : 'border-border'
      )}
    >
      <div className="flex items-center gap-3 min-w-0">
        <div
          className={cn(
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            isHot
              ? 'bg-gradient-to-br from-primary to-primary/60 shadow-lg'
              : isActive
              ? 'bg-primary/15'
              : 'bg-muted'
          )}
        >
          {isActive ? (
            <Flame
              className={cn('h-5 w-5', isHot ? 'text-primary-foreground' : 'text-primary')}
            />
          ) : (
            <Activity className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold leading-tight">
            {isActive ? (
              <>
                {currentStreak} {currentStreak === 1 ? 'dia positivo' : 'dias positivos'}
              </>
            ) : (
              'Sem sequência ativa'
            )}
          </p>
          <p className="text-[11px] text-muted-foreground leading-tight">
            {isActive ? 'sequência atual' : 'o próximo dia positivo recomeça a contagem'}
          </p>
        </div>
      </div>

      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-foreground leading-tight">
          {bestStreak} {bestStreak === 1 ? 'dia' : 'dias'}
        </p>
        <p className="text-[11px] text-muted-foreground leading-tight">
          recorde · {PERIOD_LABEL[period]}
        </p>
      </div>
    </div>
  );
}

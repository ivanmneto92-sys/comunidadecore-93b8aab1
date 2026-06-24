import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Flame, Trophy, AlertTriangle } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface DailyReport {
  date: string;
  pnl_percent: number;
}

interface PeriodSummaryBannerProps {
  reports: DailyReport[];
  period: string;
  currentStreak: number;
  bestStreak: number;
}

const periodLabels: Record<string, string> = {
  '7d': 'últimos 7 dias',
  '30d': 'últimos 30 dias',
  '90d': 'últimos 90 dias',
  '12m': 'últimos 12 meses',
};

export function PeriodSummaryBanner({
  reports,
  period,
  currentStreak,
  bestStreak,
}: PeriodSummaryBannerProps) {
  const stats = useMemo(() => {
    if (reports.length === 0) {
      return { total: 0, positiveDays: 0, totalDays: 0, best: null, worst: null };
    }
    let total = 0;
    let positiveDays = 0;
    let best = reports[0];
    let worst = reports[0];
    for (const r of reports) {
      const v = Number(r.pnl_percent);
      total += v;
      if (v > 0) positiveDays += 1;
      if (v > Number(best.pnl_percent)) best = r;
      if (v < Number(worst.pnl_percent)) worst = r;
    }
    return {
      total,
      positiveDays,
      totalDays: reports.length,
      best,
      worst,
    };
  }, [reports]);

  const isPositive = stats.total >= 0;
  const Icon = isPositive ? TrendingUp : TrendingDown;

  const fmtDate = (d: string) => {
    try {
      return format(parseISO(d), 'dd/MM', { locale: ptBR });
    } catch {
      return d;
    }
  };

  if (stats.totalDays === 0) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-sm text-muted-foreground">
          Sem dados nos {periodLabels[period] ?? 'período selecionado'}.
        </CardContent>
      </Card>
    );
  }

  const positivePct = Math.round((stats.positiveDays / stats.totalDays) * 100);

  return (
    <Card
      className={cn(
        'overflow-hidden border',
        isPositive
          ? 'bg-gradient-to-br from-emerald-500/10 via-background to-background border-emerald-500/20'
          : 'bg-gradient-to-br from-destructive/10 via-background to-background border-destructive/20',
      )}
    >
      <CardContent className="p-4 space-y-3">
        {/* Linha 1: retorno do período */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
              Retorno · {periodLabels[period] ?? period}
            </p>
            <div className="flex items-baseline gap-2">
              <p
                className={cn(
                  'text-3xl font-bold tabular-nums',
                  isPositive ? 'text-emerald-500' : 'text-destructive',
                )}
              >
                {isPositive ? '+' : ''}
                {stats.total.toFixed(2)}%
              </p>
            </div>
          </div>
          <div
            className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full shrink-0',
              isPositive ? 'bg-emerald-500/20' : 'bg-destructive/20',
            )}
          >
            <Icon
              className={cn(
                'h-5 w-5',
                isPositive ? 'text-emerald-500' : 'text-destructive',
              )}
            />
          </div>
        </div>

        {/* Linha 2: dias positivos */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Dias positivos</span>
            <span className="font-semibold tabular-nums">
              {stats.positiveDays}/{stats.totalDays}{' '}
              <span className="text-muted-foreground">({positivePct}%)</span>
            </span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all"
              style={{ width: `${positivePct}%` }}
            />
          </div>
        </div>

        {/* Linha 3: chips */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Chip
            icon={<Trophy className="h-3 w-3 text-emerald-500" />}
            label="Melhor"
            value={
              stats.best
                ? `+${Number(stats.best.pnl_percent).toFixed(2)}%`
                : '—'
            }
            sub={stats.best ? fmtDate(stats.best.date) : ''}
            tone="positive"
          />
          <Chip
            icon={<AlertTriangle className="h-3 w-3 text-destructive" />}
            label="Pior"
            value={
              stats.worst
                ? `${Number(stats.worst.pnl_percent).toFixed(2)}%`
                : '—'
            }
            sub={stats.worst ? fmtDate(stats.worst.date) : ''}
            tone="negative"
          />
          <Chip
            icon={<Flame className="h-3 w-3 text-amber-500" />}
            label="Sequência"
            value={`${currentStreak}d`}
            sub={`recorde ${bestStreak}d`}
            tone="neutral"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function Chip({
  icon,
  label,
  value,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
  tone: 'positive' | 'negative' | 'neutral';
}) {
  return (
    <div className="rounded-lg bg-background/60 border border-border/40 p-2 min-w-0">
      <div className="flex items-center gap-1 mb-0.5">
        {icon}
        <p className="text-[9px] uppercase tracking-wide text-muted-foreground truncate">
          {label}
        </p>
      </div>
      <p
        className={cn(
          'text-xs font-bold tabular-nums truncate',
          tone === 'positive' && 'text-emerald-500',
          tone === 'negative' && 'text-destructive',
          tone === 'neutral' && 'text-foreground',
        )}
      >
        {value}
      </p>
      {sub && (
        <p className="text-[9px] text-muted-foreground truncate">{sub}</p>
      )}
    </div>
  );
}

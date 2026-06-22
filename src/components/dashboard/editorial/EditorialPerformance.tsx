import { memo } from 'react';

interface EditorialPerformanceProps {
  pnlPercent: number;
  tradesCount: number;
  winRate: number;
  positiveDays: number;
  isRiskMode: boolean;
}

export const EditorialPerformance = memo(function EditorialPerformance({
  pnlPercent,
  tradesCount,
  winRate,
  positiveDays,
  isRiskMode,
}: EditorialPerformanceProps) {
  const isPositive = pnlPercent >= 0;
  const pnlLabel = isRiskMode
    ? '—'
    : `${isPositive ? '+' : ''}${pnlPercent.toFixed(2)}%`;

  return (
    <section className="-mx-4 px-6 py-7 border-b border-accent/15">
      <header className="flex items-baseline justify-between mb-5">
        <h2 className="font-display text-xl font-medium tracking-tight">
          Performance
        </h2>
        <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/50">
          hoje
        </span>
      </header>

      <div className="flex items-end justify-between mb-6">
        <div>
          <div
            className="font-display font-semibold text-primary leading-none"
            style={{ fontSize: 44, letterSpacing: '-0.03em' }}
          >
            {pnlLabel}
          </div>
          <div className="text-[11px] text-foreground/60 mt-1">
            {isRiskMode ? 'modo risco — PnL oculto' : 'resultado do dia'}
          </div>
        </div>
        <svg width="120" height="48" viewBox="0 0 120 48" fill="none" aria-hidden>
          <path
            d="M0 38 L20 32 L40 35 L60 22 L80 26 L100 14 L120 8"
            stroke="hsl(var(--primary))"
            strokeWidth="1.5"
          />
        </svg>
      </div>

      <dl className="grid grid-cols-3 gap-4 pt-5 border-t border-accent/15">
        <Stat label="Operações" value={tradesCount.toString()} />
        <Stat
          label="Win rate"
          value={tradesCount > 0 ? `${Math.round(winRate)}%` : '—'}
        />
        <Stat
          label="Dias +"
          value={positiveDays.toString()}
        />
      </dl>
    </section>
  );
});

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-[0.2em] text-foreground/50 mb-1.5">
        {label}
      </dt>
      <dd className="font-display text-xl font-semibold text-foreground tabular-nums">
        {value}
      </dd>
    </div>
  );
}

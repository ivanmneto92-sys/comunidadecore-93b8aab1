import { Flame } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface EditorialHeroProps {
  score: number;
  insightText: string;
  streakDays: number;
}

export function EditorialHero({ score, insightText, streakDays }: EditorialHeroProps) {
  const dateLabel = format(new Date(), "EEEE · dd MMM", { locale: ptBR });

  return (
    <section className="-mx-4 px-6 pt-2 pb-6 border-b border-accent/15">
      <div className="text-[10px] uppercase tracking-[0.25em] text-accent mb-6">
        {dateLabel}
      </div>
      <div className="text-[11px] uppercase tracking-[0.3em] text-primary mb-3 font-display">
        Saúde do sistema
      </div>
      <div className="flex items-end gap-3 mb-3">
        <span
          className="font-display font-semibold text-primary leading-none"
          style={{ fontSize: 88, letterSpacing: '-0.04em' }}
        >
          {score}
        </span>
        <span className="pb-3 text-xs text-foreground/60">/100</span>
      </div>
      <p className="font-display text-sm text-foreground/75 max-w-[280px] leading-snug">
        {insightText}
      </p>
      {streakDays > 0 && (
        <div className="mt-6 flex items-center gap-2 text-xs text-foreground/85">
          <Flame className="w-3.5 h-3.5 text-primary" aria-hidden />
          <span>{streakDays} {streakDays === 1 ? 'dia positivo' : 'dias positivos consecutivos'}</span>
        </div>
      )}
    </section>
  );
}

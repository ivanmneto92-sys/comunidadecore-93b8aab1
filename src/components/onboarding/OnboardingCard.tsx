import { Link } from 'react-router-dom';
import { Check, ChevronRight, X, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useOnboarding } from '@/hooks/useOnboarding';
import { cn } from '@/lib/utils';

export function OnboardingCard() {
  const { steps, completedCount, total, visible, dismiss } = useOnboarding();

  if (!visible) return null;

  const pct = Math.round((completedCount / total) * 100);

  return (
    <Card className="relative overflow-hidden border-primary/30 bg-gradient-to-br from-secondary to-background p-4">
      <button
        type="button"
        onClick={() => void dismiss()}
        className="absolute top-2 right-2 p-1 rounded-md text-muted-foreground hover:bg-muted/50"
        aria-label="Dispensar onboarding"
      >
        <X className="h-4 w-4" />
      </button>

      <div className="flex items-center gap-2 mb-1">
        <Sparkles className="h-4 w-4 text-primary" />
        <h3 className="font-semibold text-sm">Primeiros passos no Instituto Trader</h3>
      </div>
      <p className="text-xs text-muted-foreground mb-3">
        Complete os 5 passos e ganhe a badge <span className="text-primary font-medium">Primeiros Passos</span> + 50 XP.
      </p>

      <div className="flex items-center gap-2 mb-3">
        <Progress value={pct} className="h-1.5 flex-1" />
        <span className="text-[10px] font-medium text-muted-foreground tabular-nums">
          {completedCount}/{total}
        </span>
      </div>

      <ul className="space-y-1.5">
        {steps.map((step) => (
          <li key={step.key}>
            <Link
              to={step.href}
              className={cn(
                'flex items-center gap-2 px-2 py-1.5 rounded-md transition-colors',
                step.done ? 'opacity-60' : 'hover:bg-muted/50',
              )}
            >
              <div
                className={cn(
                  'h-5 w-5 rounded-full flex items-center justify-center shrink-0 border',
                  step.done
                    ? 'bg-primary border-primary text-primary-foreground'
                    : 'border-muted-foreground/40',
                )}
              >
                {step.done && <Check className="h-3 w-3" />}
              </div>
              <span className={cn('text-xs flex-1', step.done && 'line-through')}>
                {step.label}
              </span>
              {!step.done && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  );
}

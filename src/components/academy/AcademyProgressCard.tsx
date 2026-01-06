import { cn } from '@/lib/utils';

interface AcademyProgressCardProps {
  percentage: number;
  completed: number;
  total: number;
  nextTutorialTitle?: string;
  className?: string;
}

export function AcademyProgressCard({
  percentage,
  completed,
  total,
  nextTutorialTitle,
  className,
}: AcademyProgressCardProps) {
  const circumference = 2 * Math.PI * 40;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getGlowColor = () => {
    if (percentage >= 80) return 'shadow-[0_0_30px_rgba(34,197,94,0.3)]';
    if (percentage >= 40) return 'shadow-[0_0_30px_rgba(242,168,29,0.3)]';
    return 'shadow-[0_0_30px_rgba(59,130,246,0.3)]';
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border border-border/50 bg-card p-5',
        getGlowColor(),
        className
      )}
    >
      <div className="flex items-center gap-5">
        {/* Circular Progress */}
        <div className="relative flex h-24 w-24 shrink-0 items-center justify-center">
          <svg className="h-24 w-24 -rotate-90 transform">
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              className="text-muted/30"
            />
            <circle
              cx="48"
              cy="48"
              r="40"
              stroke="currentColor"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              className="text-primary transition-all duration-700 ease-out"
              style={{
                strokeDasharray: circumference,
                strokeDashoffset: strokeDashoffset,
              }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-2xl font-bold text-foreground">{percentage}%</span>
          </div>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-foreground">Seu Progresso</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {completed} de {total} aulas concluídas
          </p>
          {nextTutorialTitle && percentage < 100 && (
            <p className="text-sm text-primary mt-2 truncate">
              Próximo: {nextTutorialTitle}
            </p>
          )}
          {percentage === 100 && (
            <p className="text-sm text-status-positive mt-2 font-medium">
              🎉 Curso concluído!
            </p>
          )}
        </div>
      </div>

      {/* Background decoration */}
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/5" />
    </div>
  );
}

import { Lock, CheckCircle2, Play } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
}

interface TutorialCardProps {
  tutorial: Tutorial;
  hasAccess: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const categoryColors: Record<string, string> = {
  beginner: 'bg-status-positive/20 text-status-positive',
  intermediate: 'bg-status-warning/20 text-status-warning',
  advanced: 'bg-status-negative/20 text-status-negative',
};

const categoryIcons: Record<string, string> = {
  beginner: '🌱',
  intermediate: '📈',
  advanced: '🎯',
};

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Grátis', color: 'bg-muted text-muted-foreground' },
  plus: { label: 'Plus', color: 'bg-status-warning/20 text-status-warning' },
  elite: { label: 'Elite', color: 'bg-primary/20 text-primary' },
};

export function TutorialCard({
  tutorial,
  hasAccess,
  isCompleted,
  onSelect,
  className,
  style,
}: TutorialCardProps) {
  return (
    <button
      onClick={onSelect}
      disabled={!hasAccess}
      className={cn(
        'group relative w-full overflow-hidden rounded-xl border bg-card p-4 text-left transition-all duration-200',
        hasAccess
          ? 'cursor-pointer hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10 hover:scale-[1.02]'
          : 'cursor-not-allowed opacity-60',
        isCompleted && 'border-status-positive/30 bg-status-positive/5',
        className
      )}
      style={style}
    >
      <div className="flex items-start gap-4">
        {/* Category icon */}
        <div
          className={cn(
            'flex h-12 w-12 shrink-0 items-center justify-center rounded-lg text-xl',
            categoryColors[tutorial.category] || 'bg-muted text-muted-foreground'
          )}
        >
          {categoryIcons[tutorial.category] || '📚'}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
              {tutorial.title}
            </h3>
            
            {/* Status indicator */}
            {hasAccess ? (
              isCompleted ? (
                <CheckCircle2 className="h-5 w-5 shrink-0 text-status-positive" />
              ) : (
                <Play className="h-5 w-5 shrink-0 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
              )
            ) : (
              <Lock className="h-5 w-5 shrink-0 text-muted-foreground" />
            )}
          </div>

          {tutorial.description && (
            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
              {tutorial.description}
            </p>
          )}

          {/* Badges */}
          <div className="flex items-center gap-2 mt-2">
            {tutorial.tier_required !== 'free' && (
              <Badge
                variant="secondary"
                className={cn('text-xs', tierLabels[tutorial.tier_required]?.color)}
              >
                {tierLabels[tutorial.tier_required]?.label}
              </Badge>
            )}
            {isCompleted && (
              <Badge variant="secondary" className="text-xs bg-status-positive/20 text-status-positive">
                Concluído
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Hover effect overlay */}
      {hasAccess && !isCompleted && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      )}
    </button>
  );
}

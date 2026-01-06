import { Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
}

interface ContinueLearningCardProps {
  tutorial: Tutorial;
  hasAccess: boolean;
  onSelect: () => void;
  className?: string;
}

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

export function ContinueLearningCard({
  tutorial,
  hasAccess,
  onSelect,
  className,
}: ContinueLearningCardProps) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl border-2 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent p-5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-medium uppercase tracking-wider text-primary mb-2">
            Continuar Aprendendo
          </p>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{categoryIcons[tutorial.category] || '📚'}</span>
            <h3 className="font-semibold text-foreground truncate">{tutorial.title}</h3>
          </div>
          {tutorial.description && (
            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
              {tutorial.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {tutorial.tier_required !== 'free' && (
              <Badge className={cn('text-xs', tierLabels[tutorial.tier_required]?.color)}>
                {tierLabels[tutorial.tier_required]?.label}
              </Badge>
            )}
          </div>
        </div>

        <Button
          size="icon"
          className="h-12 w-12 shrink-0 rounded-full bg-primary hover:bg-primary/90"
          onClick={onSelect}
          disabled={!hasAccess}
        >
          <Play className="h-5 w-5 fill-primary-foreground" />
        </Button>
      </div>

      {/* Decorative elements */}
      <div className="absolute -right-6 -bottom-6 h-24 w-24 rounded-full bg-primary/10" />
    </div>
  );
}

import { Play, Lock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
  video_url?: string | null;
}

interface TutorialCardProps {
  tutorial: Tutorial;
  hasAccess: boolean;
  isCompleted: boolean;
  onSelect: () => void;
  className?: string;
}

const categoryLabels: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

const tierBadges: Record<string, { label: string; className: string }> = {
  plus: {
    label: 'Plus',
    className: 'bg-status-warning/15 text-status-warning border-status-warning/30',
  },
  elite: {
    label: 'Elite',
    className: 'bg-primary/15 text-primary border-primary/30',
  },
};

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
  );
  return match ? match[1] : null;
}

export function TutorialCard({
  tutorial,
  hasAccess,
  isCompleted,
  onSelect,
  className,
}: TutorialCardProps) {
  const videoId = getYouTubeId(tutorial.video_url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/default.jpg`
    : null;

  const isLocked = !hasAccess;
  const tierBadge = tierBadges[tutorial.tier_required];

  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={cn(
        'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
        'bg-card border border-border',
        isLocked && 'opacity-50 cursor-not-allowed',
        !isLocked && 'hover:bg-accent/50 active:scale-[0.99]',
        isCompleted && 'opacity-70',
        className
      )}
    >
      {/* Thumbnail */}
      <div className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden bg-muted">
        {thumbnailUrl ? (
          <img src={thumbnailUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
            <Play className="h-5 w-5 text-primary/50" />
          </div>
        )}

        {/* Status overlay */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60">
            <Lock className="h-4 w-4 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-sm text-foreground line-clamp-1 mb-0.5">
          {tutorial.title}
        </h4>
        {tutorial.description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mb-1.5">
            {tutorial.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {categoryLabels[tutorial.category] || tutorial.category}
          </span>
          {tierBadge && (
            <Badge
              variant="outline"
              className={cn('text-[10px] px-1.5 py-0', tierBadge.className)}
            >
              {tierBadge.label}
            </Badge>
          )}
        </div>
      </div>

      {/* Completed indicator */}
      {isCompleted && <CheckCircle2 className="shrink-0 h-5 w-5 text-status-success" />}
    </button>
  );
}

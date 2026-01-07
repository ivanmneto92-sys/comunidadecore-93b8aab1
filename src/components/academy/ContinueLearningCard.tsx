import { Play, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface Tutorial {
  id: string;
  title: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
  video_url?: string | null;
}

interface ContinueLearningCardProps {
  tutorial: Tutorial;
  hasAccess: boolean;
  onSelect: () => void;
  progress?: { completed: number; total: number };
  className?: string;
}

const categoryLabels: Record<string, string> = {
  beginner: 'Iniciante',
  intermediate: 'Intermediário',
  advanced: 'Avançado',
};

function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
}

export function ContinueLearningCard({
  tutorial,
  hasAccess,
  onSelect,
  progress,
  className,
}: ContinueLearningCardProps) {
  const videoId = getYouTubeId(tutorial.video_url);
  const thumbnailUrl = videoId
    ? `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`
    : null;

  const progressPercent = progress && progress.total > 0
    ? Math.round((progress.completed / progress.total) * 100)
    : 0;

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-xl bg-card border border-border',
        className
      )}
    >
      {/* Thumbnail or gradient background */}
      <div className="relative aspect-video w-full bg-muted">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={tutorial.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
            <Play className="h-12 w-12 text-primary/50" />
          </div>
        )}
        
        {/* Overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/60 to-transparent" />
        
        {/* Play button overlay */}
        <button
          onClick={onSelect}
          disabled={!hasAccess}
          className="absolute inset-0 flex items-center justify-center group"
        >
          <div className="h-14 w-14 rounded-full bg-primary/90 flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
            <Play className="h-6 w-6 text-primary-foreground fill-primary-foreground ml-1" />
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="p-4 -mt-12 relative z-10">
        <p className="text-xs font-medium text-primary mb-1">
          Continuar Aprendendo
        </p>
        <h3 className="font-semibold text-foreground line-clamp-1 mb-1">
          {tutorial.title}
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          {categoryLabels[tutorial.category] || tutorial.category}
        </p>

        {/* Progress bar */}
        {progress && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-foreground">Progresso geral</span>
              <span className="text-primary font-medium">{progressPercent}%</span>
            </div>
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          onClick={onSelect}
          disabled={!hasAccess}
          className="w-full"
          size="sm"
        >
          <span>Continuar</span>
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}

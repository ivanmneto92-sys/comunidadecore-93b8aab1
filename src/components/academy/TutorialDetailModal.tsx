import { useState } from 'react';
import { X, CheckCircle2, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import DOMPurify from 'dompurify';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerClose,
} from '@/components/ui/drawer';
import { cn } from '@/lib/utils';

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category: string;
  tier_required: 'free' | 'plus' | 'elite';
  content: string | null;
  video_url: string | null;
}

interface TutorialDetailModalProps {
  tutorial: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onMarkComplete: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const categoryLabels: Record<string, { label: string; icon: string }> = {
  beginner: { label: 'Iniciante', icon: '🌱' },
  intermediate: { label: 'Intermediário', icon: '📈' },
  advanced: { label: 'Avançado', icon: '🎯' },
};

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Grátis', color: 'bg-muted text-muted-foreground' },
  plus: { label: 'Plus', color: 'bg-status-warning/20 text-status-warning' },
  elite: { label: 'Elite', color: 'bg-primary/20 text-primary' },
};

export function TutorialDetailModal({
  tutorial,
  isOpen,
  onClose,
  isCompleted,
  onMarkComplete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: TutorialDetailModalProps) {
  const [marking, setMarking] = useState(false);

  if (!tutorial) return null;

  const handleMarkComplete = async () => {
    setMarking(true);
    await onMarkComplete();
    setMarking(false);
  };

  const getYouTubeEmbedUrl = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const embedUrl = tutorial.video_url ? getYouTubeEmbedUrl(tutorial.video_url) : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        <DrawerHeader className="border-b border-border pb-4">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">
                  {categoryLabels[tutorial.category]?.icon || '📚'}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {categoryLabels[tutorial.category]?.label || tutorial.category}
                </Badge>
                {tutorial.tier_required !== 'free' && (
                  <Badge className={cn('text-xs', tierLabels[tutorial.tier_required]?.color)}>
                    {tierLabels[tutorial.tier_required]?.label}
                  </Badge>
                )}
              </div>
              <DrawerTitle className="text-xl font-bold text-left">
                {tutorial.title}
              </DrawerTitle>
            </div>
            <DrawerClose asChild>
              <Button variant="ghost" size="icon" className="shrink-0">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
        </DrawerHeader>

        <ScrollArea className="flex-1 px-4">
          <div className="py-4 space-y-6">
            {/* Video player */}
            {embedUrl && (
              <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-muted">
                <iframe
                  src={embedUrl}
                  title={tutorial.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="absolute inset-0 h-full w-full"
                />
              </div>
            )}

            {/* External video link */}
            {tutorial.video_url && !embedUrl && (
              <a
                href={tutorial.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/10 p-4 text-primary hover:bg-primary/20 transition-colors"
              >
                <ExternalLink className="h-5 w-5" />
                <span className="font-medium">Assistir vídeo externo</span>
              </a>
            )}

            {/* Description */}
            {tutorial.description && (
              <div className="rounded-lg bg-muted/30 p-4">
                <p className="text-muted-foreground">{tutorial.description}</p>
              </div>
            )}

            {/* Content */}
            {tutorial.content && (
              <div className="prose prose-invert prose-sm max-w-none">
                <div
                  className="text-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: DOMPurify.sanitize(tutorial.content.replace(/\n/g, '<br />')) 
                  }}
                />
              </div>
            )}

            {/* Empty state */}
            {!tutorial.video_url && !tutorial.content && (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Conteúdo em breve...
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="border-t border-border p-4 space-y-3">
          {/* Navigation */}
          <div className="flex items-center justify-between gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="gap-1"
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onNext}
              disabled={!hasNext}
              className="gap-1"
            >
              Próxima
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Complete button */}
          <Button
            onClick={handleMarkComplete}
            disabled={isCompleted || marking}
            className={cn(
              'w-full gap-2',
              isCompleted && 'bg-status-positive hover:bg-status-positive/90'
            )}
          >
            <CheckCircle2 className="h-5 w-5" />
            {isCompleted ? 'Aula concluída!' : marking ? 'Marcando...' : 'Marcar como concluída'}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

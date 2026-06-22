import { useState } from 'react';
import { X, ChevronLeft, ChevronRight, CheckCircle2, Loader2, ExternalLink, Brain, Trophy } from 'lucide-react';
import { Drawer, DrawerContent } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import DOMPurify from 'dompurify';
import { useTutorialQuiz } from '@/hooks/useTutorialQuiz';
import { QuizRunner } from './QuizRunner';

interface Tutorial {
  id: string;
  title: string;
  slug?: string;
  description: string | null;
  category_id?: string | null;
  tier_required: 'free' | 'plus' | 'elite';
  content: string | null;
  video_url: string | null;
  cta_url?: string | null;
  cta_label?: string | null;
}

interface TutorialDetailModalProps {
  tutorial: Tutorial | null;
  isOpen: boolean;
  onClose: () => void;
  isCompleted: boolean;
  onMarkComplete: () => Promise<void> | void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

function getYouTubeEmbedUrl(url: string | null): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/
  );
  return match ? `https://www.youtube.com/embed/${match[1]}?rel=0` : null;
}

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
  const [isMarking, setIsMarking] = useState(false);
  const [quizOpen, setQuizOpen] = useState(false);
  const { toast } = useToast();
  const { quiz, bestAttempt, hasPassed } = useTutorialQuiz(tutorial?.id);

  if (!tutorial) return null;

  const embedUrl = getYouTubeEmbedUrl(tutorial.video_url);

  const handleMarkComplete = async () => {
    if (isCompleted || isMarking) return;
    setIsMarking(true);
    try {
      await onMarkComplete();
      toast({ title: 'Tutorial concluído! 🎉' });
    } catch (error) {
      console.error('Error marking tutorial complete:', error);
      toast({
        variant: 'destructive',
        title: 'Erro ao marcar como concluído',
        description: 'Tente novamente.',
      });
    } finally {
      setIsMarking(false);
    }
  };

  const sanitizedContent = tutorial.content
    ? DOMPurify.sanitize(tutorial.content.replace(/\n/g, '<br />'))
    : null;

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DrawerContent className="h-[95vh] max-h-[95vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <button
            onClick={onClose}
            className="p-1.5 -ml-1.5 rounded-md hover:bg-accent transition-colors"
          >
            <X className="h-5 w-5" />
          </button>

          <span className="text-xs text-muted-foreground font-medium">
            Tutorial
          </span>

          <div className="flex items-center gap-1">
            <button
              onClick={onPrevious}
              disabled={!hasPrevious}
              className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={onNext}
              disabled={!hasNext}
              className="p-1.5 rounded-md hover:bg-accent transition-colors disabled:opacity-30"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="pb-24">
            {/* Video Player */}
            {embedUrl && (
              <div className="aspect-video w-full bg-black">
                <iframe
                  src={embedUrl}
                  title={tutorial.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            )}

            {/* Content */}
            <div className="p-4 space-y-4">
              <div>
                <h1 className="text-xl font-bold text-foreground mb-1">
                  {tutorial.title}
                </h1>
                {tutorial.description && (
                  <p className="text-sm text-muted-foreground">{tutorial.description}</p>
                )}
              </div>

              {sanitizedContent && (
                <div
                  className="prose prose-sm prose-invert max-w-none text-foreground/90"
                  dangerouslySetInnerHTML={{ __html: sanitizedContent }}
                />
              )}

              {/* CTA Button — only render with safe http(s) URL */}
              {tutorial.cta_url && /^https?:\/\//i.test(tutorial.cta_url) && (
                <a
                  href={tutorial.cta_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg bg-primary/10 border border-primary/30 text-primary font-medium hover:bg-primary/20 transition-colors"
                >
                  {tutorial.cta_label || 'Acessar Link'}
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}


              {/* Quiz CTA */}
              {quiz && quiz.quiz_questions.length > 0 && (
                <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    {hasPassed ? (
                      <Trophy className="h-5 w-5 text-primary" />
                    ) : (
                      <Brain className="h-5 w-5 text-primary" />
                    )}
                    <h3 className="font-semibold">
                      {hasPassed ? 'Quiz aprovado' : 'Teste seu conhecimento'}
                    </h3>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {quiz.quiz_questions.length} pergunta(s) • Nota mínima {quiz.passing_score}% •
                    +{quiz.xp_reward} XP
                    {bestAttempt && ` • Melhor: ${bestAttempt.score}%`}
                  </p>
                  <Button onClick={() => setQuizOpen(true)} className="w-full" size="sm">
                    {hasPassed ? 'Refazer quiz' : 'Iniciar quiz'}
                  </Button>
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <QuizRunner
          tutorialId={tutorial.id}
          open={quizOpen}
          onClose={() => setQuizOpen(false)}
        />


        {/* Footer - Mark Complete */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur-sm border-t border-border">
          <Button
            onClick={handleMarkComplete}
            disabled={isCompleted || isMarking}
            className={cn('w-full', isCompleted && 'bg-status-success hover:bg-status-success')}
          >
            {isMarking ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : isCompleted ? (
              <>
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Concluída
              </>
            ) : (
              'Marcar como concluída'
            )}
          </Button>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle2, XCircle, Loader2, Trophy, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { buildErrorToast } from '@/lib/toastError';
import { useTutorialQuiz } from '@/hooks/useTutorialQuiz';

interface QuizRunnerProps {
  tutorialId: string;
  open: boolean;
  onClose: () => void;
}

export function QuizRunner({ tutorialId, open, onClose }: QuizRunnerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const { quiz, isLoading, attempts, refetchAttempts } = useTutorialQuiz(tutorialId);

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
    perQuestion: Record<string, boolean>;
  } | null>(null);

  const questions = quiz?.quiz_questions || [];
  const current = questions[step];
  const attemptsUsed = attempts.length;
  const maxAttempts = quiz?.max_attempts ?? null;
  const canRetry = maxAttempts == null || attemptsUsed < maxAttempts;

  const reset = () => {
    setStep(0);
    setAnswers({});
    setResult(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async () => {
    if (!user || !quiz) return;
    setSubmitting(true);
    const answersPayload = questions.map((q) => ({
      question_id: q.id,
      option_id: answers[q.id] || null,
    }));
    const { data, error } = await supabase.rpc('submit_quiz_attempt' as never, {
      p_quiz_id: quiz.id,
      p_tutorial_id: tutorialId,
      p_answers: answersPayload,
    } as never);
    setSubmitting(false);
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao enviar', description: error.message });
      return;
    }
    const res = data as { score: number; passed: boolean; per_question: Array<{ question_id: string; correct: boolean }> };
    const perQ: Record<string, boolean> = {};
    (res.per_question || []).forEach((p) => {
      perQ[p.question_id] = !!p.correct;
    });
    setResult({ score: res.score, passed: res.passed, perQuestion: perQ });
    refetchAttempts();
    if (res.passed) toast({ title: 'Aprovado! 🎉', description: `+${quiz.xp_reward} XP` });
  };


  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz</DialogTitle>
        </DialogHeader>

        {isLoading || !quiz ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : result ? (
          <div className="text-center space-y-4 py-4">
            {result.passed ? (
              <Trophy className="h-16 w-16 mx-auto text-primary" />
            ) : (
              <XCircle className="h-16 w-16 mx-auto text-destructive" />
            )}
            <div>
              <h3 className="text-2xl font-bold">{result.score}%</h3>
              <p className="text-muted-foreground">
                {result.passed
                  ? `Aprovado! +${quiz.xp_reward} XP`
                  : `Nota mínima: ${quiz.passing_score}%`}
              </p>
            </div>
            <div className="space-y-2 text-left">
              {questions.map((q, i) => {
                const correct = result.perQuestion[q.id];

                return (
                  <div key={q.id} className="rounded-lg border border-border p-3 text-sm">
                    <div className="flex items-start gap-2">
                      {correct ? (
                        <CheckCircle2 className="h-4 w-4 mt-0.5 text-status-positive shrink-0" />
                      ) : (
                        <XCircle className="h-4 w-4 mt-0.5 text-destructive shrink-0" />
                      )}
                      <div>
                        <p className="font-medium">
                          {i + 1}. {q.question}
                        </p>
                        {q.explanation && (
                          <p className="text-xs text-muted-foreground mt-1">{q.explanation}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex gap-2">
              {!result.passed && canRetry && (
                <Button onClick={reset} variant="outline" className="flex-1">
                  <RotateCw className="h-4 w-4 mr-2" />
                  Tentar novamente
                </Button>
              )}
              <Button onClick={handleClose} className="flex-1">
                Fechar
              </Button>
            </div>
          </div>
        ) : questions.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            Quiz sem perguntas configuradas.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>
                  Pergunta {step + 1} de {questions.length}
                </span>
                <span>
                  Aprovação: {quiz.passing_score}% • +{quiz.xp_reward} XP
                </span>
              </div>
              <Progress value={((step + 1) / questions.length) * 100} />
            </div>

            <div>
              <h3 className="font-semibold mb-3">{current.question}</h3>
              <div className="space-y-2">
                {current.quiz_options.map((opt) => {
                  const selected = answers[current.id] === opt.id;
                  return (
                    <button
                      key={opt.id}
                      onClick={() => setAnswers({ ...answers, [current.id]: opt.id })}
                      className={cn(
                        'w-full text-left rounded-lg border p-3 text-sm transition-colors',
                        selected
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:bg-accent'
                      )}
                    >
                      {opt.text}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              {step > 0 && (
                <Button variant="outline" onClick={() => setStep(step - 1)} className="flex-1">
                  Anterior
                </Button>
              )}
              {step < questions.length - 1 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!answers[current.id]}
                  className="flex-1"
                >
                  Próxima
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    submitting ||
                    questions.some((q) => !answers[q.id])
                  }
                  className="flex-1"
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : null}
                  Enviar
                </Button>
              )}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card } from '@/components/ui/card';
import { Loader2, Plus, Trash2, Save } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Props {
  tutorialId: string;
  tutorialTitle: string;
  open: boolean;
  onClose: () => void;
}

interface DraftOption {
  id?: string;
  text: string;
  is_correct: boolean;
}
interface DraftQuestion {
  id?: string;
  question: string;
  explanation: string;
  options: DraftOption[];
}

export function QuizEditor({ tutorialId, tutorialTitle, open, onClose }: Props) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [quizId, setQuizId] = useState<string | null>(null);
  const [passingScore, setPassingScore] = useState(70);
  const [xpReward, setXpReward] = useState(30);
  const [maxAttempts, setMaxAttempts] = useState<string>('');
  const [questions, setQuestions] = useState<DraftQuestion[]>([]);

  useEffect(() => {
    if (!open) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('tutorial_quizzes')
        .select(`
          id, passing_score, xp_reward, max_attempts,
          quiz_questions (
            id, question, explanation, order_index,
            quiz_options ( id, text, is_correct, order_index )
          )
        `)
        .eq('tutorial_id', tutorialId)
        .maybeSingle();
      if (data) {
        setQuizId(data.id);
        setPassingScore(data.passing_score);
        setXpReward(data.xp_reward);
        setMaxAttempts(data.max_attempts?.toString() || '');
        setQuestions(
          [...(data.quiz_questions || [])]
            .sort((a, b) => a.order_index - b.order_index)
            .map((q) => ({
              id: q.id,
              question: q.question,
              explanation: q.explanation || '',
              options: [...(q.quiz_options || [])]
                .sort((a, b) => a.order_index - b.order_index)
                .map((o) => ({ id: o.id, text: o.text, is_correct: o.is_correct })),
            }))
        );
      } else {
        setQuizId(null);
        setPassingScore(70);
        setXpReward(30);
        setMaxAttempts('');
        setQuestions([]);
      }
      setLoading(false);
    })();
  }, [open, tutorialId]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        question: '',
        explanation: '',
        options: [
          { text: '', is_correct: true },
          { text: '', is_correct: false },
        ],
      },
    ]);
  };

  const updateQuestion = (idx: number, patch: Partial<DraftQuestion>) => {
    setQuestions(questions.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  };

  const addOption = (qIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, { options: [...q.options, { text: '', is_correct: false }] });
  };

  const updateOption = (qIdx: number, oIdx: number, patch: Partial<DraftOption>) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, {
      options: q.options.map((o, i) => (i === oIdx ? { ...o, ...patch } : o)),
    });
  };

  const setCorrect = (qIdx: number, oIdx: number) => {
    const q = questions[qIdx];
    updateQuestion(qIdx, {
      options: q.options.map((o, i) => ({ ...o, is_correct: i === oIdx })),
    });
  };

  const handleSave = async () => {
    // validation
    for (const q of questions) {
      if (!q.question.trim()) {
        toast({ variant: 'destructive', title: 'Pergunta vazia' });
        return;
      }
      if (q.options.length < 2 || !q.options.some((o) => o.is_correct)) {
        toast({
          variant: 'destructive',
          title: 'Cada pergunta precisa de ≥2 opções e 1 correta',
        });
        return;
      }
    }
    setSaving(true);
    try {
      // upsert quiz
      let currentQuizId = quizId;
      if (!currentQuizId) {
        const { data, error } = await supabase
          .from('tutorial_quizzes')
          .insert({
            tutorial_id: tutorialId,
            passing_score: passingScore,
            xp_reward: xpReward,
            max_attempts: maxAttempts ? parseInt(maxAttempts) : null,
          })
          .select('id')
          .single();
        if (error) throw error;
        currentQuizId = data.id;
        setQuizId(currentQuizId);
      } else {
        const { error } = await supabase
          .from('tutorial_quizzes')
          .update({
            passing_score: passingScore,
            xp_reward: xpReward,
            max_attempts: maxAttempts ? parseInt(maxAttempts) : null,
          })
          .eq('id', currentQuizId);
        if (error) throw error;
      }

      // Wipe & recreate questions (simplest)
      await supabase.from('quiz_questions').delete().eq('quiz_id', currentQuizId);

      for (let qi = 0; qi < questions.length; qi++) {
        const q = questions[qi];
        const { data: qData, error: qErr } = await supabase
          .from('quiz_questions')
          .insert({
            quiz_id: currentQuizId,
            question: q.question,
            explanation: q.explanation || null,
            order_index: qi,
          })
          .select('id')
          .single();
        if (qErr) throw qErr;
        const optionsPayload = q.options.map((o, oi) => ({
          question_id: qData.id,
          text: o.text,
          is_correct: o.is_correct,
          order_index: oi,
        }));
        const { error: oErr } = await supabase.from('quiz_options').insert(optionsPayload);
        if (oErr) throw oErr;
      }

      toast({ title: 'Quiz salvo' });
      onClose();
    } catch (e: any) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: e.message });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!quizId) return;
    if (!confirm('Excluir o quiz inteiro?')) return;
    await supabase.from('tutorial_quizzes').delete().eq('id', quizId);
    toast({ title: 'Quiz excluído' });
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quiz — {tutorialTitle}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <Label>Nota mínima (%)</Label>
                <Input
                  type="number"
                  min={1}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>XP ao aprovar</Label>
                <Input
                  type="number"
                  min={0}
                  value={xpReward}
                  onChange={(e) => setXpReward(parseInt(e.target.value) || 0)}
                />
              </div>
              <div>
                <Label>Máx. tentativas</Label>
                <Input
                  type="number"
                  min={1}
                  placeholder="∞"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-3">
              {questions.map((q, qi) => (
                <Card key={qi} className="p-3 space-y-3">
                  <div className="flex items-start gap-2">
                    <span className="text-sm font-bold mt-2">{qi + 1}.</span>
                    <div className="flex-1 space-y-2">
                      <Input
                        placeholder="Pergunta"
                        value={q.question}
                        onChange={(e) => updateQuestion(qi, { question: e.target.value })}
                      />
                      <Textarea
                        placeholder="Explicação (opcional, mostrada após o envio)"
                        value={q.explanation}
                        rows={2}
                        onChange={(e) => updateQuestion(qi, { explanation: e.target.value })}
                      />
                    </div>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setQuestions(questions.filter((_, i) => i !== qi))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                  <div className="space-y-1.5 pl-6">
                    {q.options.map((o, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <Checkbox
                          checked={o.is_correct}
                          onCheckedChange={() => setCorrect(qi, oi)}
                        />
                        <Input
                          placeholder={`Opção ${oi + 1}`}
                          value={o.text}
                          onChange={(e) => updateOption(qi, oi, { text: e.target.value })}
                        />
                        {q.options.length > 2 && (
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() =>
                              updateQuestion(qi, {
                                options: q.options.filter((_, i) => i !== oi),
                              })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button size="sm" variant="ghost" onClick={() => addOption(qi)}>
                      <Plus className="h-3 w-3 mr-1" /> Opção
                    </Button>
                  </div>
                </Card>
              ))}
            </div>

            <Button variant="outline" onClick={addQuestion} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Adicionar pergunta
            </Button>

            <div className="flex gap-2">
              {quizId && (
                <Button variant="destructive" onClick={handleDelete}>
                  <Trash2 className="h-4 w-4 mr-2" /> Excluir quiz
                </Button>
              )}
              <Button onClick={handleSave} disabled={saving} className="flex-1">
                {saving ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar quiz
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

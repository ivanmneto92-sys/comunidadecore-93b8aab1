import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface QuizOption {
  id: string;
  text: string;
  order_index: number;
}
export interface QuizQuestion {
  id: string;
  question: string;
  explanation: string | null;
  order_index: number;
  quiz_options: QuizOption[];
}
export interface TutorialQuiz {
  id: string;
  tutorial_id: string;
  passing_score: number;
  xp_reward: number;
  max_attempts: number | null;
  quiz_questions: QuizQuestion[];
}
export interface QuizAttempt {
  id: string;
  score: number;
  passed: boolean;
  created_at: string;
}

export function useTutorialQuiz(tutorialId: string | undefined) {
  const { user } = useAuth();

  const quizQuery = useQuery({
    queryKey: ['tutorial-quiz', tutorialId],
    queryFn: async (): Promise<TutorialQuiz | null> => {
      if (!tutorialId) return null;
      const { data: quiz, error } = await supabase
        .from('tutorial_quizzes')
        .select(`
          id, tutorial_id, passing_score, xp_reward, max_attempts,
          quiz_questions ( id, question, explanation, order_index )
        `)
        .eq('tutorial_id', tutorialId)
        .maybeSingle();
      if (error) throw error;
      if (!quiz) return null;

      const questionIds = ((quiz.quiz_questions as Array<{ id: string }>) || []).map((q) => q.id);
      let optionsByQ: Record<string, QuizOption[]> = {};
      if (questionIds.length > 0) {
        // Read from view that omits is_correct
        const { data: opts, error: optErr } = await (supabase as unknown as {
          from: (t: string) => {
            select: (s: string) => {
              in: (col: string, vals: string[]) => Promise<{ data: Array<QuizOption & { question_id: string }> | null; error: unknown }>;
            };
          };
        })
          .from('quiz_options_public')
          .select('id, question_id, text, order_index')
          .in('question_id', questionIds);
        if (optErr) throw optErr as Error;
        optionsByQ = (opts ?? []).reduce<Record<string, QuizOption[]>>((acc, o) => {
          (acc[o.question_id] ||= []).push({ id: o.id, text: o.text, order_index: o.order_index });
          return acc;
        }, {});
      }

      const sorted: TutorialQuiz = {
        id: quiz.id,
        tutorial_id: quiz.tutorial_id,
        passing_score: quiz.passing_score,
        xp_reward: quiz.xp_reward,
        max_attempts: quiz.max_attempts,
        quiz_questions: ([...(quiz.quiz_questions as QuizQuestion[] || [])])
          .sort((a, b) => a.order_index - b.order_index)
          .map((q) => ({
            ...q,
            quiz_options: (optionsByQ[q.id] || []).sort((a, b) => a.order_index - b.order_index),
          })),
      };
      return sorted;
    },
    enabled: !!tutorialId,
  });

  const attemptsQuery = useQuery({
    queryKey: ['quiz-attempts', tutorialId, user?.id],
    queryFn: async (): Promise<QuizAttempt[]> => {
      if (!tutorialId || !user) return [];
      const { data, error } = await supabase
        .from('quiz_attempts')
        .select('id, score, passed, created_at')
        .eq('tutorial_id', tutorialId)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!tutorialId && !!user,
  });

  return {
    quiz: quizQuery.data,
    isLoading: quizQuery.isLoading,
    attempts: attemptsQuery.data || [],
    bestAttempt:
      attemptsQuery.data?.reduce<QuizAttempt | null>(
        (best, a) => (!best || a.score > best.score ? a : best),
        null
      ) || null,
    hasPassed: !!attemptsQuery.data?.some((a) => a.passed),
    refetchAttempts: attemptsQuery.refetch,
  };
}

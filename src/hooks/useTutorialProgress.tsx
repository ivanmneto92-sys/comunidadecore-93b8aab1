import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface TutorialProgress {
  tutorial_id: string;
  completed_at: string | null;
}

interface TutorialStats {
  total: number;
  completed: number;
  percentage: number;
  nextTutorialId: string | null;
}

export function useTutorialProgress(tutorialIds: string[]) {
  const { user } = useAuth();
  const [progress, setProgress] = useState<TutorialProgress[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || tutorialIds.length === 0) {
      setLoading(false);
      return;
    }

    const fetchProgress = async () => {
      try {
        const { data, error } = await supabase
          .from('tutorial_progress')
          .select('tutorial_id, completed_at')
          .eq('user_id', user.id)
          .in('tutorial_id', tutorialIds);

        if (error) throw error;
        setProgress(data || []);
      } catch (error) {
        console.error('Error fetching tutorial progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, [user, tutorialIds.join(',')]);

  const isCompleted = (tutorialId: string): boolean => {
    return progress.some(p => p.tutorial_id === tutorialId && p.completed_at !== null);
  };

  const markAsCompleted = async (tutorialId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('tutorial_progress')
        .upsert({
          user_id: user.id,
          tutorial_id: tutorialId,
          completed_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,tutorial_id'
        });

      if (error) throw error;

      setProgress(prev => {
        const existing = prev.find(p => p.tutorial_id === tutorialId);
        if (existing) {
          return prev.map(p => 
            p.tutorial_id === tutorialId 
              ? { ...p, completed_at: new Date().toISOString() }
              : p
          );
        }
        return [...prev, { tutorial_id: tutorialId, completed_at: new Date().toISOString() }];
      });

      return true;
    } catch (error) {
      console.error('Error marking tutorial as completed:', error);
      return false;
    }
  };

  const getStats = (): TutorialStats => {
    const completedCount = tutorialIds.filter(id => isCompleted(id)).length;
    const nextTutorial = tutorialIds.find(id => !isCompleted(id)) || null;

    return {
      total: tutorialIds.length,
      completed: completedCount,
      percentage: tutorialIds.length > 0 ? Math.round((completedCount / tutorialIds.length) * 100) : 0,
      nextTutorialId: nextTutorial,
    };
  };

  return {
    progress,
    loading,
    isCompleted,
    markAsCompleted,
    getStats,
  };
}

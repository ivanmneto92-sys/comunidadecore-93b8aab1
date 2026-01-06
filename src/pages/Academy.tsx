import { useState, useEffect, useMemo } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { GraduationCap, Loader2 } from 'lucide-react';
import { AcademyProgressCard } from '@/components/academy/AcademyProgressCard';
import { ContinueLearningCard } from '@/components/academy/ContinueLearningCard';
import { CategoryTabs } from '@/components/academy/CategoryTabs';
import { TutorialCard } from '@/components/academy/TutorialCard';
import { TutorialDetailModal } from '@/components/academy/TutorialDetailModal';

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

const tierLabels: Record<string, { label: string; color: string }> = {
  free: { label: 'Grátis', color: 'bg-muted text-muted-foreground' },
  plus: { label: 'Plus', color: 'bg-status-warning/20 text-status-warning' },
  elite: { label: 'Elite', color: 'bg-primary/20 text-primary' },
};

export default function Academy() {
  const [tutorials, setTutorials] = useState<Tutorial[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const { membership } = useUserProfile();

  const tutorialIds = useMemo(() => tutorials.map((t) => t.id), [tutorials]);
  const { isCompleted, markAsCompleted, getStats, loading: progressLoading } = useTutorialProgress(tutorialIds);

  useEffect(() => {
    const fetchTutorials = async () => {
      try {
        const { data, error } = await supabase
          .from('tutorials')
          .select('id, title, slug, description, category, tier_required, content, video_url')
          .eq('is_published', true)
          .order('sort_order', { ascending: true });

        if (error) throw error;
        setTutorials((data || []) as Tutorial[]);
      } catch (error) {
        console.error('Error fetching tutorials:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTutorials();
  }, []);

  const canAccess = (tierRequired: string) => {
    if (tierRequired === 'free') return true;
    if (membership === 'elite') return true;
    if (membership === 'plus' && (tierRequired === 'free' || tierRequired === 'plus')) return true;
    return false;
  };

  // Get unique categories
  const categories = useMemo(() => {
    const cats = [...new Set(tutorials.map((t) => t.category))];
    const order = ['beginner', 'intermediate', 'advanced'];
    return cats.sort((a, b) => order.indexOf(a) - order.indexOf(b));
  }, [tutorials]);

  // Count tutorials per category
  const tutorialCounts = useMemo(() => {
    return tutorials.reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }, [tutorials]);

  // Filter tutorials by category
  const filteredTutorials = useMemo(() => {
    if (!activeCategory) return tutorials;
    return tutorials.filter((t) => t.category === activeCategory);
  }, [tutorials, activeCategory]);

  // Get stats
  const stats = getStats();

  // Find next tutorial to continue
  const nextTutorial = useMemo(() => {
    return tutorials.find((t) => !isCompleted(t.id) && canAccess(t.tier_required));
  }, [tutorials, isCompleted]);

  // Navigation for modal
  const currentIndex = selectedTutorial
    ? filteredTutorials.findIndex((t) => t.id === selectedTutorial.id)
    : -1;

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setSelectedTutorial(filteredTutorials[currentIndex - 1]);
    }
  };

  const handleNext = () => {
    if (currentIndex < filteredTutorials.length - 1) {
      setSelectedTutorial(filteredTutorials[currentIndex + 1]);
    }
  };

  if (loading || progressLoading) {
    return (
      <AppLayout>
        <div className="flex min-h-screen items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div
          className="flex items-center gap-3 animate-fade-in"
          style={{ animationDelay: '0ms' }}
        >
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20">
            <GraduationCap className="h-7 w-7 text-primary-foreground" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl font-bold">Academia CORE</h1>
            <p className="text-sm text-muted-foreground">Aprenda sobre copy trading</p>
          </div>
          <Badge className={tierLabels[membership]?.color}>
            {tierLabels[membership]?.label}
          </Badge>
        </div>

        {/* Progress bar */}
        <div
          className="space-y-2 animate-fade-in"
          style={{ animationDelay: '50ms' }}
        >
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progresso geral</span>
            <span className="font-medium text-primary">{stats.percentage}%</span>
          </div>
          <Progress value={stats.percentage} className="h-2" />
        </div>

        {/* Progress Card */}
        <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
          <AcademyProgressCard
            percentage={stats.percentage}
            completed={stats.completed}
            total={stats.total}
            nextTutorialTitle={nextTutorial?.title}
          />
        </div>

        {/* Continue Learning */}
        {nextTutorial && (
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <ContinueLearningCard
              tutorial={nextTutorial}
              hasAccess={canAccess(nextTutorial.tier_required)}
              onSelect={() => setSelectedTutorial(nextTutorial)}
            />
          </div>
        )}

        {/* Category Tabs */}
        <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            tutorialCounts={tutorialCounts}
          />
        </div>

        {/* Tutorial Cards */}
        <div className="grid gap-3">
          {filteredTutorials.map((tutorial, index) => (
            <TutorialCard
              key={tutorial.id}
              tutorial={tutorial}
              hasAccess={canAccess(tutorial.tier_required)}
              isCompleted={isCompleted(tutorial.id)}
              onSelect={() => canAccess(tutorial.tier_required) && setSelectedTutorial(tutorial)}
              className="animate-fade-in"
              style={{ animationDelay: `${250 + index * 50}ms` }}
            />
          ))}
        </div>

        {tutorials.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-8">
            Nenhum tutorial disponível ainda.
          </p>
        )}
      </div>

      {/* Tutorial Detail Modal */}
      <TutorialDetailModal
        tutorial={selectedTutorial}
        isOpen={!!selectedTutorial}
        onClose={() => setSelectedTutorial(null)}
        isCompleted={selectedTutorial ? isCompleted(selectedTutorial.id) : false}
        onMarkComplete={async () => {
          if (selectedTutorial) {
            await markAsCompleted(selectedTutorial.id);
          }
        }}
        onPrevious={handlePrevious}
        onNext={handleNext}
        hasPrevious={currentIndex > 0}
        hasNext={currentIndex < filteredTutorials.length - 1}
      />
    </AppLayout>
  );
}

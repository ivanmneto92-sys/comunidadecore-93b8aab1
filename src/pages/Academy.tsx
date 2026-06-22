import { useState, useMemo } from 'react';
import { GraduationCap, Lock } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useTutorialProgress } from '@/hooks/useTutorialProgress';
import { AppLayout } from '@/components/layout/AppLayout';
import { ContinueLearningCard } from '@/components/academy/ContinueLearningCard';
import { CategoryTabs } from '@/components/academy/CategoryTabs';
import { TutorialCard } from '@/components/academy/TutorialCard';
import { TutorialDetailModal } from '@/components/academy/TutorialDetailModal';
import { Skeleton } from '@/components/ui/skeleton';
import { hasTierAccess } from '@/lib/plans';

interface TutorialCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
  sort_order: number;
}

interface Tutorial {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  category_id: string | null;
  tier_required: 'free' | 'plus' | 'elite';
  content: string | null;
  video_url: string | null;
  cta_url: string | null;
  cta_label: string | null;
  sort_order: number;
}

export default function Academy() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [selectedTutorial, setSelectedTutorial] = useState<Tutorial | null>(null);
  const { membership } = useUserProfile();

  // Fetch categories
  const { data: categories = [] } = useQuery({
    queryKey: ['tutorial-categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorial_categories')
        .select('id, name, slug, icon, sort_order')
        .eq('is_visible', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as TutorialCategory[];
    },
  });

  // Fetch tutorials
  const { data: tutorials = [], isLoading } = useQuery({
    queryKey: ['tutorials'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tutorials')
        .select('id, title, slug, description, category_id, tier_required, content, video_url, cta_url, cta_label, sort_order')
        .eq('is_published', true)
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return (data || []) as unknown as Tutorial[];
    },
  });

  const tutorialIds = useMemo(() => tutorials.map((t) => t.id), [tutorials]);
  const { isCompleted, markAsCompleted, getStats, loading: progressLoading } = useTutorialProgress(tutorialIds);

  const canAccess = (tierRequired: string) =>
    hasTierAccess(membership, tierRequired as 'free' | 'plus' | 'elite');

  // Count tutorials per category
  const tutorialCounts = useMemo(() => {
    return tutorials.reduce((acc, t) => {
      if (t.category_id) {
        acc[t.category_id] = (acc[t.category_id] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);
  }, [tutorials]);

  // Filter tutorials by category
  const filteredTutorials = useMemo(() => {
    if (!activeCategory) return tutorials;
    return tutorials.filter((t) => t.category_id === activeCategory);
  }, [tutorials, activeCategory]);

  // Get stats
  const stats = getStats();

  // Find next tutorial to continue (respecting category order)
  const nextTutorial = useMemo(() => {
    // Sort tutorials by category order, then by tutorial sort_order
    const categoryOrder = new Map(categories.map((c, i) => [c.id, i]));
    const sortedTutorials = [...tutorials].sort((a, b) => {
      const catOrderA = a.category_id ? categoryOrder.get(a.category_id) ?? 999 : 999;
      const catOrderB = b.category_id ? categoryOrder.get(b.category_id) ?? 999 : 999;
      if (catOrderA !== catOrderB) return catOrderA - catOrderB;
      return a.sort_order - b.sort_order;
    });
    return sortedTutorials.find((t) => !isCompleted(t.id) && canAccess(t.tier_required));
  }, [tutorials, categories, isCompleted, membership]);

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

  if (isLoading || progressLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-48 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-lg" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24">
        {/* Compact Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/50">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              <h1 className="text-lg font-semibold">Academia</h1>
            </div>
            <span className="text-sm text-muted-foreground">
              {stats.completed}/{stats.total} concluídas
            </span>
          </div>
        </div>

        <div className="p-4 space-y-5">
          {/* Hero Card - Continue Learning */}
          {nextTutorial && (
            <ContinueLearningCard
              tutorial={nextTutorial}
              hasAccess={canAccess(nextTutorial.tier_required)}
              onSelect={() => setSelectedTutorial(nextTutorial)}
              progress={{ completed: stats.completed, total: stats.total }}
            />
          )}

          {/* Category Tabs - Dynamic from DB */}
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            tutorialCounts={tutorialCounts}
          />

          {/* Tutorial List - Compact Format */}
          <div className="space-y-2">
            {filteredTutorials.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Lock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Nenhum tutorial disponível</p>
              </div>
            ) : (
              filteredTutorials.map((tutorial) => (
                <TutorialCard
                  key={tutorial.id}
                  tutorial={tutorial}
                  hasAccess={canAccess(tutorial.tier_required)}
                  isCompleted={isCompleted(tutorial.id)}
                  onSelect={() => canAccess(tutorial.tier_required) && setSelectedTutorial(tutorial)}
                />
              ))
            )}
          </div>
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
      </div>
    </AppLayout>
  );
}

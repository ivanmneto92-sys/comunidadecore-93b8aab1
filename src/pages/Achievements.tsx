import { useState, useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useAchievements } from '@/hooks/useAchievements';
import { AchievementProgressCard } from '@/components/achievements/AchievementProgressCard';
import { AchievementCard } from '@/components/achievements/AchievementCard';
import { AchievementDetailModal } from '@/components/achievements/AchievementDetailModal';
import { CategoryFilter } from '@/components/achievements/CategoryFilter';

export default function Achievements() {
  const navigate = useNavigate();
  const { achievements, isLoading, stats } = useAchievements();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedAchievement, setSelectedAchievement] = useState<typeof achievements[0] | null>(null);

  // Filter achievements by category
  const filteredAchievements = useMemo(() => {
    if (selectedCategory === 'all') return achievements;
    return achievements.filter((a) => a.category === selectedCategory);
  }, [achievements, selectedCategory]);

  // Calculate category counts
  const categoryCounts = useMemo(() => {
    const counts: Record<string, { unlocked: number; total: number }> = {
      all: { unlocked: stats.unlockedCount, total: stats.totalCount },
    };

    achievements.forEach((a) => {
      if (!counts[a.category]) {
        counts[a.category] = { unlocked: 0, total: 0 };
      }
      counts[a.category].total++;
      if (a.isUnlocked) {
        counts[a.category].unlocked++;
      }
    });

    return counts;
  }, [achievements, stats]);

  // Sort: unlocked first, then by sort_order
  const sortedAchievements = useMemo(() => {
    return [...filteredAchievements].sort((a, b) => {
      if (a.isUnlocked !== b.isUnlocked) {
        return a.isUnlocked ? -1 : 1;
      }
      return a.sort_order - b.sort_order;
    });
  }, [filteredAchievements]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-4 space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <Skeleton key={i} className="h-36" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button aria-label="Voltar"
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={() => navigate(-1)}
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Conquistas</h1>
        </div>
      </header>

      <main className="p-4 pb-24 space-y-4">
        {/* Progress Card */}
        <AchievementProgressCard
          unlockedCount={stats.unlockedCount}
          totalCount={stats.totalCount}
          percentage={stats.percentage}
          totalXpEarned={stats.totalXpEarned}
        />

        {/* Category Filter */}
        <CategoryFilter
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          categoryCounts={categoryCounts}
        />

        {/* Achievements Grid */}
        <div className="grid grid-cols-3 gap-3">
          {sortedAchievements.map((achievement) => (
            <AchievementCard
              key={achievement.id}
              name={achievement.name}
              description={achievement.description}
              icon={achievement.icon}
              rarity={achievement.rarity}
              xpReward={achievement.xp_reward}
              isUnlocked={achievement.isUnlocked}
              progress={achievement.progress}
              onClick={() => setSelectedAchievement(achievement)}
            />
          ))}
        </div>

        {sortedAchievements.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            Nenhuma conquista nesta categoria.
          </div>
        )}
      </main>

      {/* Detail Modal */}
      <AchievementDetailModal
        open={!!selectedAchievement}
        onOpenChange={(open) => !open && setSelectedAchievement(null)}
        achievement={selectedAchievement ? {
          name: selectedAchievement.name,
          description: selectedAchievement.description,
          icon: selectedAchievement.icon,
          category: selectedAchievement.category,
          rarity: selectedAchievement.rarity,
          xpReward: selectedAchievement.xp_reward,
          isUnlocked: selectedAchievement.isUnlocked,
          unlockedAt: selectedAchievement.unlockedAt,
          progress: selectedAchievement.progress,
        } : null}
      />
    </div>
  );
}

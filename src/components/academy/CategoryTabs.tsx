import { cn } from '@/lib/utils';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  tutorialCounts: Record<string, number>;
}

const categoryConfig: Record<string, { label: string; icon: string }> = {
  beginner: { label: 'Iniciante', icon: '🌱' },
  intermediate: { label: 'Intermediário', icon: '📈' },
  advanced: { label: 'Avançado', icon: '🎯' },
};

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  tutorialCounts,
}: CategoryTabsProps) {
  const allCount = Object.values(tutorialCounts).reduce((a, b) => a + b, 0);

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-2 pb-2">
        {/* All tab */}
        <button
          onClick={() => onCategoryChange(null)}
          className={cn(
            'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all',
            activeCategory === null
              ? 'bg-primary text-primary-foreground'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
          )}
        >
          <span>📚</span>
          <span>Todos</span>
          <span className={cn(
            'rounded-full px-2 py-0.5 text-xs',
            activeCategory === null
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-background text-muted-foreground'
          )}>
            {allCount}
          </span>
        </button>

        {/* Category tabs */}
        {categories.map((category) => {
          const config = categoryConfig[category] || { label: category, icon: '📖' };
          const count = tutorialCounts[category] || 0;

          return (
            <button
              key={category}
              onClick={() => onCategoryChange(category)}
              className={cn(
                'flex items-center gap-2 whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition-all',
                activeCategory === category
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <span>{config.icon}</span>
              <span>{config.label}</span>
              <span className={cn(
                'rounded-full px-2 py-0.5 text-xs',
                activeCategory === category
                  ? 'bg-primary-foreground/20 text-primary-foreground'
                  : 'bg-background text-muted-foreground'
              )}>
                {count}
              </span>
            </button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

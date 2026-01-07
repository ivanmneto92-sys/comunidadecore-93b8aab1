import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { categoryLabels } from '@/lib/achievementDefinitions';
import { cn } from '@/lib/utils';

interface CategoryFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  categoryCounts: Record<string, { unlocked: number; total: number }>;
}

const categoryOrder = ['all', 'consistency', 'learning', 'community', 'performance', 'affiliates', 'special'];

export function CategoryFilter({
  selectedCategory,
  onCategoryChange,
  categoryCounts,
}: CategoryFilterProps) {
  return (
    <ScrollArea className="w-full whitespace-nowrap">
      <div className="flex gap-2 pb-2">
        {categoryOrder.map((category) => {
          const counts = categoryCounts[category] || { unlocked: 0, total: 0 };
          const isSelected = selectedCategory === category;

          return (
            <Button
              key={category}
              variant={isSelected ? 'default' : 'outline'}
              size="sm"
              className={cn(
                'rounded-full flex-shrink-0',
                !isSelected && 'bg-background'
              )}
              onClick={() => onCategoryChange(category)}
            >
              {categoryLabels[category]}
              {category !== 'all' && (
                <span className={cn(
                  'ml-1 text-xs',
                  isSelected ? 'text-primary-foreground/70' : 'text-muted-foreground'
                )}>
                  {counts.unlocked}/{counts.total}
                </span>
              )}
            </Button>
          );
        })}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
}

import { cn } from '@/lib/utils';

interface CategoryTabsProps {
  categories: string[];
  activeCategory: string | null;
  onCategoryChange: (category: string | null) => void;
  tutorialCounts: Record<string, number>;
}

const categoryConfig: Record<string, { label: string }> = {
  beginner: { label: 'Iniciante' },
  intermediate: { label: 'Intermed.' },
  advanced: { label: 'Avançado' },
};

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  tutorialCounts,
}: CategoryTabsProps) {
  const totalCount = Object.values(tutorialCounts).reduce((a, b) => a + b, 0);

  // Build tabs: All + existing categories in order
  const orderedCategories = ['beginner', 'intermediate', 'advanced'].filter(
    (cat) => categories.includes(cat)
  );

  const tabs = [
    { key: null, label: 'Todos', count: totalCount },
    ...orderedCategories.map((key) => ({
      key,
      label: categoryConfig[key]?.label || key,
      count: tutorialCounts[key] || 0,
    })),
  ];

  const gridCols = Math.min(tabs.length, 4);

  return (
    <div className="bg-muted/30 p-1 rounded-lg">
      <div
        className="grid gap-1"
        style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
      >
        {tabs.slice(0, 4).map((tab) => {
          const isActive = activeCategory === tab.key;

          return (
            <button
              key={tab.key ?? 'all'}
              onClick={() => onCategoryChange(tab.key)}
              className={cn(
                'flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors',
                isActive
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <span className="truncate">{tab.label}</span>
              <span
                className={cn(
                  'text-[10px] mt-0.5',
                  isActive ? 'text-primary' : 'text-muted-foreground/70'
                )}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

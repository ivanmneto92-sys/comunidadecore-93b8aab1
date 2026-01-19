import { cn } from '@/lib/utils';

interface TutorialCategory {
  id: string;
  name: string;
  slug: string;
  icon: string | null;
}

interface CategoryTabsProps {
  categories: TutorialCategory[];
  activeCategory: string | null;
  onCategoryChange: (categoryId: string | null) => void;
  tutorialCounts: Record<string, number>;
}

export function CategoryTabs({
  categories,
  activeCategory,
  onCategoryChange,
  tutorialCounts,
}: CategoryTabsProps) {
  const totalCount = Object.values(tutorialCounts).reduce((a, b) => a + b, 0);

  const tabs = [
    { key: null, label: 'Todos', count: totalCount, icon: null },
    ...categories.map((cat) => ({
      key: cat.id,
      label: cat.name,
      count: tutorialCounts[cat.id] || 0,
      icon: cat.icon,
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
              {tab.icon && <span className="text-base mb-0.5">{tab.icon}</span>}
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
      {/* Show more tabs if needed */}
      {tabs.length > 4 && (
        <div className="grid gap-1 mt-1" style={{ gridTemplateColumns: `repeat(${Math.min(tabs.length - 4, 4)}, minmax(0, 1fr))` }}>
          {tabs.slice(4).map((tab) => {
            const isActive = activeCategory === tab.key;

            return (
              <button
                key={tab.key ?? 'extra'}
                onClick={() => onCategoryChange(tab.key)}
                className={cn(
                  'flex flex-col items-center justify-center py-2 px-1 rounded-md text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {tab.icon && <span className="text-base mb-0.5">{tab.icon}</span>}
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
      )}
    </div>
  );
}

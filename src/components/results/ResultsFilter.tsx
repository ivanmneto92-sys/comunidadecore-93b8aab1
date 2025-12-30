import { cn } from '@/lib/utils';
import { FilterPeriod } from '@/hooks/useAccountMetrics';

interface ResultsFilterProps {
  value: FilterPeriod;
  onChange: (value: FilterPeriod) => void;
}

const filters: { value: FilterPeriod; label: string }[] = [
  { value: '7d', label: '7 Dias' },
  { value: '30d', label: '30 Dias' },
  { value: '90d', label: '90 Dias' },
  { value: 'ytd', label: 'Este Ano' },
];

export function ResultsFilter({ value, onChange }: ResultsFilterProps) {
  return (
    <div className="grid grid-cols-4 gap-1 p-1 bg-muted/50 rounded-lg">
      {filters.map((filter) => (
        <button
          key={filter.value}
          onClick={() => onChange(filter.value)}
          className={cn(
            'px-3 py-2 text-xs font-medium rounded-md transition-all duration-200',
            value === filter.value
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}

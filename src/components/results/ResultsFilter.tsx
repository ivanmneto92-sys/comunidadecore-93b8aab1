import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FilterPeriod } from '@/pages/Results';

interface ResultsFilterProps {
  value: FilterPeriod;
  onChange: (value: FilterPeriod) => void;
}

const filters: { value: FilterPeriod; label: string }[] = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: 'ytd', label: 'YTD' },
];

export function ResultsFilter({ value, onChange }: ResultsFilterProps) {
  return (
    <div className="flex gap-2">
      {filters.map((filter) => (
        <Button
          key={filter.value}
          variant={value === filter.value ? 'default' : 'secondary'}
          size="sm"
          onClick={() => onChange(filter.value)}
          className={cn(
            'flex-1',
            value === filter.value && 'ring-1 ring-primary/50'
          )}
        >
          {filter.label}
        </Button>
      ))}
    </div>
  );
}

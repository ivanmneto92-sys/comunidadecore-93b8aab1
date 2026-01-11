import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Megaphone, BarChart3, LayoutGrid, Pin } from 'lucide-react';

export type PostFilter = 'all' | 'announcement' | 'daily_result';
export type SortOrder = 'recent' | 'pinned';

interface FeedFiltersProps {
  activeFilter: PostFilter;
  onFilterChange: (filter: PostFilter) => void;
  sortOrder: SortOrder;
  onSortChange: (order: SortOrder) => void;
}

const filters: { value: PostFilter; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'Todos', icon: <LayoutGrid className="h-4 w-4" /> },
  { value: 'announcement', label: 'Anúncios', icon: <Megaphone className="h-4 w-4" /> },
  { value: 'daily_result', label: 'Resultados', icon: <BarChart3 className="h-4 w-4" /> },
];

export function FeedFilters({ activeFilter, onFilterChange, sortOrder, onSortChange }: FeedFiltersProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
        {filters.map((filter) => (
          <Button
            key={filter.value}
            variant={activeFilter === filter.value ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange(filter.value)}
            className="flex items-center gap-2 shrink-0"
          >
            {filter.icon}
            <span>{filter.label}</span>
          </Button>
        ))}
      </div>

      <div className="flex items-center gap-2">
        <Select value={sortOrder} onValueChange={(v) => onSortChange(v as SortOrder)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Ordenar por" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="recent">
              <span className="flex items-center gap-2">Mais recentes</span>
            </SelectItem>
            <SelectItem value="pinned">
              <span className="flex items-center gap-2">
                <Pin className="h-3 w-3" /> Fixados primeiro
              </span>
            </SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

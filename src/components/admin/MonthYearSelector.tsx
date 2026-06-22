import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { format, setMonth, setYear } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface MonthYearSelectorProps {
  currentMonth: Date;
  onMonthChange: (month: Date) => void;
  minYear?: number;
  maxYear?: number;
}

const MONTHS = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

export function MonthYearSelector({
  currentMonth,
  onMonthChange,
  minYear = 2024,
  maxYear = new Date().getFullYear() + 1,
}: MonthYearSelectorProps) {
  const currentYear = currentMonth.getFullYear();
  const currentMonthIndex = currentMonth.getMonth();

  const years = Array.from(
    { length: maxYear - minYear + 1 },
    (_, i) => minYear + i
  );

  const handleMonthSelect = (monthIndex: string) => {
    const newDate = setMonth(currentMonth, parseInt(monthIndex));
    onMonthChange(newDate);
  };

  const handleYearSelect = (year: string) => {
    const newDate = setYear(currentMonth, parseInt(year));
    onMonthChange(newDate);
  };

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    onMonthChange(newDate);
  };

  const goToToday = () => {
    onMonthChange(new Date());
  };

  return (
    <div className="flex items-center justify-between gap-2 mb-4">
      <div className="flex items-center gap-1">
        <Button aria-label="Voltar"
          variant="outline"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button aria-label="Avançar"
          variant="outline"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Select value={String(currentMonthIndex)} onValueChange={handleMonthSelect}>
          <SelectTrigger className="w-32 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((month, index) => (
              <SelectItem key={index} value={String(index)}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(currentYear)} onValueChange={handleYearSelect}>
          <SelectTrigger className="w-20 h-8">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {years.map(year => (
              <SelectItem key={year} value={String(year)}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={goToToday}
        className="h-8"
      >
        Hoje
      </Button>
    </div>
  );
}

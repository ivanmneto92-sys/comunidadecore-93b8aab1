import { useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { JournalEntry } from '@/hooks/useJournal';

interface JournalCalendarProps {
  entries: JournalEntry[];
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
  onDayClick: (date: string, entry?: JournalEntry) => void;
}

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

export function JournalCalendar({ 
  entries, 
  currentMonth, 
  onMonthChange, 
  onDayClick 
}: JournalCalendarProps) {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  // Create entries map for quick lookup
  const entriesMap = useMemo(() => {
    const map = new Map<string, JournalEntry>();
    entries.forEach(e => map.set(e.date, e));
    return map;
  }, [entries]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    const startDay = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    
    const days: Array<{ day: number | null; dateStr: string | null }> = [];
    
    // Add empty cells for days before the first day
    for (let i = 0; i < startDay; i++) {
      days.push({ day: null, dateStr: null });
    }
    
    // Add days of the month
    for (let day = 1; day <= totalDays; day++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      days.push({ day, dateStr });
    }
    
    return days;
  }, [currentMonth]);

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const goToPreviousMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() - 1);
    onMonthChange(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + 1);
    // Don't allow future months
    if (newDate <= new Date()) {
      onMonthChange(newDate);
    }
  };

  const getDayIndicator = (dateStr: string | null) => {
    if (!dateStr) return null;
    
    const entry = entriesMap.get(dateStr);
    if (!entry) return null;
    
    if (entry.pnl_percent > 0) return 'positive';
    if (entry.pnl_percent < 0) return 'negative';
    return 'neutral';
  };

  const isFutureDate = (dateStr: string | null) => {
    if (!dateStr) return false;
    return dateStr > todayStr;
  };

  return (
    <Card className="p-4">
      {/* Header with navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button aria-label="Voltar"
          variant="ghost"
          size="icon"
          onClick={goToPreviousMonth}
          className="h-8 w-8"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <h3 className="text-sm font-semibold capitalize">{monthLabel}</h3>
        
        <Button aria-label="Avançar"
          variant="ghost"
          size="icon"
          onClick={goToNextMonth}
          className="h-8 w-8"
          disabled={currentMonth.getMonth() === today.getMonth() && 
                   currentMonth.getFullYear() === today.getFullYear()}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {WEEKDAYS.map((day, i) => (
          <div key={i} className="text-center text-[10px] font-medium text-muted-foreground py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((item, index) => {
          const indicator = getDayIndicator(item.dateStr);
          const isToday = item.dateStr === todayStr;
          const isFuture = isFutureDate(item.dateStr);
          const entry = item.dateStr ? entriesMap.get(item.dateStr) : undefined;

          return (
            <button
              key={index}
              onClick={() => item.dateStr && !isFuture && onDayClick(item.dateStr, entry)}
              disabled={!item.day || isFuture}
              className={cn(
                "aspect-square flex flex-col items-center justify-center rounded-lg text-xs relative transition-colors",
                item.day && !isFuture && "hover:bg-accent cursor-pointer",
                isToday && "ring-2 ring-primary ring-offset-1 ring-offset-background",
                isFuture && "opacity-30 cursor-not-allowed",
                !item.day && "invisible"
              )}
            >
              <span className={cn(
                "font-medium",
                isToday && "text-primary"
              )}>
                {item.day}
              </span>
              
              {/* Indicator dot */}
              {indicator && (
                <div className={cn(
                  "w-1.5 h-1.5 rounded-full mt-0.5",
                  indicator === 'positive' && "bg-success",
                  indicator === 'negative' && "bg-destructive",
                  indicator === 'neutral' && "bg-muted-foreground"
                )} />
              )}
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border">
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-success" />
          <span className="text-[10px] text-muted-foreground">Positivo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-destructive" />
          <span className="text-[10px] text-muted-foreground">Negativo</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-muted-foreground" />
          <span className="text-[10px] text-muted-foreground">Neutro</span>
        </div>
      </div>
    </Card>
  );
}

import { useMemo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format, isSameDay, parseISO, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { CalendarDays } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MonthYearSelector } from './MonthYearSelector';

interface DailyReport {
  id: string;
  date: string;
  trades_count: number;
  win_rate: number;
  pnl_percent: number;
  drawdown_percent: number;
  status: 'success' | 'warning' | 'danger';
  published_at: string | null;
  ai_comment: string | null;
}

interface ReportsCalendarProps {
  reports: DailyReport[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date | undefined) => void;
  month: Date;
  onMonthChange: (month: Date) => void;
}

export function ReportsCalendar({
  reports,
  selectedDate,
  onSelectDate,
  month,
  onMonthChange,
}: ReportsCalendarProps) {
  // Create a map of dates to reports for quick lookup
  const reportsByDate = useMemo(() => {
    const map = new Map<string, DailyReport>();
    reports.forEach(report => {
      map.set(report.date, report);
    });
    return map;
  }, [reports]);

  // Custom day rendering with indicators
  const modifiers = useMemo(() => {
    const published: Date[] = [];
    const draft: Date[] = [];
    const positive: Date[] = [];
    const negative: Date[] = [];
    const neutral: Date[] = [];

    reports.forEach(report => {
      const date = parseISO(report.date);
      
      if (report.published_at) {
        published.push(date);
      } else {
        draft.push(date);
      }

      if (report.pnl_percent > 0) {
        positive.push(date);
      } else if (report.pnl_percent < 0) {
        negative.push(date);
      } else {
        neutral.push(date);
      }
    });

    return { published, draft, positive, negative, neutral };
  }, [reports]);

  const modifiersStyles = {
    published: {},
    draft: {},
    positive: {},
    negative: {},
    neutral: {},
  };

  // Get selected date's report info
  const selectedReport = selectedDate 
    ? reportsByDate.get(format(selectedDate, 'yyyy-MM-dd'))
    : null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <CalendarDays className="h-5 w-5" />
          Calendário de Resultados
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Month/Year Quick Navigation */}
        <MonthYearSelector
          currentMonth={month}
          onMonthChange={onMonthChange}
          minYear={2024}
        />
        
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={onSelectDate}
          month={month}
          onMonthChange={onMonthChange}
          locale={ptBR}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          components={{
            DayContent: ({ date }) => {
              const dateStr = format(date, 'yyyy-MM-dd');
              const report = reportsByDate.get(dateStr);
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{date.getDate()}</span>
                  {report && (
                    <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-0.5">
                      <div
                        className={cn(
                          "w-1.5 h-1.5 rounded-full",
                          report.pnl_percent > 0 && "bg-status-success",
                          report.pnl_percent < 0 && "bg-status-danger",
                          report.pnl_percent === 0 && "bg-muted-foreground",
                          !report.published_at && "ring-1 ring-offset-1 ring-offset-background ring-muted-foreground"
                        )}
                      />
                    </div>
                  )}
                </div>
              );
            },
          }}
          className="rounded-md border-0 p-0"
        />

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-success" />
            <span>Positivo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-status-danger" />
            <span>Negativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground" />
            <span>Neutro</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-muted-foreground ring-1 ring-offset-1 ring-muted-foreground" />
            <span>Rascunho</span>
          </div>
        </div>

        {/* Selected date info */}
        {selectedDate && (
          <div className="mt-4 p-3 rounded-lg bg-muted/50">
            <p className="text-sm font-medium">
              {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            {selectedReport ? (
              <div className="mt-2 flex items-center gap-2">
                <Badge 
                  variant={selectedReport.published_at ? "default" : "outline"}
                  className={cn(
                    selectedReport.published_at 
                      ? selectedReport.pnl_percent >= 0 ? "bg-status-success" : "bg-status-danger"
                      : ""
                  )}
                >
                  {selectedReport.published_at ? 'Publicado' : 'Rascunho'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {selectedReport.pnl_percent >= 0 ? '+' : ''}{selectedReport.pnl_percent.toFixed(2)}% • {selectedReport.trades_count} trades
                </span>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">
                Nenhum resultado registrado. Clique em "Criar" para adicionar.
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

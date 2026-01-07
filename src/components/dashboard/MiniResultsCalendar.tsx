import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, getDay, parseISO, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DailyReport {
  id: string;
  date: string;
  pnl_percent: number;
  status: string;
  published_at: string | null;
}

export function MiniResultsCalendar() {
  const navigate = useNavigate();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [reports, setReports] = useState<DailyReport[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReports();
  }, [currentMonth]);

  const fetchReports = async () => {
    const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
    const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');

    const { data } = await supabase
      .from('reports_daily')
      .select('id, date, pnl_percent, status, published_at')
      .gte('date', start)
      .lte('date', end)
      .not('published_at', 'is', null);

    setReports((data as DailyReport[]) || []);
    setLoading(false);
  };

  const days = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const startDayOffset = getDay(startOfMonth(currentMonth));
  const weekDays = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  const getReportForDay = (day: Date): DailyReport | undefined => {
    return reports.find((r) => isSameDay(parseISO(r.date), day));
  };

  const getDayIndicator = (day: Date) => {
    const report = getReportForDay(day);
    if (!report) return null;

    if (report.pnl_percent > 0) {
      return <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-green-500" />;
    } else if (report.pnl_percent < 0) {
      return <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-red-500" />;
    } else {
      return <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-muted-foreground/50" />;
    }
  };

  // Calculate month stats
  const positives = reports.filter((r) => r.pnl_percent > 0).length;
  const negatives = reports.filter((r) => r.pnl_percent < 0).length;
  const neutrals = reports.filter((r) => r.pnl_percent === 0).length;

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="w-4 h-4 text-primary" />
            Calendário do Mês
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-medium min-w-[100px] text-center">
              {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-2 pb-4 px-4">
        {/* Week days header */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center text-xs text-muted-foreground font-medium py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for offset */}
          {Array.from({ length: startDayOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {/* Day cells */}
          {days.map((day) => {
            const report = getReportForDay(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            const isDayToday = isToday(day);

            return (
              <button
                key={day.toISOString()}
                onClick={() => navigate('/results')}
                className={`
                  aspect-square relative flex items-center justify-center text-xs rounded-md transition-colors
                  ${isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/30'}
                  ${isDayToday ? 'ring-1 ring-primary font-bold' : ''}
                  ${report ? 'hover:bg-muted cursor-pointer' : ''}
                `}
              >
                {format(day, 'd')}
                {getDayIndicator(day)}
              </button>
            );
          })}
        </div>

        {/* Legend / Stats */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-border/50">
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp className="w-3.5 h-3.5 text-green-500" />
            <span className="text-muted-foreground">{positives} dias</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingDown className="w-3.5 h-3.5 text-red-500" />
            <span className="text-muted-foreground">{negatives} dias</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <Minus className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{neutrals} dias</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

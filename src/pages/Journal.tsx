import { useState } from 'react';
import { Plus } from 'lucide-react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { JournalCalendar } from '@/components/journal/JournalCalendar';
import { JournalStats } from '@/components/journal/JournalStats';
import { JournalDayCard } from '@/components/journal/JournalDayCard';
import { JournalEntryDrawer } from '@/components/journal/JournalEntryDrawer';
import { useJournal, JournalEntry } from '@/hooks/useJournal';
import { Skeleton } from '@/components/ui/skeleton';

export default function Journal() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedEntry, setSelectedEntry] = useState<JournalEntry | undefined>();

  const { 
    entries, 
    isLoading, 
    monthStats, 
    saveEntry, 
    deleteEntry 
  } = useJournal(currentMonth);

  const monthLabel = currentMonth.toLocaleDateString('pt-BR', { 
    month: 'long', 
    year: 'numeric' 
  });

  const handleDayClick = (date: string, entry?: JournalEntry) => {
    setSelectedDate(date);
    setSelectedEntry(entry);
    setDrawerOpen(true);
  };

  const handleAddToday = () => {
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
    const todayEntry = entries.find(e => e.date === todayStr);
    handleDayClick(todayStr, todayEntry);
  };

  // Get recent entries (last 5)
  const recentEntries = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-4 pb-24">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Meu Diário</h1>
            <p className="text-sm text-muted-foreground">Registre seus resultados diários</p>
          </div>
          <Button size="sm" onClick={handleAddToday}>
            <Plus className="h-4 w-4 mr-1" />
            Hoje
          </Button>
        </div>

        {/* Stats */}
        {isLoading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <JournalStats
            positiveDays={monthStats.positiveDays}
            negativeDays={monthStats.negativeDays}
            totalPnL={monthStats.totalPnL}
            avgWinRate={monthStats.avgWinRate}
            monthLabel={monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1)}
          />
        )}

        {/* Calendar */}
        {isLoading ? (
          <Skeleton className="h-80 w-full" />
        ) : (
          <JournalCalendar
            entries={entries}
            currentMonth={currentMonth}
            onMonthChange={setCurrentMonth}
            onDayClick={handleDayClick}
          />
        )}

        {/* Recent Entries */}
        {!isLoading && recentEntries.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Registros Recentes
            </h2>
            <div className="space-y-2">
              {recentEntries.map(entry => (
                <JournalDayCard
                  key={entry.id}
                  entry={entry}
                  onClick={() => handleDayClick(entry.date, entry)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!isLoading && entries.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">
              Nenhum registro neste mês. Comece a registrar seus resultados!
            </p>
            <Button onClick={handleAddToday}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Registro de Hoje
            </Button>
          </div>
        )}
      </div>

      {/* Entry Drawer */}
      <JournalEntryDrawer
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        date={selectedDate}
        entry={selectedEntry}
        onSave={saveEntry}
        onDelete={deleteEntry}
      />
    </AppLayout>
  );
}

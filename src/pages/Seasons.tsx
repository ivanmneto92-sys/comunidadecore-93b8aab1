import { AppLayout } from '@/components/layout/AppLayout';
import { SeasonHeader } from '@/components/seasons/SeasonHeader';
import { SeasonProgressCard } from '@/components/seasons/SeasonProgressCard';
import { SeasonAchievementsList } from '@/components/seasons/SeasonAchievementsList';
import { SeasonXpBreakdown } from '@/components/seasons/SeasonXpBreakdown';
import { useSeason } from '@/hooks/useSeason';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Trophy, Zap, Clock } from 'lucide-react';

export default function Seasons() {
  const { isLoading, currentSeason, seasonDefinition } = useSeason();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
        </div>
      </AppLayout>
    );
  }

  if (!currentSeason || !seasonDefinition) {
    return (
      <AppLayout>
        <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] text-center">
          <Clock className="w-16 h-16 text-muted-foreground mb-4" />
          <h2 className="text-xl font-bold mb-2">Nenhuma temporada ativa</h2>
          <p className="text-muted-foreground">
            A próxima temporada começará em breve. Fique atento!
          </p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pb-24">
        {/* Header com tema da temporada */}
        <SeasonHeader 
          season={currentSeason} 
          definition={seasonDefinition} 
        />

        {/* Card de Progresso */}
        <div className="px-4 -mt-6 relative z-10">
          <SeasonProgressCard />
        </div>

        {/* Tabs de Conteúdo */}
        <div className="px-4 mt-6">
          <Tabs defaultValue="achievements" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="achievements" className="gap-2">
                <Trophy className="w-4 h-4" />
                Conquistas
              </TabsTrigger>
              <TabsTrigger value="xp" className="gap-2">
                <Zap className="w-4 h-4" />
                XP do Dia
              </TabsTrigger>
            </TabsList>

            <TabsContent value="achievements" className="mt-4">
              <SeasonAchievementsList />
            </TabsContent>

            <TabsContent value="xp" className="mt-4">
              <SeasonXpBreakdown />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </AppLayout>
  );
}

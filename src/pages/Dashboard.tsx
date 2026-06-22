import { AppLayout } from '@/components/layout/AppLayout';
import { EditorialHero } from '@/components/dashboard/editorial/EditorialHero';
import { EditorialPerformance } from '@/components/dashboard/editorial/EditorialPerformance';
import { EditorialShortcuts } from '@/components/dashboard/editorial/EditorialShortcuts';
import { PersonalizedHeader } from '@/components/dashboard/PersonalizedHeader';
import { DailyCheckinCard } from '@/components/dashboard/DailyCheckinCard';
import { MarketNewsCard } from '@/components/dashboard/MarketNewsCard';
import { OnboardingCard } from '@/components/onboarding/OnboardingCard';
import { useDailyStatus } from '@/hooks/useDailyStatus';
import { useStreak } from '@/hooks/useStreak';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { dailyStatus, dailyResult, isLoading } = useDailyStatus();
  const { streakDays } = useStreak();

  const isRiskMode = dailyStatus?.status === 'danger';

  const defaultStatus = {
    score: 85,
    insightText: 'O comportamento atual segue o padrão saudável do sistema.',
  };

  const defaultResult = {
    pnlPercent: 0,
    tradesCount: 0,
    winRate: 0,
    positiveDays: 0,
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6 font-body">
        {/* Header com avatar + saudação + sino + streak */}
        <PersonalizedHeader streakDays={streakDays} />

        {/* Onboarding (até concluir/dispensar) */}
        <OnboardingCard />

        {/* Check-in diário */}
        <DailyCheckinCard />

        {isLoading ? (
          <div className="space-y-6">
            <Skeleton className="h-56 w-full rounded-md" />
            <Skeleton className="h-44 w-full rounded-md" />
            <Skeleton className="h-40 w-full rounded-md" />
          </div>
        ) : (
          <>
            {/* Hero editorial — Health Score */}
            <EditorialHero
              score={dailyStatus?.score ?? defaultStatus.score}
              insightText={dailyStatus?.insightText || defaultStatus.insightText}
              streakDays={streakDays}
            />

            {/* Performance editorial */}
            <EditorialPerformance
              pnlPercent={dailyResult?.pnlPercent ?? defaultResult.pnlPercent}
              tradesCount={dailyResult?.tradesCount ?? defaultResult.tradesCount}
              winRate={dailyResult?.winRate ?? defaultResult.winRate}
              positiveDays={dailyResult?.positiveDays ?? defaultResult.positiveDays}
              isRiskMode={isRiskMode}
            />

            {/* Mercado hoje */}
            <section className="-mx-4 px-6 py-7 border-b border-accent/15">
              <h2 className="font-display text-xl font-medium tracking-tight mb-4">
                Mercado hoje
              </h2>
              <MarketNewsCard />
            </section>

            {/* Atalhos editorial */}
            <EditorialShortcuts />
          </>
        )}

        {/* Compliance */}
        <p className="text-center text-[10px] text-foreground/40 pt-2 pb-2 leading-relaxed">
          Conteúdo educacional e informativo. Não constitui recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

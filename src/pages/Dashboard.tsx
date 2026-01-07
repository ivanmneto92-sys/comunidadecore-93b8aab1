import { AppLayout } from '@/components/layout/AppLayout';
import { AnimatedStatusCard } from '@/components/dashboard/AnimatedStatusCard';
import { MetricsGrid } from '@/components/dashboard/MetricsGrid';
import { CommunityHighlights } from '@/components/dashboard/CommunityHighlights';
import { EnhancedQuickActions } from '@/components/dashboard/EnhancedQuickActions';
import { PersonalizedHeader } from '@/components/dashboard/PersonalizedHeader';
import { DailyCheckinCard } from '@/components/dashboard/DailyCheckinCard';
import { useDailyStatus } from '@/hooks/useDailyStatus';
import { useStreak } from '@/hooks/useStreak';
import { Skeleton } from '@/components/ui/skeleton';

export default function Dashboard() {
  const { dailyStatus, dailyResult, communityHighlights, isLoading } = useDailyStatus();
  const { streakDays } = useStreak();

  const isRiskMode = dailyStatus?.status === 'danger';

  // Default values for demo/fallback
  const defaultStatus = {
    status: 'success' as const,
    profileType: 'normal' as const,
    riskLevel: 'baixo' as const,
    drawdownStatus: 'controlado' as const,
    insightText: 'O comportamento atual segue o padrão saudável do sistema.',
  };

  const defaultResult = {
    pnlPercent: 0,
    tradesCount: 0,
    wins: 0,
    losses: 0,
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-6">
        {/* 1. Header Premium */}
        <PersonalizedHeader streakDays={streakDays} />

        {/* 2. Check-in Diário */}
        <DailyCheckinCard />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-52 w-full rounded-2xl" />
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-xl" />
            </div>
          </div>
        ) : (
          <>
            {/* 3. Hero Status Card */}
            <AnimatedStatusCard
              status={dailyStatus?.status || defaultStatus.status}
              profileType={dailyStatus?.profileType || defaultStatus.profileType}
              riskLevel={dailyStatus?.riskLevel || defaultStatus.riskLevel}
              drawdownStatus={dailyStatus?.drawdownStatus || defaultStatus.drawdownStatus}
              insightText={dailyStatus?.insightText || defaultStatus.insightText}
            />

            {/* 4. Metrics Grid 2x2 */}
            <MetricsGrid
              pnlPercent={dailyResult?.pnlPercent ?? defaultResult.pnlPercent}
              tradesCount={dailyResult?.tradesCount ?? defaultResult.tradesCount}
              wins={dailyResult?.wins ?? defaultResult.wins}
              losses={dailyResult?.losses ?? defaultResult.losses}
              isRiskMode={isRiskMode}
            />

            {/* 5. Quick Actions Grid */}
            <EnhancedQuickActions />

            {/* 6. Community Highlights Carousel */}
            <CommunityHighlights highlights={communityHighlights} />
          </>
        )}

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-2 pb-2">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

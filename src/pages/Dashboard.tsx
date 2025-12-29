import { AppLayout } from '@/components/layout/AppLayout';
import { CoreStatusCard } from '@/components/dashboard/CoreStatusCard';
import { DayResultCard } from '@/components/dashboard/DayResultCard';
import { CoreInsightCard } from '@/components/dashboard/CoreInsightCard';
import { CommunityHighlights } from '@/components/dashboard/CommunityHighlights';
import { HomeQuickActions } from '@/components/dashboard/HomeQuickActions';
import { useDailyStatus } from '@/hooks/useDailyStatus';
import { Skeleton } from '@/components/ui/skeleton';
import logoCore from '@/assets/logo-core.png';

export default function Dashboard() {
  const { dailyStatus, dailyResult, communityHighlights, isLoading } = useDailyStatus();

  const isRiskMode = dailyStatus?.status === 'danger';

  // Default values for demo/fallback
  const defaultStatus = {
    status: 'success' as const,
    profileType: 'normal' as const,
    riskLevel: 'baixo' as const,
    drawdownStatus: 'controlado' as const,
    insightText: 'O comportamento atual segue o padrão saudável do sistema. Dias como este priorizam consistência, não agressividade.',
  };

  const defaultResult = {
    pnlPercent: 0,
    tradesCount: 0,
    wins: 0,
    losses: 0,
  };

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-5">
        {/* Header with Logo */}
        <div className="flex items-center justify-center pb-2">
          <img src={logoCore} alt="CORE" className="h-8 w-auto" />
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* 1. Status Geral do CORE - Card Principal */}
            <CoreStatusCard
              status={dailyStatus?.status || defaultStatus.status}
              profileType={dailyStatus?.profileType || defaultStatus.profileType}
              riskLevel={dailyStatus?.riskLevel || defaultStatus.riskLevel}
              drawdownStatus={dailyStatus?.drawdownStatus || defaultStatus.drawdownStatus}
            />

            {/* 2. Resultado do Dia - Discreto */}
            <div className="pt-1">
              <DayResultCard
                pnlPercent={dailyResult?.pnlPercent ?? defaultResult.pnlPercent}
                tradesCount={dailyResult?.tradesCount ?? defaultResult.tradesCount}
                wins={dailyResult?.wins ?? defaultResult.wins}
                losses={dailyResult?.losses ?? defaultResult.losses}
                isRiskMode={isRiskMode}
              />
            </div>

            {/* 3. Insight do CORE - IA */}
            <div className="pt-2">
              <CoreInsightCard
                insightText={dailyStatus?.insightText || defaultStatus.insightText}
              />
            </div>

            {/* 4. Destaques da Comunidade - Curadoria */}
            <CommunityHighlights highlights={communityHighlights} />

            {/* 5. Acessos Rápidos */}
            <HomeQuickActions />
          </>
        )}

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-2">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

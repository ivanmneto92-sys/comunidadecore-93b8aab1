import { AppLayout } from '@/components/layout/AppLayout';
import { AnimatedStatusCard } from '@/components/dashboard/AnimatedStatusCard';
import { DayResultCard } from '@/components/dashboard/DayResultCard';
import { CoreInsightCard } from '@/components/dashboard/CoreInsightCard';
import { CommunityHighlights } from '@/components/dashboard/CommunityHighlights';
import { EnhancedQuickActions } from '@/components/dashboard/EnhancedQuickActions';
import { PersonalizedHeader } from '@/components/dashboard/PersonalizedHeader';
import { useDailyStatus } from '@/hooks/useDailyStatus';
import { Skeleton } from '@/components/ui/skeleton';

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

  // Mock streak days (could be fetched from backend later)
  const streakDays = 5;

  return (
    <AppLayout>
      <div className="px-4 py-6 space-y-5">
        {/* 1. Header Personalizado com Saudação e Streak */}
        <PersonalizedHeader streakDays={streakDays} />

        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-36 w-full" />
            <Skeleton className="h-16 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : (
          <>
            {/* 2. Status com Indicador Circular Animado */}
            <AnimatedStatusCard
              status={dailyStatus?.status || defaultStatus.status}
              profileType={dailyStatus?.profileType || defaultStatus.profileType}
              riskLevel={dailyStatus?.riskLevel || defaultStatus.riskLevel}
              drawdownStatus={dailyStatus?.drawdownStatus || defaultStatus.drawdownStatus}
            />

            {/* 3. Resultado do Dia */}
            <DayResultCard
              pnlPercent={dailyResult?.pnlPercent ?? defaultResult.pnlPercent}
              tradesCount={dailyResult?.tradesCount ?? defaultResult.tradesCount}
              wins={dailyResult?.wins ?? defaultResult.wins}
              losses={dailyResult?.losses ?? defaultResult.losses}
              isRiskMode={isRiskMode}
            />

            {/* 4. Insight do CORE - IA */}
            <CoreInsightCard
              insightText={dailyStatus?.insightText || defaultStatus.insightText}
            />

            {/* 5. Destaques da Comunidade */}
            <CommunityHighlights highlights={communityHighlights} />

            {/* 6. Acessos Rápidos Aprimorados */}
            <EnhancedQuickActions />
          </>
        )}

        {/* Compliance disclaimer */}
        <p className="text-center text-xs text-muted-foreground pt-4 pb-2">
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

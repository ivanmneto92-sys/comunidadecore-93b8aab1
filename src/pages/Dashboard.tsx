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
        <div className="animate-fade-in" style={{ animationDelay: '0ms', animationFillMode: 'both' }}>
          <PersonalizedHeader streakDays={streakDays} />
        </div>

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
            <div className="animate-fade-in" style={{ animationDelay: '100ms', animationFillMode: 'both' }}>
              <AnimatedStatusCard
                status={dailyStatus?.status || defaultStatus.status}
                profileType={dailyStatus?.profileType || defaultStatus.profileType}
                riskLevel={dailyStatus?.riskLevel || defaultStatus.riskLevel}
                drawdownStatus={dailyStatus?.drawdownStatus || defaultStatus.drawdownStatus}
              />
            </div>

            {/* 3. Resultado do Dia */}
            <div className="animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
              <DayResultCard
                pnlPercent={dailyResult?.pnlPercent ?? defaultResult.pnlPercent}
                tradesCount={dailyResult?.tradesCount ?? defaultResult.tradesCount}
                wins={dailyResult?.wins ?? defaultResult.wins}
                losses={dailyResult?.losses ?? defaultResult.losses}
                isRiskMode={isRiskMode}
              />
            </div>

            {/* 4. Insight do CORE - IA */}
            <div className="animate-fade-in" style={{ animationDelay: '300ms', animationFillMode: 'both' }}>
              <CoreInsightCard
                insightText={dailyStatus?.insightText || defaultStatus.insightText}
              />
            </div>

            {/* 5. Destaques da Comunidade */}
            <div className="animate-fade-in" style={{ animationDelay: '400ms', animationFillMode: 'both' }}>
              <CommunityHighlights highlights={communityHighlights} />
            </div>

            {/* 6. Acessos Rápidos Aprimorados */}
            <div className="animate-fade-in" style={{ animationDelay: '500ms', animationFillMode: 'both' }}>
              <EnhancedQuickActions />
            </div>
          </>
        )}

        {/* Compliance disclaimer */}
        <p className="animate-fade-in text-center text-xs text-muted-foreground pt-4 pb-2" style={{ animationDelay: '600ms', animationFillMode: 'both' }}>
          Conteúdo educacional e informativo. Não é recomendação de investimento.
        </p>
      </div>
    </AppLayout>
  );
}

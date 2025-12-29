import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAffiliate } from '@/hooks/useAffiliate';
import { useAuth } from '@/hooks/useAuth';
import { AffiliateLinkCard } from '@/components/affiliates/AffiliateLinkCard';
import { AffiliateStats } from '@/components/affiliates/AffiliateStats';
import { ReferralsTable } from '@/components/affiliates/ReferralsTable';
import { CommissionsTable } from '@/components/affiliates/CommissionsTable';
import { PayoutRequestForm } from '@/components/affiliates/PayoutRequestForm';
import { PayoutHistory } from '@/components/affiliates/PayoutHistory';
import { Users, Loader2, ArrowLeft } from 'lucide-react';

const statusBadges: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  active: { label: 'Ativo', variant: 'default' },
  pending: { label: 'Pendente', variant: 'secondary' },
  suspended: { label: 'Suspenso', variant: 'destructive' },
};

export default function Affiliates() {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { affiliate, referrals, commissions, payouts, loading, createAffiliate, requestPayout } = useAffiliate();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-48 w-full" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusBadge = affiliate ? statusBadges[affiliate.status] || statusBadges.pending : null;

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold">Programa de Afiliados</h1>
                {statusBadge && (
                  <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>
                )}
              </div>
              <p className="text-muted-foreground">
                Indique amigos e ganhe comissões em cada assinatura
              </p>
            </div>
          </div>
        </div>

        {!affiliate ? (
          /* Onboarding - Create Affiliate Account */
          <div className="flex flex-col items-center justify-center py-12 space-y-6">
            <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center">
              <Users className="w-12 h-12 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">Torne-se um Afiliado</h2>
              <p className="text-muted-foreground max-w-md">
                Ganhe comissões indicando o CORE HUB para seus amigos. Receba R$ 20 por cada assinatura Plus e R$ 50 por cada assinatura Elite!
              </p>
            </div>
            <Button size="lg" onClick={createAffiliate}>
              Começar Agora
            </Button>
          </div>
        ) : (
          /* Main Affiliate Dashboard */
          <div className="space-y-6">
            {/* Affiliate Link */}
            <AffiliateLinkCard affiliateCode={affiliate.affiliate_code} />

            {/* Stats */}
            <AffiliateStats
              affiliate={affiliate}
              referrals={referrals}
              commissions={commissions}
            />

            {/* Tables Grid */}
            <div className="grid md:grid-cols-2 gap-6">
              <ReferralsTable referrals={referrals} />
              <CommissionsTable commissions={commissions} />
            </div>

            {/* Payout Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <PayoutRequestForm affiliate={affiliate} onRequest={requestPayout} />
              <PayoutHistory payouts={payouts} />
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

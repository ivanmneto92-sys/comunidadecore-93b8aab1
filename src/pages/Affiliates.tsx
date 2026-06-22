import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { useAffiliate } from '@/hooks/useAffiliate';
import { useAuth } from '@/hooks/useAuth';
import { AffiliateLinkCard } from '@/components/affiliates/AffiliateLinkCard';
import { AffiliateHeroStats } from '@/components/affiliates/AffiliateHeroStats';
import { AffiliateLevelCard } from '@/components/affiliates/AffiliateLevelCard';
import { AffiliateLeaderboard } from '@/components/affiliates/AffiliateLeaderboard';
import { ReferralsTable } from '@/components/affiliates/ReferralsTable';
import { CommissionsTable } from '@/components/affiliates/CommissionsTable';
import { PayoutRequestForm } from '@/components/affiliates/PayoutRequestForm';
import { PayoutHistory } from '@/components/affiliates/PayoutHistory';
import {
  Users,
  ArrowLeft,
  Gift,
  Star,
  Crown,
  Sparkles,
  Trophy,
  LayoutDashboard,
  UserPlus,
  Wallet,
} from 'lucide-react';

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
          <div className="grid grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  const statusBadge = affiliate ? statusBadges[affiliate.status] || statusBadges.pending : null;

  const benefits = [
    { icon: Star, title: 'R$ 20 por Plus', description: 'Para cada indicado que assinar o plano Plus' },
    { icon: Crown, title: 'R$ 50 por Elite', description: 'Para cada indicado que assinar o plano Elite' },
    { icon: Gift, title: 'Saques Rápidos', description: 'Receba via Pix ou PayPal a partir de R$ 50' },
    { icon: Trophy, title: 'Sistema de Níveis', description: 'Suba de nível e ganhe bônus em comissões' },
  ];

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button aria-label="Voltar" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Users className="w-6 h-6 text-background" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">Programa de Afiliados</h1>
              {statusBadge && <Badge variant={statusBadge.variant}>{statusBadge.label}</Badge>}
            </div>
            <p className="text-sm text-muted-foreground">Indique amigos e ganhe comissões</p>
          </div>
        </div>

        {!affiliate ? (
          /* Onboarding - Create Affiliate Account */
          <div className="flex flex-col items-center justify-center py-8 space-y-8 animate-fade-in">
            <div className="relative">
              <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-xl shadow-primary/30">
                <Users className="w-14 h-14 text-background" />
              </div>
              <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-background flex items-center justify-center shadow-lg">
                <Sparkles className="w-4 h-4 text-primary" />
              </div>
            </div>

            <div className="text-center space-y-2">
              <h2 className="text-2xl font-bold">Torne-se um Afiliado</h2>
              <p className="text-muted-foreground max-w-md">
                Ganhe comissões indicando o Instituto Trader para seus amigos e seguidores.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-2xl">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={index}
                    className="flex flex-col items-center text-center p-4 rounded-xl bg-card border border-border/50 space-y-2"
                  >
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <p className="font-semibold">{benefit.title}</p>
                    <p className="text-xs text-muted-foreground">{benefit.description}</p>
                  </div>
                );
              })}
            </div>

            <Button size="lg" onClick={createAffiliate} className="gap-2 px-8">
              <Sparkles className="w-5 h-5" />
              Começar Agora
            </Button>
          </div>
        ) : (
          /* Main Affiliate Dashboard */
          <div className="space-y-6">
            {/* Affiliate Link - always visible */}
            <div className="animate-fade-in">
              <AffiliateLinkCard affiliateCode={affiliate.affiliate_code} />
            </div>

            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="sticky top-0 z-10 grid grid-cols-3 w-full h-auto bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/70">
                <TabsTrigger value="overview" className="gap-2 py-2">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Visão Geral</span>
                  <span className="sm:hidden">Geral</span>
                </TabsTrigger>
                <TabsTrigger value="referrals" className="gap-2 py-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Indicações</span>
                </TabsTrigger>
                <TabsTrigger value="payouts" className="gap-2 py-2">
                  <Wallet className="w-4 h-4" />
                  <span>Saques</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6 animate-fade-in">
                <AffiliateLevelCard referrals={referrals} />
                <AffiliateHeroStats
                  affiliate={affiliate}
                  referrals={referrals}
                  commissions={commissions}
                />
                <AffiliateLeaderboard />
              </TabsContent>

              <TabsContent value="referrals" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <ReferralsTable referrals={referrals} />
                  <CommissionsTable commissions={commissions} />
                </div>
              </TabsContent>

              <TabsContent value="payouts" className="animate-fade-in">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <PayoutRequestForm affiliate={affiliate} onRequest={requestPayout} />
                  <PayoutHistory payouts={payouts} />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

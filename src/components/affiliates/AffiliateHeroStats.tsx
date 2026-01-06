import { DollarSign, Users, TrendingUp, Wallet } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import type { Affiliate, Referral, Commission } from '@/hooks/useAffiliate';

interface AffiliateHeroStatsProps {
  affiliate: Affiliate;
  referrals: Referral[];
  commissions: Commission[];
}

export function AffiliateHeroStats({ affiliate, referrals, commissions }: AffiliateHeroStatsProps) {
  const activeReferrals = referrals.filter((r) => r.status === 'converted').length;
  const pendingCommissions = commissions.filter((c) => c.status === 'pending').length;
  const hasBalance = affiliate.available_balance > 0;

  // Calculate progress to next payout (minimum R$ 50)
  const minPayout = 50;
  const progressPercent = Math.min((affiliate.available_balance / minPayout) * 100, 100);

  const stats = [
    {
      icon: Users,
      label: 'Indicações',
      value: referrals.length.toString(),
      description: `${activeReferrals} convertidas`,
      highlight: activeReferrals > 0,
    },
    {
      icon: TrendingUp,
      label: 'Comissões',
      value: commissions.length.toString(),
      description: pendingCommissions > 0 ? `${pendingCommissions} pendentes` : 'Todas pagas',
      highlight: pendingCommissions > 0,
    },
    {
      icon: Wallet,
      label: 'Total Ganho',
      value: `R$ ${affiliate.total_earnings.toFixed(0)}`,
      description: 'Desde o início',
      highlight: affiliate.total_earnings > 0,
    },
  ];

  return (
    <div className="space-y-4">
      {/* Hero Balance Card */}
      <Card className={`overflow-hidden border-border/50 ${hasBalance ? 'shadow-lg shadow-primary/10' : ''}`}>
        <CardContent className="p-6">
          <div className="flex items-center gap-6">
            {/* Balance Icon with Glow */}
            <div className="relative">
              <div
                className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-lg ${
                  hasBalance
                    ? 'bg-gradient-to-br from-primary to-primary/60 shadow-primary/30'
                    : 'bg-muted'
                }`}
              >
                <DollarSign className={`w-10 h-10 ${hasBalance ? 'text-background' : 'text-muted-foreground'}`} />
              </div>
              {hasBalance && (
                <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary animate-pulse" />
              )}
            </div>

            {/* Balance Info */}
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Saldo Disponível</p>
                <p className={`text-3xl font-bold ${hasBalance ? 'text-primary' : ''}`}>
                  R$ {affiliate.available_balance.toFixed(2)}
                </p>
              </div>

              {/* Progress to Payout */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Progresso para saque</span>
                  <span>R$ {minPayout} mínimo</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-primary/60 rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card
              key={index}
              className="overflow-hidden border-border/50 transition-all duration-300 hover:shadow-md"
            >
              <CardContent className="p-4 text-center space-y-2">
                <div
                  className={`w-10 h-10 mx-auto rounded-lg flex items-center justify-center ${
                    stat.highlight ? 'bg-primary/10' : 'bg-muted'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className={`text-xl font-bold ${stat.highlight ? 'text-primary' : ''}`}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
                <p className="text-xs text-muted-foreground/70">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

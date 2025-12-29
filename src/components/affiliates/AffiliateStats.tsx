import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, Wallet, TrendingUp } from 'lucide-react';
import type { Affiliate, Referral, Commission } from '@/hooks/useAffiliate';

interface AffiliateStatsProps {
  affiliate: Affiliate;
  referrals: Referral[];
  commissions: Commission[];
}

export function AffiliateStats({ affiliate, referrals, commissions }: AffiliateStatsProps) {
  const activeReferrals = referrals.filter(r => r.status === 'converted').length;
  const pendingCommissions = commissions
    .filter(c => c.status === 'pending')
    .reduce((acc, c) => acc + Number(c.amount), 0);

  const stats = [
    {
      title: 'Total de Indicações',
      value: referrals.length,
      icon: Users,
      description: 'Pessoas que usaram seu link',
    },
    {
      title: 'Indicações Ativas',
      value: activeReferrals,
      icon: UserCheck,
      description: 'Que se tornaram assinantes',
    },
    {
      title: 'Saldo Disponível',
      value: `R$ ${Number(affiliate.available_balance).toFixed(2)}`,
      icon: Wallet,
      description: 'Disponível para saque',
      highlight: true,
    },
    {
      title: 'Total Ganho',
      value: `R$ ${Number(affiliate.total_earnings).toFixed(2)}`,
      icon: TrendingUp,
      description: 'Histórico de ganhos',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={stat.highlight ? 'border-primary/50 bg-primary/5' : ''}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-4 w-4 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stat.highlight ? 'text-primary' : ''}`}>
              {stat.value}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stat.description}
            </p>
            {stat.title === 'Saldo Disponível' && pendingCommissions > 0 && (
              <p className="text-xs text-yellow-500 mt-1">
                + R$ {pendingCommissions.toFixed(2)} pendente
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

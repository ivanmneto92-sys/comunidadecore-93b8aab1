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
    <div className="grid grid-cols-2 gap-3">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={stat.highlight ? 'border-primary/50 bg-primary/5' : ''}
        >
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 p-3">
            <CardTitle className="text-[10px] font-medium text-muted-foreground leading-tight">
              {stat.title}
            </CardTitle>
            <stat.icon className={`h-3.5 w-3.5 ${stat.highlight ? 'text-primary' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <div className={`text-lg font-bold ${stat.highlight ? 'text-primary' : ''}`}>
              {stat.value}
            </div>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
              {stat.description}
            </p>
            {stat.title === 'Saldo Disponível' && pendingCommissions > 0 && (
              <p className="text-[10px] text-yellow-500 mt-0.5">
                + R$ {pendingCommissions.toFixed(2)} pendente
              </p>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

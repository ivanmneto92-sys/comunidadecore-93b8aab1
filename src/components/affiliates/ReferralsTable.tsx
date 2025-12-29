import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users } from 'lucide-react';
import type { Referral } from '@/hooks/useAffiliate';

interface ReferralsTableProps {
  referrals: Referral[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  active: { label: 'Ativo', variant: 'outline' },
  converted: { label: 'Convertido', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

function maskEmail(email: string | null): string {
  if (!email) return '***';
  const [name, domain] = email.split('@');
  if (!domain) return email.slice(0, 3) + '***';
  return name.slice(0, 2) + '***@' + domain;
}

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Users className="h-4 w-4" />
          Suas Indicações
        </CardTitle>
        <CardDescription className="text-xs">
          Pessoas que usaram seu link
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {referrals.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Users className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Você ainda não tem indicações</p>
            <p className="text-xs">Compartilhe seu link para começar!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {referrals.map((referral) => {
              const status = statusConfig[referral.status] || statusConfig.pending;
              return (
                <div key={referral.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {referral.profile?.display_name || maskEmail(referral.referred_user_id)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(referral.referred_at), 'dd MMM yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                    {referral.converted_at && (
                      <span className="text-[10px] text-muted-foreground">
                        Conv. {format(new Date(referral.converted_at), 'dd/MM', { locale: ptBR })}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

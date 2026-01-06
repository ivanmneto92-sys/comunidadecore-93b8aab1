import { Users, UserCheck, UserX, Clock, Calendar, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Referral } from '@/hooks/useAffiliate';

interface ReferralsTableProps {
  referrals: Referral[];
}

const statusConfig: Record<string, { label: string; icon: typeof UserCheck; variant: 'default' | 'secondary' | 'outline'; color: string }> = {
  converted: { label: 'Convertido', icon: UserCheck, variant: 'default', color: 'text-primary' },
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary', color: 'text-muted-foreground' },
  active: { label: 'Ativo', icon: UserCheck, variant: 'outline', color: 'text-primary' },
  expired: { label: 'Expirado', icon: UserX, variant: 'outline', color: 'text-destructive' },
  cancelled: { label: 'Cancelado', icon: UserX, variant: 'outline', color: 'text-destructive' },
};

function maskEmail(email: string | null): string {
  if (!email) return 'Usuário';
  const [user, domain] = email.split('@');
  if (!domain) return email.slice(0, 3) + '***';
  return user.slice(0, 3) + '***@' + domain;
}

export function ReferralsTable({ referrals }: ReferralsTableProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Suas Indicações</h3>
            <p className="text-sm text-muted-foreground">
              {referrals.length} {referrals.length === 1 ? 'pessoa indicada' : 'pessoas indicadas'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {referrals.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Share2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhuma indicação ainda</p>
              <p className="text-sm text-muted-foreground">
                Compartilhe seu link e comece a ganhar comissões!
              </p>
            </div>
          </div>
        ) : (
          referrals.map((referral, index) => {
            const config = statusConfig[referral.status] || statusConfig.pending;
            const StatusIcon = config.icon;

            return (
              <div
                key={referral.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Avatar Placeholder */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    referral.status === 'converted' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${config.color}`} />
                  </div>

                  {/* Info */}
                  <div>
                    <p className="font-medium text-sm">
                      {maskEmail(referral.referred_user_id)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {format(new Date(referral.referred_at), "dd MMM yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status & Conversion */}
                <div className="text-right space-y-1">
                  <Badge variant={config.variant} className="text-xs">
                    {config.label}
                  </Badge>
                  {referral.converted_at && (
                    <p className="text-xs text-muted-foreground">
                      Convertido em {format(new Date(referral.converted_at), "dd/MM", { locale: ptBR })}
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

import { TrendingUp, Star, Crown, Clock, CheckCircle, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { Commission } from '@/hooks/useAffiliate';

interface CommissionsTableProps {
  commissions: Commission[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'outline' },
  paid: { label: 'Pago', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'outline' },
};

const tierConfig: Record<string, { label: string; icon: typeof Star; color: string }> = {
  plus: { label: 'Plus', icon: Star, color: 'text-primary' },
  elite: { label: 'Elite', icon: Crown, color: 'text-amber-500' },
};

export function CommissionsTable({ commissions }: CommissionsTableProps) {
  const totalPending = commissions
    .filter((c) => c.status === 'pending')
    .reduce((sum, c) => sum + c.amount, 0);

  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Histórico de Comissões</h3>
              <p className="text-sm text-muted-foreground">
                {commissions.length} {commissions.length === 1 ? 'comissão' : 'comissões'}
              </p>
            </div>
          </div>
          {totalPending > 0 && (
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Pendente</p>
              <p className="font-bold text-primary">R$ {totalPending.toFixed(2)}</p>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {commissions.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <DollarSign className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhuma comissão ainda</p>
              <p className="text-sm text-muted-foreground">
                Quando seus indicados assinarem, você verá suas comissões aqui.
              </p>
            </div>
          </div>
        ) : (
          commissions.map((commission, index) => {
            const tier = tierConfig[commission.tier] || tierConfig.plus;
            const status = statusConfig[commission.status] || statusConfig.pending;
            const TierIcon = tier.icon;

            return (
              <div
                key={commission.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Tier Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    commission.status === 'paid' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <TierIcon className={`w-5 h-5 ${tier.color}`} />
                  </div>

                  {/* Info */}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className={`font-bold ${tier.color}`}>
                        R$ {commission.amount.toFixed(2)}
                      </p>
                      <span className="text-xs text-muted-foreground">•</span>
                      <span className="text-sm">{tier.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(commission.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                    </p>
                  </div>
                </div>

                {/* Status */}
                <Badge variant={status.variant} className="text-xs gap-1">
                  {commission.status === 'paid' ? (
                    <CheckCircle className="w-3 h-3" />
                  ) : commission.status === 'pending' ? (
                    <Clock className="w-3 h-3" />
                  ) : null}
                  {status.label}
                </Badge>
              </div>
            );
          })
        )}
      </CardContent>
    </Card>
  );
}

import { History, Clock, CheckCircle, XCircle, Loader2, CreditCard, Wallet } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { PayoutRequest } from '@/hooks/useAffiliate';

interface PayoutHistoryProps {
  payouts: PayoutRequest[];
}

const statusConfig: Record<string, { label: string; icon: typeof Clock; variant: 'default' | 'secondary' | 'destructive' | 'outline'; color: string }> = {
  pending: { label: 'Pendente', icon: Clock, variant: 'secondary', color: 'text-muted-foreground' },
  processing: { label: 'Processando', icon: Loader2, variant: 'outline', color: 'text-amber-500' },
  completed: { label: 'Concluído', icon: CheckCircle, variant: 'default', color: 'text-primary' },
  rejected: { label: 'Rejeitado', icon: XCircle, variant: 'destructive', color: 'text-destructive' },
};

const methodConfig: Record<string, { label: string; icon: typeof CreditCard }> = {
  pix: { label: 'Pix', icon: CreditCard },
  paypal: { label: 'PayPal', icon: Wallet },
};

export function PayoutHistory({ payouts }: PayoutHistoryProps) {
  return (
    <Card className="overflow-hidden border-border/50">
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <History className="w-5 h-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-semibold">Histórico de Saques</h3>
            <p className="text-sm text-muted-foreground">
              {payouts.length} {payouts.length === 1 ? 'solicitação' : 'solicitações'}
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {payouts.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <History className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium">Nenhum saque solicitado</p>
              <p className="text-sm text-muted-foreground">
                Quando você solicitar um saque, ele aparecerá aqui.
              </p>
            </div>
          </div>
        ) : (
          payouts.map((payout, index) => {
            const status = statusConfig[payout.status] || statusConfig.pending;
            const method = methodConfig[payout.payment_method] || methodConfig.pix;
            const StatusIcon = status.icon;
            const MethodIcon = method.icon;

            return (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  {/* Status Icon */}
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    payout.status === 'completed' ? 'bg-primary/10' : 'bg-muted'
                  }`}>
                    <StatusIcon className={`w-5 h-5 ${status.color} ${
                      payout.status === 'processing' ? 'animate-spin' : ''
                    }`} />
                  </div>

                  {/* Info */}
                  <div>
                    <p className={`font-bold ${
                      payout.status === 'completed' ? 'text-primary' : ''
                    }`}>
                      R$ {payout.amount.toFixed(2)}
                    </p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MethodIcon className="w-3 h-3" />
                      <span>{method.label}</span>
                      <span>•</span>
                      <span>
                        {format(new Date(payout.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <Badge variant={status.variant} className="text-xs">
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

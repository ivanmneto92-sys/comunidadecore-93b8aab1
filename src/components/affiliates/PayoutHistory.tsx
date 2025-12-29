import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { History } from 'lucide-react';
import type { PayoutRequest } from '@/hooks/useAffiliate';

interface PayoutHistoryProps {
  payouts: PayoutRequest[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  processing: { label: 'Processando', variant: 'outline' },
  completed: { label: 'Concluído', variant: 'default' },
  rejected: { label: 'Rejeitado', variant: 'destructive' },
};

const methodLabels: Record<string, string> = {
  pix: 'Pix',
  paypal: 'PayPal',
};

export function PayoutHistory({ payouts }: PayoutHistoryProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <History className="h-4 w-4" />
          Histórico de Saques
        </CardTitle>
        <CardDescription className="text-xs">
          Suas solicitações anteriores
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {payouts.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <History className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma solicitação de saque</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => {
              const status = statusConfig[payout.status] || statusConfig.pending;
              return (
                <div key={payout.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        R$ {Number(payout.amount).toFixed(2)}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {methodLabels[payout.payment_method] || payout.payment_method}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(payout.created_at), 'dd MMM yyyy', { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant={status.variant} className="text-[10px]">{status.label}</Badge>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

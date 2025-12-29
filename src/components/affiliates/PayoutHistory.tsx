import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <History className="h-5 w-5" />
          Histórico de Saques
        </CardTitle>
        <CardDescription>
          Suas solicitações de saque anteriores
        </CardDescription>
      </CardHeader>
      <CardContent>
        {payouts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <History className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma solicitação de saque</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead>Método</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payouts.map((payout) => {
                const status = statusConfig[payout.status] || statusConfig.pending;
                return (
                  <TableRow key={payout.id}>
                    <TableCell>
                      {format(new Date(payout.created_at), 'dd MMM yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell className="font-medium">
                      R$ {Number(payout.amount).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      {methodLabels[payout.payment_method] || payout.payment_method}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

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
import { DollarSign } from 'lucide-react';
import type { Commission } from '@/hooks/useAffiliate';

interface CommissionsTableProps {
  commissions: Commission[];
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  pending: { label: 'Pendente', variant: 'secondary' },
  approved: { label: 'Aprovado', variant: 'outline' },
  paid: { label: 'Pago', variant: 'default' },
};

const tierLabels: Record<string, string> = {
  plus: 'Plus',
  elite: 'Elite',
};

export function CommissionsTable({ commissions }: CommissionsTableProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Histórico de Comissões
        </CardTitle>
        <CardDescription>
          Todas as comissões geradas pelas suas indicações
        </CardDescription>
      </CardHeader>
      <CardContent>
        {commissions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma comissão registrada</p>
            <p className="text-sm">Suas comissões aparecerão aqui quando suas indicações assinarem</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>Valor</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {commissions.map((commission) => {
                const status = statusConfig[commission.status] || statusConfig.pending;
                return (
                  <TableRow key={commission.id}>
                    <TableCell>
                      {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{tierLabels[commission.tier] || commission.tier}</Badge>
                    </TableCell>
                    <TableCell className="font-medium text-primary">
                      R$ {Number(commission.amount).toFixed(2)}
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

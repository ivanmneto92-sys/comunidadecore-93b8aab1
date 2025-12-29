import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
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
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <DollarSign className="h-4 w-4" />
          Histórico de Comissões
        </CardTitle>
        <CardDescription className="text-xs">
          Comissões das suas indicações
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-0">
        {commissions.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <DollarSign className="h-10 w-10 mx-auto mb-3 opacity-50" />
            <p className="text-sm">Nenhuma comissão registrada</p>
            <p className="text-xs">Aparecerão aqui quando suas indicações assinarem</p>
          </div>
        ) : (
          <div className="space-y-3">
            {commissions.map((commission) => {
              const status = statusConfig[commission.status] || statusConfig.pending;
              return (
                <div key={commission.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-primary">
                        R$ {Number(commission.amount).toFixed(2)}
                      </span>
                      <Badge variant="outline" className="text-[10px]">
                        {tierLabels[commission.tier] || commission.tier}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(commission.created_at), 'dd MMM yyyy', { locale: ptBR })}
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

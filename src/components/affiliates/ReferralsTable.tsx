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
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Suas Indicações
        </CardTitle>
        <CardDescription>
          Lista de pessoas que usaram seu link de indicação
        </CardDescription>
      </CardHeader>
      <CardContent>
        {referrals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Você ainda não tem indicações</p>
            <p className="text-sm">Compartilhe seu link para começar a ganhar!</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Conversão</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {referrals.map((referral) => {
                const status = statusConfig[referral.status] || statusConfig.pending;
                return (
                  <TableRow key={referral.id}>
                    <TableCell className="font-medium">
                      {referral.profile?.display_name || maskEmail(referral.referred_user_id)}
                    </TableCell>
                    <TableCell>
                      {format(new Date(referral.referred_at), 'dd MMM yyyy', { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {referral.converted_at
                        ? format(new Date(referral.converted_at), 'dd/MM/yyyy', { locale: ptBR })
                        : '-'}
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

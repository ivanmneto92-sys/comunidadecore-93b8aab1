import { useState } from 'react';
import {
  useAurusAccounts,
  type AurusStatusFilter,
} from '@/hooks/useAurus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { AlertCircle, RefreshCw, Users } from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

const FILTERS: { value: AurusStatusFilter; label: string }[] = [
  { value: 'active', label: 'Ativas' },
  { value: 'expiring', label: 'Expirando' },
  { value: 'expired', label: 'Expiradas' },
  { value: 'blocked', label: 'Bloqueadas' },
];

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('pt-BR');
  } catch {
    return iso;
  }
}

function statusVariant(
  code: string,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  if (code === 'active') return 'default';
  if (code === 'expiring' || code === 'expiring_soon') return 'secondary';
  if (code === 'expired' || code === 'blocked') return 'destructive';
  return 'outline';
}

export function AurusAccountsManager() {
  const [status, setStatus] = useState<AurusStatusFilter>('active');
  const { data, isLoading, isError, error, refetch, isFetching } =
    useAurusAccounts(status);

  const accounts = data?.accounts ?? [];

  return (
    <Card>
      <CardHeader className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">Contas Aurus</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
          >
            <RefreshCw
              className={`h-4 w-4 mr-2 ${isFetching ? 'animate-spin' : ''}`}
            />
            Atualizar
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <Button
              key={f.value}
              variant={status === f.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatus(f.value)}
            >
              {f.label}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-12" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Falha ao carregar contas
              {error instanceof Error ? `: ${error.message}` : ''}
            </span>
          </div>
        ) : accounts.length === 0 ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Nenhuma conta encontrada com o status <strong>{status}</strong>.
          </div>
        ) : (
          <>
            <div className="mb-3 text-xs text-muted-foreground">
              {accounts.length} conta(s) encontrada(s)
            </div>
            <div className="overflow-x-auto rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Login</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Expira em</TableHead>
                    <TableHead className="text-right">Dias restantes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((acc) => (
                    <TableRow key={acc.id}>
                      <TableCell className="font-mono text-xs">
                        {acc.login}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">
                            {acc.client.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {acc.client.email}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{acc.accountType}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusVariant(acc.status.code)}>
                          {acc.status.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatDate(acc.expiresAt)}
                      </TableCell>
                      <TableCell className="text-right text-sm">
                        {acc.status.daysUntilExpiration >= 0
                          ? `${acc.status.daysUntilExpiration}d`
                          : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}

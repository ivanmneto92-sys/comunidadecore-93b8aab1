import { useAurusSummary } from '@/hooks/useAurus';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Users,
  UserCheck,
  Wallet,
  TrendingUp,
  Activity,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { formatMoney } from '@/lib/formatMoney';

const NUM = new Intl.NumberFormat('pt-BR');

function formatDateTime(iso: string | null): string {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return '—';
  }
}

export function AurusSummaryCard() {
  const { data, isLoading, isError, error, refetch, isFetching } = useAurusSummary();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Aurus — Licenciamento</CardTitle>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="text-muted-foreground hover:text-foreground transition-colors"
          aria-label="Atualizar"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/5 p-3 text-sm text-destructive">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>
              Falha ao carregar dados da Aurus
              {error instanceof Error ? `: ${error.message}` : ''}
            </span>
          </div>
        ) : data ? (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <Kpi
                icon={<Users className="h-4 w-4" />}
                label="Clientes"
                value={NUM.format(data.clients.total)}
                sub={`${NUM.format(data.clients.active)} ativos`}
              />
              <Kpi
                icon={<UserCheck className="h-4 w-4" />}
                label="Contas ativas"
                value={NUM.format(data.accounts.active)}
                sub={`${NUM.format(data.accounts.total)} no total`}
              />
              <Kpi
                icon={<Wallet className="h-4 w-4" />}
                label="Balance"
                value={USD.format(data.financialTotals.balance)}
                sub={`Equity ${USD.format(data.financialTotals.equity)}`}
              />
              <Kpi
                icon={<TrendingUp className="h-4 w-4" />}
                label="Profit"
                value={USD.format(data.financialTotals.profit)}
                positive={data.financialTotals.profit > 0}
                negative={data.financialTotals.profit < 0}
              />
              <Kpi
                icon={<Activity className="h-4 w-4" />}
                label="Trades"
                value={NUM.format(data.financialTotals.trades)}
              />
              <Kpi
                icon={<AlertCircle className="h-4 w-4" />}
                label="Expirando em breve"
                value={NUM.format(data.accounts.expiringSoon)}
                sub={`${NUM.format(data.accounts.expired)} expiradas`}
              />
            </div>

            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">Real: {NUM.format(data.accounts.real)}</Badge>
                <Badge variant="outline">Demo: {NUM.format(data.accounts.demo)}</Badge>
                {data.accounts.blocked > 0 && (
                  <Badge variant="destructive">
                    Bloqueadas: {NUM.format(data.accounts.blocked)}
                  </Badge>
                )}
              </div>
              <span>
                Última atualização: {formatDateTime(data.reports.lastUpdatedAt)}
              </span>
            </div>
          </>
        ) : null}
      </CardContent>
    </Card>
  );
}

interface KpiProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub?: string;
  positive?: boolean;
  negative?: boolean;
}

function Kpi({ icon, label, value, sub, positive, negative }: KpiProps) {
  const valueColor = positive
    ? 'text-status-success'
    : negative
    ? 'text-destructive'
    : 'text-foreground';
  return (
    <div className="rounded-lg border border-border/60 bg-card/50 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <p className={`mt-1 text-lg font-bold ${valueColor}`}>{value}</p>
      {sub && <p className="text-[11px] text-muted-foreground">{sub}</p>}
    </div>
  );
}

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useMT5Dashboard } from "@/hooks/useMT5Dashboard";
import { useRegenerateMT5Token, useDeleteMT5Account, type MT5Account } from "@/hooks/useMT5Accounts";
import {
  calcWinRate, calcProfitFactor, calcVolume, calcMaxDrawdown,
  calcOperationalPnL, formatCurrency, isOnline,
} from "@/lib/mt5Metrics";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { TrendingUp, TrendingDown, Activity, BarChart3, DollarSign, ArrowDownToLine, ArrowUpFromLine, RefreshCw, Trash2, Copy } from "lucide-react";
import { LineChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { format } from "date-fns";

interface Props {
  account: MT5Account;
}

export function MT5Dashboard({ account }: Props) {
  const { data, isLoading } = useMT5Dashboard(account.id);
  const regen = useRegenerateMT5Token();
  const del = useDeleteMT5Account();

  const metrics = useMemo(() => {
    if (!data) return null;
    const closedDeals = data.deals.filter((d) => d.entry === "out" || d.entry === "inout");
    const winRate = calcWinRate(closedDeals);
    const profitFactor = calcProfitFactor(closedDeals);
    const volume = calcVolume(closedDeals);
    const maxDd = calcMaxDrawdown(data.snapshots);
    const firstSnap = data.snapshots[0];
    const lastSnap = data.snapshots[data.snapshots.length - 1];
    const opPnL = firstSnap && lastSnap
      ? calcOperationalPnL(firstSnap.equity ?? 0, lastSnap.equity ?? 0, data.cashflows)
      : 0;
    return { winRate, profitFactor, volume, maxDd, opPnL, ordersCount: closedDeals.length };
  }, [data]);

  const status = isOnline(account.last_seen_at);

  const handleRegen = async () => {
    try {
      const { token } = await regen.mutateAsync(account.id);
      await navigator.clipboard.writeText(token);
      toast.success("Novo token copiado para a área de transferência", { duration: 5000 });
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao gerar token");
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Excluir a conta ${account.account_login}? Todos os dados serão apagados.`)) return;
    try {
      await del.mutateAsync(account.id);
      toast.success("Conta excluída");
    } catch (e: any) {
      toast.error(e?.message ?? "Falha ao excluir");
    }
  };

  if (isLoading || !data) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    );
  }

  const { latest } = data;
  const dailyPnL = latest?.daily_pnl ?? 0;
  const isPositive = dailyPnL >= 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-xs text-muted-foreground">Conta {account.account_login}</div>
            <div className="text-lg font-bold">{account.broker ?? account.server}</div>
            <div className="flex items-center gap-2 mt-1 text-xs">
              <span className={cn(
                "w-2 h-2 rounded-full",
                status === "online" ? "bg-status-success" : status === "idle" ? "bg-status-warning" : "bg-muted-foreground/40"
              )} />
              <span className="text-muted-foreground">
                {status === "online" ? "Online" : status === "idle" ? "Ocioso" : "Offline"}
                {account.last_seen_at ? ` · último ping ${format(new Date(account.last_seen_at), "HH:mm")}` : ""}
              </span>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={handleRegen} title="Regenerar token">
              <RefreshCw className="w-4 h-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleDelete} title="Excluir conta">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 mt-4">
          <KPI label="Saldo" value={formatCurrency(latest?.balance ?? 0, account.currency)} />
          <KPI label="Equity" value={formatCurrency(latest?.equity ?? 0, account.currency)} />
          <KPI label="Margem livre" value={formatCurrency(latest?.free_margin ?? 0, account.currency)} />
        </div>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-2 gap-3">
        <MetricCard icon={isPositive ? TrendingUp : TrendingDown} label="P/L do dia" value={formatCurrency(dailyPnL, account.currency)} positive={isPositive} />
        <MetricCard icon={DollarSign} label="Lucro operacional (30d)" value={formatCurrency(metrics?.opPnL ?? 0, account.currency)} positive={(metrics?.opPnL ?? 0) >= 0} />
        <MetricCard icon={TrendingDown} label="Drawdown máx (30d)" value={`${(metrics?.maxDd ?? 0).toFixed(2)}%`} />
        <MetricCard icon={BarChart3} label="Win rate" value={`${(metrics?.winRate ?? 0).toFixed(0)}%`} positive={(metrics?.winRate ?? 0) >= 50} />
        <MetricCard icon={Activity} label="Profit factor" value={(metrics?.profitFactor ?? 0) === Infinity ? "∞" : (metrics?.profitFactor ?? 0).toFixed(2)} positive={(metrics?.profitFactor ?? 0) >= 1} />
        <MetricCard icon={Activity} label="Lotes / Ordens" value={`${(metrics?.volume ?? 0).toFixed(2)} / ${metrics?.ordersCount ?? 0}`} />
      </div>

      {/* Equity chart */}
      {data.snapshots.length > 1 && (
        <Card className="p-4">
          <div className="text-sm font-medium mb-2">Equity (30 dias)</div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.snapshots}>
                <XAxis dataKey="captured_at" hide />
                <YAxis hide domain={["auto", "auto"]} />
                <Tooltip
                  contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(v: number) => formatCurrency(v, account.currency)}
                  labelFormatter={(l) => format(new Date(l as string), "dd/MM HH:mm")}
                />
                <Line type="monotone" dataKey="equity" stroke="hsl(var(--primary))" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Recent Trades */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Últimos trades</div>
        {data.deals.filter((d) => d.entry === "out" || d.entry === "inout").length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">Sem trades ainda.</div>
        ) : (
          <div className="space-y-2">
            {data.deals
              .filter((d) => d.entry === "out" || d.entry === "inout")
              .slice(0, 20)
              .map((d) => (
                <div key={d.id} className="flex items-center justify-between text-sm border-b border-border/30 pb-2 last:border-0">
                  <div>
                    <div className="font-medium">{d.symbol ?? "—"} <span className="text-xs text-muted-foreground uppercase">{d.type}</span></div>
                    <div className="text-xs text-muted-foreground">
                      {format(new Date(d.time), "dd/MM HH:mm")} · {d.volume?.toFixed(2)} lots
                    </div>
                  </div>
                  <div className={cn("font-semibold", (d.profit ?? 0) >= 0 ? "text-status-success" : "text-status-danger")}>
                    {formatCurrency(d.profit ?? 0, account.currency)}
                  </div>
                </div>
              ))}
          </div>
        )}
      </Card>

      {/* Cashflows */}
      <Card className="p-4">
        <div className="text-sm font-medium mb-3">Depósitos & Saques</div>
        {data.cashflows.length === 0 ? (
          <div className="text-sm text-muted-foreground text-center py-6">Sem movimentações.</div>
        ) : (
          <div className="space-y-2">
            {data.cashflows.slice(0, 20).map((c) => {
              const isDeposit = c.type === "deposit" || c.type === "bonus" || c.type === "credit";
              return (
                <div key={c.id} className="flex items-center justify-between text-sm border-b border-border/30 pb-2 last:border-0">
                  <div className="flex items-center gap-2">
                    {isDeposit ? <ArrowDownToLine className="w-4 h-4 text-status-success" /> : <ArrowUpFromLine className="w-4 h-4 text-status-danger" />}
                    <div>
                      <div className="font-medium capitalize">{c.type}</div>
                      <div className="text-xs text-muted-foreground">{format(new Date(c.time), "dd/MM HH:mm")}</div>
                    </div>
                  </div>
                  <div className={cn("font-semibold", isDeposit ? "text-status-success" : "text-status-danger")}>
                    {isDeposit ? "+" : "-"}{formatCurrency(Math.abs(c.amount), account.currency)}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}

function KPI({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="text-sm font-bold mt-0.5 truncate">{value}</div>
    </div>
  );
}

function MetricCard({
  icon: Icon, label, value, positive,
}: { icon: any; label: string; value: string; positive?: boolean }) {
  const color = positive === undefined ? "text-foreground" : positive ? "text-status-success" : "text-status-danger";
  return (
    <Card className="p-3">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <Icon className={cn("w-3.5 h-3.5", color)} />
      </div>
      <div className={cn("text-base font-bold mt-1", color)}>{value}</div>
    </Card>
  );
}

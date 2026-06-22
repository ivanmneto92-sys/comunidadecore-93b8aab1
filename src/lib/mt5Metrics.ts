// Metric calculations for MT5 dashboards.
// "Lucro operacional" isolates true strategy P&L from deposits/withdrawals.

export interface DealRow {
  profit: number | null;
  swap: number | null;
  commission: number | null;
  fee: number | null;
  volume: number | null;
  entry: string | null;
}

export interface SnapshotRow {
  captured_at: string;
  equity: number | null;
  balance: number | null;
}

export interface CashflowRow {
  type: string;
  amount: number;
}

export function calcWinRate(deals: DealRow[]): number {
  const closed = deals.filter((d) => d.entry === "out" || d.entry === "inout");
  const wins = closed.filter((d) => (d.profit ?? 0) > 0).length;
  const losses = closed.filter((d) => (d.profit ?? 0) < 0).length;
  const total = wins + losses;
  return total > 0 ? (wins / total) * 100 : 0;
}

export function calcProfitFactor(deals: DealRow[]): number {
  const gross = deals.reduce((acc, d) => acc + Math.max(d.profit ?? 0, 0), 0);
  const loss = deals.reduce((acc, d) => acc + Math.abs(Math.min(d.profit ?? 0, 0)), 0);
  if (loss === 0) return gross > 0 ? Infinity : 0;
  return gross / loss;
}

export function calcNetProfit(deals: DealRow[]): number {
  return deals.reduce(
    (acc, d) =>
      acc + (d.profit ?? 0) + (d.swap ?? 0) + (d.commission ?? 0) + (d.fee ?? 0),
    0
  );
}

export function calcVolume(deals: DealRow[]): number {
  return deals.reduce((acc, d) => acc + (d.volume ?? 0), 0);
}

export function calcMaxDrawdown(snapshots: SnapshotRow[]): number {
  let peak = 0;
  let maxDd = 0;
  for (const s of snapshots) {
    const eq = s.equity ?? 0;
    if (eq > peak) peak = eq;
    if (peak > 0) {
      const dd = ((peak - eq) / peak) * 100;
      if (dd > maxDd) maxDd = dd;
    }
  }
  return maxDd;
}

// Lucro operacional = ΔEquity - depósitos + saques
export function calcOperationalPnL(
  startEquity: number,
  endEquity: number,
  cashflows: CashflowRow[]
): number {
  const deposits = cashflows
    .filter((c) => ["deposit", "bonus", "credit"].includes(c.type) && c.amount > 0)
    .reduce((a, c) => a + c.amount, 0);
  const withdrawals = cashflows
    .filter((c) => c.type === "withdrawal")
    .reduce((a, c) => a + Math.abs(c.amount), 0);
  return endEquity - startEquity - deposits + withdrawals;
}

export function isOnline(lastSeenAt: string | null | undefined): "online" | "idle" | "offline" {
  if (!lastSeenAt) return "offline";
  const diffMs = Date.now() - new Date(lastSeenAt).getTime();
  if (diffMs < 2 * 60 * 1000) return "online";
  if (diffMs < 10 * 60 * 1000) return "idle";
  return "offline";
}

export function formatCurrency(value: number, currency: string = "USD"): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

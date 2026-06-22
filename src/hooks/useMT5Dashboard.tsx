import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface MT5Snapshot {
  id: string;
  captured_at: string;
  balance: number | null;
  equity: number | null;
  credit: number | null;
  margin: number | null;
  free_margin: number | null;
  margin_level: number | null;
  floating_profit: number | null;
  open_positions: number | null;
  daily_pnl: number | null;
  daily_volume: number | null;
  daily_trades: number | null;
}

export interface MT5Deal {
  id: string;
  deal_ticket: number;
  time: string;
  symbol: string | null;
  type: string | null;
  entry: string | null;
  volume: number | null;
  price: number | null;
  profit: number | null;
  swap: number | null;
  commission: number | null;
  fee: number | null;
  comment: string | null;
}

export interface MT5Cashflow {
  id: string;
  deal_ticket: number;
  time: string;
  type: string;
  amount: number;
  comment: string | null;
}

export function useMT5Dashboard(accountId: string | null) {
  return useQuery({
    queryKey: ["mt5-dashboard", accountId],
    enabled: !!accountId,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!accountId) throw new Error("no_account");

      const [latestSnap, snapshots, deals, cashflows] = await Promise.all([
        supabase
          .from("mt5_account_snapshots")
          .select("*")
          .eq("mt5_account_id", accountId)
          .order("captured_at", { ascending: false })
          .limit(1)
          .maybeSingle(),
        supabase
          .from("mt5_account_snapshots")
          .select("captured_at,equity,balance")
          .eq("mt5_account_id", accountId)
          .gte("captured_at", new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
          .order("captured_at", { ascending: true }),
        supabase
          .from("mt5_deals")
          .select("*")
          .eq("mt5_account_id", accountId)
          .order("time", { ascending: false })
          .limit(200),
        supabase
          .from("mt5_cashflows")
          .select("*")
          .eq("mt5_account_id", accountId)
          .order("time", { ascending: false })
          .limit(50),
      ]);

      return {
        latest: (latestSnap.data ?? null) as MT5Snapshot | null,
        snapshots: (snapshots.data ?? []) as { captured_at: string; equity: number | null; balance: number | null }[],
        deals: (deals.data ?? []) as MT5Deal[],
        cashflows: (cashflows.data ?? []) as MT5Cashflow[],
      };
    },
  });
}

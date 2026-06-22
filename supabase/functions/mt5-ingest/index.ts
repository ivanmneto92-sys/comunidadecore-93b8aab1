// MT5 Ingest — receives data from an Expert Advisor on MT5
// Auth: account_login + api_token (validated against sha256 hash stored in DB)
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-mt5-login, x-mt5-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

async function sha256Hex(input: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

interface SnapshotIn {
  balance?: number; equity?: number; credit?: number;
  margin?: number; free_margin?: number; margin_level?: number;
  floating_profit?: number; open_positions?: number;
  daily_pnl?: number; daily_volume?: number; daily_trades?: number;
  captured_at?: string;
}
interface DealIn {
  deal_ticket: number; position_id?: number; time: string;
  symbol?: string; type?: string; entry?: string;
  volume?: number; price?: number; profit?: number;
  swap?: number; commission?: number; fee?: number;
  magic?: number; comment?: string;
}
interface CashflowIn {
  deal_ticket: number; time: string; type: string;
  amount: number; comment?: string;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), {
      status: 405, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const login = req.headers.get("x-mt5-login");
    const token = req.headers.get("x-mt5-token");
    if (!login || !token) {
      return new Response(JSON.stringify({ error: "missing_credentials" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const tokenHash = await sha256Hex(token);

    const { data: account, error: accErr } = await supabase
      .from("mt5_accounts")
      .select("id, api_token_hash, is_active")
      .eq("account_login", Number(login))
      .eq("is_active", true)
      .maybeSingle();

    if (accErr || !account || account.api_token_hash !== tokenHash) {
      return new Response(JSON.stringify({ error: "unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const snapshot: SnapshotIn | undefined = body?.snapshot;
    const deals: DealIn[] = Array.isArray(body?.deals) ? body.deals : [];
    const cashflows: CashflowIn[] = Array.isArray(body?.cashflows) ? body.cashflows : [];

    const result = { snapshots: 0, deals: 0, cashflows: 0 };

    if (snapshot && typeof snapshot === "object") {
      const { error } = await supabase.from("mt5_account_snapshots").insert({
        mt5_account_id: account.id,
        captured_at: snapshot.captured_at ?? new Date().toISOString(),
        balance: snapshot.balance ?? null,
        equity: snapshot.equity ?? null,
        credit: snapshot.credit ?? null,
        margin: snapshot.margin ?? null,
        free_margin: snapshot.free_margin ?? null,
        margin_level: snapshot.margin_level ?? null,
        floating_profit: snapshot.floating_profit ?? null,
        open_positions: snapshot.open_positions ?? null,
        daily_pnl: snapshot.daily_pnl ?? null,
        daily_volume: snapshot.daily_volume ?? null,
        daily_trades: snapshot.daily_trades ?? null,
      });
      if (!error) result.snapshots = 1;
    }

    if (deals.length > 0) {
      const rows = deals.map((d) => ({
        mt5_account_id: account.id,
        deal_ticket: d.deal_ticket,
        position_id: d.position_id ?? null,
        time: d.time,
        symbol: d.symbol ?? null,
        type: d.type ?? null,
        entry: d.entry ?? null,
        volume: d.volume ?? null,
        price: d.price ?? null,
        profit: d.profit ?? 0,
        swap: d.swap ?? 0,
        commission: d.commission ?? 0,
        fee: d.fee ?? 0,
        magic: d.magic ?? null,
        comment: d.comment ?? null,
      }));
      const { error, count } = await supabase
        .from("mt5_deals")
        .upsert(rows, { onConflict: "mt5_account_id,deal_ticket", ignoreDuplicates: true, count: "exact" });
      if (!error) result.deals = count ?? rows.length;
    }

    if (cashflows.length > 0) {
      const rows = cashflows.map((c) => ({
        mt5_account_id: account.id,
        deal_ticket: c.deal_ticket,
        time: c.time,
        type: c.type,
        amount: c.amount,
        comment: c.comment ?? null,
      }));
      const { error, count } = await supabase
        .from("mt5_cashflows")
        .upsert(rows, { onConflict: "mt5_account_id,deal_ticket", ignoreDuplicates: true, count: "exact" });
      if (!error) result.cashflows = count ?? rows.length;
    }

    await supabase
      .from("mt5_accounts")
      .update({ last_seen_at: new Date().toISOString() })
      .eq("id", account.id);

    return new Response(JSON.stringify({ ok: true, inserted: result }), {
      status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "internal_error", message: String(err) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

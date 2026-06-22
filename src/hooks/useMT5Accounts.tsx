import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { generateMT5Token, hashMT5Token } from "@/lib/mt5Token";

export interface MT5Account {
  id: string;
  user_id: string;
  account_login: number;
  server: string;
  broker: string | null;
  currency: string;
  leverage: number | null;
  is_active: boolean;
  last_seen_at: string | null;
  created_at: string;
}

export function useMT5Accounts() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["mt5-accounts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("mt5_accounts")
        .select("id,user_id,account_login,server,broker,currency,leverage,is_active,last_seen_at,created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MT5Account[];
    },
    refetchInterval: 30_000,
  });
}

export interface CreateMT5AccountInput {
  account_login: number;
  server: string;
  broker?: string;
  currency?: string;
  leverage?: number;
}

export function useCreateMT5Account() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateMT5AccountInput) => {
      if (!user) throw new Error("not_authenticated");
      const token = generateMT5Token();
      const api_token_hash = await hashMT5Token(token);
      const { data, error } = await supabase
        .from("mt5_accounts")
        .insert({
          user_id: user.id,
          account_login: input.account_login,
          server: input.server,
          broker: input.broker ?? null,
          currency: input.currency ?? "USD",
          leverage: input.leverage ?? null,
          api_token_hash,
        })
        .select()
        .single();
      if (error) throw error;
      // token is returned ONCE to the caller — never stored client- or server-side
      return { account: data as MT5Account, token };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mt5-accounts"] }),
  });
}

export function useRegenerateMT5Token() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const token = generateMT5Token();
      const api_token_hash = await hashMT5Token(token);
      const { error } = await supabase
        .from("mt5_accounts")
        .update({ api_token_hash })
        .eq("id", accountId);
      if (error) throw error;
      return { token };
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mt5-accounts"] }),
  });
}

export function useDeleteMT5Account() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (accountId: string) => {
      const { error } = await supabase.from("mt5_accounts").delete().eq("id", accountId);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mt5-accounts"] }),
  });
}

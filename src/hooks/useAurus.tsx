import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

async function callAurus<T>(path: string, query?: Record<string, string>): Promise<T> {
  const params = new URLSearchParams({ path, ...(query ?? {}) });
  const { data, error } = await supabase.functions.invoke(
    `aurus-proxy?${params.toString()}`,
    { method: 'GET' },
  );
  if (error) throw error;
  return data as T;
}

export interface AurusSummary {
  serverTime: string;
  clients: { total: number; active: number; inactive: number };
  accounts: {
    total: number;
    active: number;
    expiringSoon: number;
    expired: number;
    blocked: number;
    demo: number;
    real: number;
  };
  reports: { total: number; lastUpdatedAt: string | null };
  financialTotals: {
    balance: number;
    equity: number;
    profit: number;
    deposits: number;
    withdrawals: number;
    trades: number;
    /** ISO 4217, ex.: "USD" ou "BRL". Opcional até o backend Aurus expor. */
    currency?: string | null;
  };
}

export interface AurusAccount {
  id: string;
  login: string;
  accountType: 'REAL' | 'DEMO' | string;
  expiresAt: string;
  active: boolean;
  /** ISO 4217 da conta MT5 (opcional). */
  currency?: string | null;
  balance?: number | null;
  profit?: number | null;
  status: {
    code: string;
    label: string;
    expired: boolean;
    daysUntilExpiration: number;
  };
  createdAt: string;
  updatedAt: string;
  client: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    active: boolean;
  };
  report?: { id: string; updatedAt: string } | null;
}

export interface AurusAccountsResponse {
  accounts: AurusAccount[];
}

export type AurusStatusFilter = 'active' | 'expiring' | 'expired' | 'blocked';

export function useAurusSummary() {
  return useQuery({
    queryKey: ['aurus', 'summary'],
    queryFn: () => callAurus<AurusSummary>('/api/external/summary'),
    staleTime: 60_000,
  });
}

export function useAurusAccounts(status: AurusStatusFilter = 'active') {
  return useQuery({
    queryKey: ['aurus', 'accounts', status],
    queryFn: () =>
      callAurus<AurusAccountsResponse>('/api/external/accounts', { status }),
    staleTime: 60_000,
  });
}

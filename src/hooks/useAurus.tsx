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
  [key: string]: unknown;
}

export interface AurusAccount {
  id?: string;
  status?: string;
  [key: string]: unknown;
}

export function useAurusSummary() {
  return useQuery({
    queryKey: ['aurus', 'summary'],
    queryFn: () => callAurus<AurusSummary>('/api/external/summary'),
    staleTime: 60_000,
  });
}

export function useAurusAccounts(status: string = 'active') {
  return useQuery({
    queryKey: ['aurus', 'accounts', status],
    queryFn: () => callAurus<{ data?: AurusAccount[] } | AurusAccount[]>(
      '/api/external/accounts',
      { status },
    ),
    staleTime: 60_000,
  });
}

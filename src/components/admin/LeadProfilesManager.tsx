import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

type LeadProfile = {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  whatsapp: string;
  gender: string;
  age_range: string;
  work_area: string;
  work_area_other: string | null;
  investment_experience: string;
  is_trader: string;
  prop_firm_status: string;
  investor_profile: string;
  income_range: string;
  initial_investment: string;
  created_at: string;
};

const FIELDS: Array<[keyof LeadProfile, string]> = [
  ['gender', 'Sexo'],
  ['age_range', 'Idade'],
  ['work_area', 'Área de trabalho'],
  ['investment_experience', 'Experiência'],
  ['is_trader', 'Opera como trader'],
  ['prop_firm_status', 'Mesa proprietária'],
  ['investor_profile', 'Perfil investidor'],
  ['income_range', 'Renda mensal'],
  ['initial_investment', 'Investimento inicial'],
];

function aggregate(rows: LeadProfile[], key: keyof LeadProfile) {
  const counts: Record<string, number> = {};
  rows.forEach(r => {
    const v = String(r[key] ?? '—');
    counts[v] = (counts[v] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function toCSV(rows: LeadProfile[]): string {
  const headers = ['created_at','full_name','email','whatsapp','gender','age_range','work_area','work_area_other','investment_experience','is_trader','prop_firm_status','investor_profile','income_range','initial_investment'];
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))].join('\n');
}

export function LeadProfilesManager() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LeadProfile | null>(null);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin_lead_profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lead_profiles')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as LeadProfile[];
    },
  });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r =>
      r.full_name.toLowerCase().includes(q) ||
      r.email.toLowerCase().includes(q) ||
      r.whatsapp.toLowerCase().includes(q),
    );
  }, [rows, search]);

  const downloadCSV = () => {
    const blob = new Blob([toCSV(filtered)], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lead-profiles-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="border border-border rounded-lg p-4">
              <div className="text-xs text-muted-foreground">Total de leads</div>
              <div className="text-2xl font-bold">{rows.length}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {FIELDS.map(([key, label]) => (
          <Card key={key as string}>
            <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
            <CardContent className="space-y-1.5">
              {aggregate(rows, key).map(([v, c]) => {
                const pct = rows.length ? Math.round((c / rows.length) * 100) : 0;
                return (
                  <div key={v} className="text-xs">
                    <div className="flex justify-between mb-0.5">
                      <span className="truncate pr-2">{v}</span>
                      <span className="text-muted-foreground shrink-0">{c} ({pct}%)</span>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
              {rows.length === 0 && <p className="text-xs text-muted-foreground">Sem dados</p>}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle>Respostas individuais</CardTitle>
          <Button size="sm" variant="outline" onClick={downloadCSV} disabled={!filtered.length}>
            <Download className="h-4 w-4 mr-1" /> CSV
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input className="pl-8" placeholder="Buscar por nome, e-mail ou WhatsApp" value={search} onChange={e => setSearch(e.target.value)} />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filtered.map(r => (
              <button key={r.id} onClick={() => setSelected(r)}
                className="w-full text-left border border-border rounded-lg p-3 hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{r.full_name}</div>
                    <div className="text-xs text-muted-foreground truncate">{r.email} · {r.whatsapp}</div>
                  </div>
                  <Badge variant="secondary" className="shrink-0 text-[10px]">{new Date(r.created_at).toLocaleDateString('pt-BR')}</Badge>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  <Badge variant="outline" className="text-[10px]">{r.investor_profile}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.initial_investment}</Badge>
                  <Badge variant="outline" className="text-[10px]">{r.investment_experience}</Badge>
                </div>
              </button>
            ))}
            {!filtered.length && <p className="text-sm text-muted-foreground text-center py-6">Nenhum lead encontrado</p>}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{selected?.full_name}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-2 text-sm">
              <Row label="E-mail" value={selected.email} />
              <Row label="WhatsApp" value={selected.whatsapp} />
              <Row label="Cadastro" value={new Date(selected.created_at).toLocaleString('pt-BR')} />
              {FIELDS.map(([k, l]) => (
                <Row key={k as string} label={l} value={String(selected[k] ?? '—')} />
              ))}
              {selected.work_area_other && <Row label="Área (outro)" value={selected.work_area_other} />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border pb-1.5">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium text-right">{value}</span>
    </div>
  );
}

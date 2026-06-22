import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Loader2, Download, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { QUESTION_FIELDS } from './leadFormOptions';

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

function aggregateAll(rows: LeadProfile[], key: string, options: readonly string[]) {
  const counts: Record<string, number> = {};
  options.forEach(o => { counts[o] = 0; });
  rows.forEach(r => {
    const v = String((r as any)[key] ?? '');
    if (v) counts[v] = (counts[v] ?? 0) + 1;
  });
  return Object.entries(counts).sort((a, b) => b[1] - a[1]);
}

function toCSV(rows: LeadProfile[]): string {
  const headers = ['created_at','full_name','email','whatsapp','gender','age_range','work_area','work_area_other','investment_experience','is_trader','prop_firm_status','investor_profile','income_range','initial_investment'];
  const escape = (v: any) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  return [headers.join(','), ...rows.map(r => headers.map(h => escape((r as any)[h])).join(','))].join('\n');
}

type Preset = '7' | '30' | '90' | 'all' | 'custom';

export function LeadProfilesManager() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<LeadProfile | null>(null);
  const [preset, setPreset] = useState<Preset>('all');
  const [from, setFrom] = useState<Date | undefined>();
  const [to, setTo] = useState<Date | undefined>();

  const range = useMemo(() => {
    const now = new Date();
    if (preset === 'all') return { from: null, to: null };
    if (preset === 'custom') return {
      from: from ? new Date(from.setHours(0,0,0,0)) : null,
      to: to ? new Date(new Date(to).setHours(23,59,59,999)) : null,
    };
    const days = preset === '7' ? 7 : preset === '30' ? 30 : 90;
    const f = new Date(now); f.setDate(f.getDate() - days); f.setHours(0,0,0,0);
    return { from: f, to: null };
  }, [preset, from, to]);

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['admin_lead_profiles', range.from?.toISOString() ?? 'none', range.to?.toISOString() ?? 'none'],
    queryFn: async () => {
      let q = supabase.from('lead_profiles').select('*').order('created_at', { ascending: false });
      if (range.from) q = q.gte('created_at', range.from.toISOString());
      if (range.to) q = q.lte('created_at', range.to.toISOString());
      const { data, error } = await q;
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

  const clearCustom = () => { setFrom(undefined); setTo(undefined); setPreset('all'); };

  if (isLoading) {
    return <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Filtros</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {([
              ['7', 'Últimos 7 dias'],
              ['30', 'Últimos 30 dias'],
              ['90', 'Últimos 90 dias'],
              ['all', 'Tudo'],
              ['custom', 'Personalizado'],
            ] as Array<[Preset, string]>).map(([v, l]) => (
              <Button key={v} size="sm" variant={preset === v ? 'default' : 'outline'} onClick={() => setPreset(v)}>{l}</Button>
            ))}
          </div>

          {preset === 'custom' && (
            <div className="flex flex-wrap gap-2 items-center">
              <DateField label="De" value={from} onChange={setFrom} />
              <DateField label="Até" value={to} onChange={setTo} />
              <Button size="sm" variant="ghost" onClick={clearCustom}>Limpar</Button>
            </div>
          )}

          <p className="text-sm text-muted-foreground">
            Total no período: <span className="font-semibold text-foreground">{rows.length}</span> respostas
          </p>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-sm font-semibold mb-3">Métricas por pergunta</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {QUESTION_FIELDS.map(({ key, label, options }) => (
            <Card key={key}>
              <CardHeader className="pb-2"><CardTitle className="text-sm">{label}</CardTitle></CardHeader>
              <CardContent className="space-y-1.5">
                {aggregateAll(rows, key, options).map(([v, c]) => {
                  const pct = rows.length ? Math.round((c / rows.length) * 100) : 0;
                  const empty = c === 0;
                  return (
                    <div key={v} className={cn('text-xs', empty && 'opacity-50')}>
                      <div className="flex justify-between mb-0.5 gap-2">
                        <span className="truncate">{v}</span>
                        <span className="text-muted-foreground shrink-0">{c} ({pct}%)</span>
                      </div>
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          ))}
        </div>
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
            {!filtered.length && <p className="text-sm text-muted-foreground text-center py-6">Nenhum lead encontrado no período</p>}
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
              {QUESTION_FIELDS.map(({ key, label }) => (
                <Row key={key} label={label} value={String((selected as any)[key] ?? '—')} />
              ))}
              {selected.work_area_other && <Row label="Área (outro)" value={selected.work_area_other} />}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DateField({ label, value, onChange }: { label: string; value?: Date; onChange: (d?: Date) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className={cn('justify-start text-left font-normal', !value && 'text-muted-foreground')}>
          <CalendarIcon className="h-4 w-4 mr-2" />
          {value ? format(value, 'dd/MM/yyyy') : label}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={value} onSelect={onChange} initialFocus className={cn('p-3 pointer-events-auto')} />
      </PopoverContent>
    </Popover>
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

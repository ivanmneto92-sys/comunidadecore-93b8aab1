import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
} from '@/components/ui/drawer';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAllRobotsAdmin, type Robot } from '@/hooks/useRobots';
import { Bot, Plus, Pencil, Trash2, Star } from 'lucide-react';

const sb = supabase as unknown as { from: (t: string) => any };

const emptyDraft: Partial<Robot> = {
  slug: '',
  name: '',
  tagline: '',
  description: '',
  category: 'outro',
  cover_url: '',
  screenshots: [],
  platform: 'MT5',
  pairs: [],
  timeframe: '',
  min_deposit: null,
  risk_level: 'medio',
  external_url: '',
  external_cta_label: 'Saiba mais',
  tier_required: 'free',
  is_published: false,
  is_featured: false,
  sort_order: 0,
};

export function RobotManager() {
  const { data: robots, isLoading } = useAllRobotsAdmin();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<Partial<Robot>>(emptyDraft);
  const [saving, setSaving] = useState(false);

  const openNew = () => {
    setDraft(emptyDraft);
    setOpen(true);
  };

  const openEdit = (r: Robot) => {
    setDraft(r);
    setOpen(true);
  };

  const save = async () => {
    if (!draft.name || !draft.slug) {
      toast({ title: 'Nome e slug são obrigatórios', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      ...draft,
      screenshots: draft.screenshots || [],
      pairs: draft.pairs || [],
      min_deposit: draft.min_deposit || null,
    };
    delete (payload as any).created_at;
    delete (payload as any).updated_at;
    const { error } = draft.id
      ? await sb.from('robots').update(payload).eq('id', draft.id)
      : await sb.from('robots').insert(payload);
    setSaving(false);
    if (error) {
      toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: draft.id ? 'Robô atualizado' : 'Robô criado' });
    queryClient.invalidateQueries({ queryKey: ['robots'] });
    setOpen(false);
  };

  const remove = async (r: Robot) => {
    if (!confirm(`Excluir "${r.name}"?`)) return;
    const { error } = await sb.from('robots').delete().eq('id', r.id);
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Robô excluído' });
    queryClient.invalidateQueries({ queryKey: ['robots'] });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-primary" /> Marketplace de Robôs
          </h2>
          <p className="text-sm text-muted-foreground">Gerencie o catálogo de EAs</p>
        </div>
        <Button onClick={openNew} size="sm" className="gap-2">
          <Plus className="w-4 h-4" /> Novo
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : !robots || robots.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          Nenhum robô cadastrado. Clique em "Novo" para começar.
        </Card>
      ) : (
        <div className="space-y-2">
          {robots.map((r) => (
            <Card key={r.id} className="p-3 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-muted overflow-hidden flex items-center justify-center shrink-0">
                {r.cover_url ? (
                  <img src={r.cover_url} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <Bot className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-medium truncate">{r.name}</p>
                  {r.is_featured && (
                    <Badge variant="secondary" className="gap-1 text-[10px]">
                      <Star className="w-3 h-3" /> destaque
                    </Badge>
                  )}
                  <Badge
                    variant={r.is_published ? 'default' : 'outline'}
                    className="text-[10px]"
                  >
                    {r.is_published ? 'publicado' : 'rascunho'}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  /{r.slug} • {r.platform} • {r.category}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => openEdit(r)}>
                <Pencil className="w-4 h-4" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => remove(r)}
                className="text-destructive"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </Card>
          ))}
        </div>
      )}

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{draft.id ? 'Editar robô' : 'Novo robô'}</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 space-y-3 max-h-[60vh] overflow-y-auto">
            <Field label="Nome">
              <Input
                value={draft.name || ''}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </Field>
            <Field label="Slug (URL)">
              <Input
                value={draft.slug || ''}
                onChange={(e) =>
                  setDraft({ ...draft, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })
                }
              />
            </Field>
            <Field label="Tagline (frase curta)">
              <Input
                value={draft.tagline || ''}
                onChange={(e) => setDraft({ ...draft, tagline: e.target.value })}
              />
            </Field>
            <Field label="Descrição">
              <Textarea
                rows={4}
                value={draft.description || ''}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria">
                <Input
                  value={draft.category || ''}
                  onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                  placeholder="scalper, trend, grid..."
                />
              </Field>
              <Field label="Plataforma">
                <Input
                  value={draft.platform || ''}
                  onChange={(e) => setDraft({ ...draft, platform: e.target.value })}
                />
              </Field>
              <Field label="Timeframe">
                <Input
                  value={draft.timeframe || ''}
                  onChange={(e) => setDraft({ ...draft, timeframe: e.target.value })}
                  placeholder="M5, H1..."
                />
              </Field>
              <Field label="Depósito mínimo (USD)">
                <Input
                  type="number"
                  value={draft.min_deposit ?? ''}
                  onChange={(e) =>
                    setDraft({
                      ...draft,
                      min_deposit: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                />
              </Field>
              <Field label="Risco">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.risk_level}
                  onChange={(e) => setDraft({ ...draft, risk_level: e.target.value })}
                >
                  <option value="baixo">Baixo</option>
                  <option value="medio">Médio</option>
                  <option value="alto">Alto</option>
                </select>
              </Field>
              <Field label="Plano requerido">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={draft.tier_required}
                  onChange={(e) =>
                    setDraft({ ...draft, tier_required: e.target.value as Robot['tier_required'] })
                  }
                >
                  <option value="free">Free</option>
                  <option value="plus">Plus</option>
                  <option value="elite">Elite</option>
                </select>
              </Field>
            </div>
            <Field label="Pares (separados por vírgula)">
              <Input
                value={(draft.pairs || []).join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    pairs: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="URL da capa">
              <Input
                value={draft.cover_url || ''}
                onChange={(e) => setDraft({ ...draft, cover_url: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Screenshots (URLs separadas por vírgula)">
              <Textarea
                rows={2}
                value={(draft.screenshots || []).join(', ')}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    screenshots: e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean),
                  })
                }
              />
            </Field>
            <Field label="URL externa (CTA)">
              <Input
                value={draft.external_url || ''}
                onChange={(e) => setDraft({ ...draft, external_url: e.target.value })}
                placeholder="https://..."
              />
            </Field>
            <Field label="Texto do botão CTA">
              <Input
                value={draft.external_cta_label || ''}
                onChange={(e) => setDraft({ ...draft, external_cta_label: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ordem">
                <Input
                  type="number"
                  value={draft.sort_order ?? 0}
                  onChange={(e) =>
                    setDraft({ ...draft, sort_order: Number(e.target.value) || 0 })
                  }
                />
              </Field>
              <div className="flex flex-col gap-3 justify-end pb-1">
                <label className="flex items-center justify-between gap-2 text-sm">
                  Publicado
                  <Switch
                    checked={!!draft.is_published}
                    onCheckedChange={(v) => setDraft({ ...draft, is_published: v })}
                  />
                </label>
                <label className="flex items-center justify-between gap-2 text-sm">
                  Destaque
                  <Switch
                    checked={!!draft.is_featured}
                    onCheckedChange={(v) => setDraft({ ...draft, is_featured: v })}
                  />
                </label>
              </div>
            </div>
          </div>
          <DrawerFooter>
            <Button onClick={save} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar'}
            </Button>
            <Button variant="ghost" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs">{label}</Label>
      {children}
    </div>
  );
}

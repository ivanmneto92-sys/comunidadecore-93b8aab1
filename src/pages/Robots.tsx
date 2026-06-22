import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowLeft, Bot, Search } from 'lucide-react';
import { useRobots } from '@/hooks/useRobots';
import { RobotCard } from '@/components/robots/RobotCard';

const CATEGORIES = [
  { value: 'all', label: 'Todos' },
  { value: 'scalper', label: 'Scalper' },
  { value: 'trend', label: 'Tendência' },
  { value: 'grid', label: 'Grid' },
  { value: 'news', label: 'Notícias' },
  { value: 'outro', label: 'Outros' },
];

export default function Robots() {
  const navigate = useNavigate();
  const { data: robots, isLoading } = useRobots();
  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const list = robots || [];
    const q = query.trim().toLowerCase();
    return list.filter((r) => {
      if (category !== 'all' && r.category !== category) return false;
      if (!q) return true;
      return (
        r.name.toLowerCase().includes(q) ||
        (r.tagline || '').toLowerCase().includes(q) ||
        r.pairs.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [robots, category, query]);

  return (
    <AppLayout>
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4 animate-fade-in">
          <Button aria-label="Voltar" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/60 flex items-center justify-center shadow-lg shadow-primary/20">
            <Bot className="w-6 h-6 text-background" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Marketplace de Robôs</h1>
            <p className="text-sm text-muted-foreground">EAs curados para estudo</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative animate-fade-in">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, par ou estratégia..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hidden pb-1 -mx-1 px-1">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors border ${
                category === c.value
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card text-muted-foreground border-border hover:text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Disclaimer */}
        <p className="text-[11px] text-muted-foreground/80 leading-relaxed">
          Conteúdo educacional. Não é recomendação de investimento. Resultados passados não garantem
          resultados futuros.
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 space-y-3">
            <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="font-medium">Nenhum robô encontrado</p>
            <p className="text-sm text-muted-foreground">
              Tente outra categoria ou termo de busca.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in">
            {filtered.map((r) => (
              <RobotCard key={r.id} robot={r} />
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

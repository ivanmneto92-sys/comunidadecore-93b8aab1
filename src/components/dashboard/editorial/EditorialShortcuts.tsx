import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, Trophy, ExternalLink } from 'lucide-react';
import monetaLogo from '@/assets/moneta-markets-logo.png.asset.json';

const MONETA_URL = 'https://mmsa.ltd/la-com/CYnKB4g6';

const shortcuts = [
  { to: '/journal', icon: BookOpen, label: 'Diário' },
  { to: '/academy', icon: Sparkles, label: 'Academia' },
  { to: '/community', icon: MessageSquare, label: 'Comunidade' },
  { to: '/achievements', icon: Trophy, label: 'Conquistas' },
];

export function EditorialShortcuts() {
  const navigate = useNavigate();

  return (
    <section className="-mx-4 px-6 py-7 border-b border-accent/15">
      <h2 className="font-display text-xl font-medium tracking-tight mb-4">
        Atalhos
      </h2>

      {/* Featured: Moneta Markets — corretora parceira */}
      <a
        href={MONETA_URL}
        target="_blank"
        rel="noopener noreferrer"
        className="group block mb-3 p-4 rounded-md bg-card border border-primary/30 transition-all hover:-translate-y-0.5 hover:border-primary/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img
              src={monetaLogo.url}
              alt="Moneta Markets"
              className="h-7 w-auto shrink-0"
            />
            <div className="min-w-0">
              <div className="font-display text-sm text-foreground truncate">
                Abra sua conta na Moneta
              </div>
              <div className="text-xs text-muted-foreground truncate">
                Corretora parceira oficial — clique para abrir
              </div>
            </div>
          </div>
          <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden />
        </div>
      </a>

      <div className="grid grid-cols-2 gap-3">
        {shortcuts.map(({ to, icon: Icon, label }) => (
          <button
            key={to}
            onClick={() => navigate(to)}
            className="text-left p-4 rounded-md bg-card border border-accent/15 transition-all hover:-translate-y-0.5 hover:border-primary/40 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <Icon className="w-4 h-4 mb-3 text-primary" aria-hidden />
            <div className="font-display text-sm text-foreground">{label}</div>
          </button>
        ))}
      </div>
    </section>
  );
}

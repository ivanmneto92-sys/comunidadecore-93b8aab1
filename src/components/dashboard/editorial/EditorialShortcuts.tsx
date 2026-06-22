import { useNavigate } from 'react-router-dom';
import { BookOpen, Sparkles, MessageSquare, Trophy } from 'lucide-react';

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

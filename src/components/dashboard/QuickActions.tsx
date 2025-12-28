import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { BarChart3, MessageCircle, GraduationCap, HelpCircle } from 'lucide-react';

const actions = [
  { to: '/results', icon: BarChart3, label: 'Ver Resultados', variant: 'default' as const },
  { to: '/community', icon: MessageCircle, label: 'Comunidade', variant: 'secondary' as const },
  { to: '/academy', icon: GraduationCap, label: 'Tutoriais', variant: 'secondary' as const },
  { to: '/ai', icon: HelpCircle, label: 'Pergunte à IA', variant: 'outline' as const },
];

export function QuickActions() {
  return (
    <div className="grid grid-cols-2 gap-3">
      {actions.map((action) => (
        <Button
          key={action.to}
          variant={action.variant}
          className="h-auto flex-col gap-2 py-4"
          asChild
        >
          <Link to={action.to}>
            <action.icon className="h-5 w-5" />
            <span className="text-xs">{action.label}</span>
          </Link>
        </Button>
      ))}
    </div>
  );
}

import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Brain, GraduationCap } from 'lucide-react';

const quickActions = [
  { 
    to: '/results', 
    icon: BarChart3, 
    label: 'Resultados',
    sublabel: 'Detalhados'
  },
  { 
    to: '/community', 
    icon: Brain, 
    label: 'Leitura',
    sublabel: 'de Risco'
  },
  { 
    to: '/academy', 
    icon: GraduationCap, 
    label: 'Academia',
    sublabel: ''
  },
];

export function HomeQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-2">
      {quickActions.map((action) => (
        <Button
          key={action.to}
          variant="secondary"
          className="flex flex-col h-auto min-h-[80px] py-3 px-2 gap-1.5 rounded-xl"
          onClick={() => navigate(action.to)}
        >
          <div className="p-2 rounded-lg bg-primary/10">
            <action.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[11px] font-medium text-foreground leading-tight">{action.label}</span>
            {action.sublabel && (
              <span className="text-[10px] text-muted-foreground leading-tight">{action.sublabel}</span>
            )}
          </div>
        </Button>
      ))}
    </div>
  );
}

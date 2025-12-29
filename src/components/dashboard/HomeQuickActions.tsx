import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Brain, GraduationCap } from 'lucide-react';

export function HomeQuickActions() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3">
      <Button
        variant="outline"
        className="flex flex-col h-auto py-4 gap-2"
        onClick={() => navigate('/results')}
      >
        <BarChart3 className="h-5 w-5" />
        <span className="text-xs text-center leading-tight">Resultados Detalhados</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col h-auto py-4 gap-2"
        onClick={() => navigate('/community')}
      >
        <Brain className="h-5 w-5" />
        <span className="text-xs text-center leading-tight">Leitura de Risco</span>
      </Button>
      <Button
        variant="outline"
        className="flex flex-col h-auto py-4 gap-2"
        onClick={() => navigate('/academy')}
      >
        <GraduationCap className="h-5 w-5" />
        <span className="text-xs text-center leading-tight">Academia</span>
      </Button>
    </div>
  );
}

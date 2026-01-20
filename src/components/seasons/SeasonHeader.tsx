import { Season } from '@/hooks/useSeason';
import { SeasonDefinition } from '@/lib/seasonDefinitions';
import { ChevronLeft, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SeasonHeaderProps {
  season: Season;
  definition: SeasonDefinition;
}

export function SeasonHeader({ season, definition }: SeasonHeaderProps) {
  const navigate = useNavigate();
  
  // Gradiente baseado no tema
  const gradients: Record<string, string> = {
    forge: 'from-orange-600 via-red-500 to-orange-400',
    ascension: 'from-yellow-500 via-amber-400 to-yellow-300',
    mastery: 'from-purple-600 via-violet-500 to-purple-400',
    legacy: 'from-yellow-400 via-amber-300 to-orange-400',
  };
  
  const gradient = gradients[season.theme] || gradients.forge;

  return (
    <div className={`relative bg-gradient-to-br ${gradient} px-4 pt-4 pb-12`}>
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, white 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }} />
      </div>
      
      {/* Header nav */}
      <div className="relative flex items-center justify-between mb-6">
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => navigate(-1)}
          className="text-white hover:bg-white/20"
        >
          <ChevronLeft className="w-6 h-6" />
        </Button>
        
        <Badge variant="secondary" className="bg-white/20 text-white border-0">
          <Calendar className="w-3 h-3 mr-1" />
          {season.days_remaining} dias restantes
        </Badge>
      </div>
      
      {/* Season info */}
      <div className="relative text-center text-white">
        <span className="text-5xl mb-2 block">{definition.themeEmoji}</span>
        <h1 className="text-2xl font-bold mb-1">
          Temporada {season.number}: {season.name}
        </h1>
        <p className="text-white/80 text-sm max-w-xs mx-auto">
          {definition.description}
        </p>
      </div>
    </div>
  );
}

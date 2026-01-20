import { useSeasonXp } from '@/hooks/useSeasonXp';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { XP_CAPS } from '@/lib/seasonXpCalculator';
import { 
  CheckCircle2, 
  TrendingUp, 
  MessageCircle, 
  BookOpen, 
  Trophy, 
  Users,
  Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

const SOURCE_CONFIG: Record<string, { icon: React.ComponentType<{ className?: string }>; label: string; color: string }> = {
  checkin: { icon: CheckCircle2, label: 'Check-in', color: 'text-green-500' },
  performance: { icon: TrendingUp, label: 'Performance', color: 'text-blue-500' },
  community: { icon: MessageCircle, label: 'Comunidade', color: 'text-purple-500' },
  tutorial: { icon: BookOpen, label: 'Tutoriais', color: 'text-amber-500' },
  achievement: { icon: Trophy, label: 'Conquistas', color: 'text-yellow-500' },
  affiliate: { icon: Users, label: 'Afiliados', color: 'text-pink-500' },
};

export function SeasonXpBreakdown() {
  const { dailyCaps } = useSeasonXp();
  
  // Calcular total do dia
  const totalUsed = dailyCaps?.reduce((sum, c) => sum + c.used, 0) ?? 0;
  const totalCap = XP_CAPS.dailyTotal;
  
  return (
    <div className="space-y-4">
      {/* Total do dia */}
      <Card className="border-primary/20 bg-primary/5">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            XP do Dia
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-2">
            <span className="text-3xl font-bold">{totalUsed}</span>
            <span className="text-muted-foreground">/ {totalCap} máx</span>
          </div>
          <Progress value={(totalUsed / totalCap) * 100} className="h-3" />
          <p className="text-xs text-muted-foreground mt-2">
            Caps diários garantem progressão justa e consistente
          </p>
        </CardContent>
      </Card>
      
      {/* Breakdown por fonte */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Detalhamento por Fonte</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {dailyCaps?.map(cap => {
            const config = SOURCE_CONFIG[cap.source] || SOURCE_CONFIG.checkin;
            const Icon = config.icon;
            const percentage = cap.cap > 0 ? (cap.used / cap.cap) * 100 : 0;
            const isMaxed = cap.remaining === 0;
            
            return (
              <div key={cap.source} className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('w-4 h-4', config.color)} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      'text-sm font-semibold',
                      isMaxed ? 'text-green-500' : 'text-foreground'
                    )}>
                      {cap.used}
                    </span>
                    <span className="text-xs text-muted-foreground">/ {cap.cap}</span>
                  </div>
                </div>
                <Progress 
                  value={percentage} 
                  className={cn('h-2', isMaxed && '[&>div]:bg-green-500')}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
      
      {/* Dicas */}
      <Card className="bg-muted/50">
        <CardContent className="p-4">
          <h4 className="text-sm font-semibold mb-2">💡 Como maximizar XP</h4>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Faça check-in diário para manter seu streak</li>
            <li>• Interações de qualidade na comunidade (curtidas, respostas)</li>
            <li>• Registre no journal para pontos de performance</li>
            <li>• Complete tutoriais semanalmente</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

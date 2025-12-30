import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface AnimatedStatusCardProps {
  status: 'success' | 'warning' | 'danger';
  profileType: 'defensivo' | 'normal' | 'agressivo';
  riskLevel: 'baixo' | 'moderado' | 'alto';
  drawdownStatus: 'controlado' | 'em_observacao' | 'fora_do_padrao';
}

const statusConfig = {
  success: {
    label: 'Estável',
    emoji: '🟢',
    contextPhrase: 'Condições dentro do padrão histórico',
    ringColor: 'stroke-status-success',
    bgGlow: 'shadow-[0_0_30px_-5px_hsl(var(--status-success)/0.3)]',
    percentage: 85,
  },
  warning: {
    label: 'Atenção',
    emoji: '🟡',
    contextPhrase: 'Mercado exige cautela adicional',
    ringColor: 'stroke-status-warning',
    bgGlow: 'shadow-[0_0_30px_-5px_hsl(var(--status-warning)/0.3)]',
    percentage: 55,
  },
  danger: {
    label: 'Risco Elevado',
    emoji: '🔴',
    contextPhrase: 'Momento de preservação de capital',
    ringColor: 'stroke-status-danger',
    bgGlow: 'shadow-[0_0_30px_-5px_hsl(var(--status-danger)/0.3)]',
    percentage: 25,
  },
};

const profileLabels = {
  defensivo: 'Defensivo',
  normal: 'Normal',
  agressivo: 'Agressivo',
};

const riskLabels = {
  baixo: 'Baixo',
  moderado: 'Moderado',
  alto: 'Alto',
};

const drawdownLabels = {
  controlado: 'Controlado',
  em_observacao: 'Em observação',
  fora_do_padrao: 'Fora do padrão',
};

function CircularProgress({ percentage, status }: { percentage: number; status: 'success' | 'warning' | 'danger' }) {
  const config = statusConfig[status];
  const circumference = 2 * Math.PI * 45; // radius = 45
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-28 h-28 flex-shrink-0">
      {/* Background circle */}
      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="6"
          className="stroke-secondary"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className={cn(config.ringColor, 'transition-all duration-1000 ease-out')}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: strokeDashoffset,
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl">{config.emoji}</span>
        <span className="text-xs font-medium text-foreground mt-0.5">{config.label}</span>
      </div>
    </div>
  );
}

export function AnimatedStatusCard({ status, profileType, riskLevel, drawdownStatus }: AnimatedStatusCardProps) {
  const config = statusConfig[status];

  return (
    <Card className={cn('border border-border/50 overflow-hidden', config.bgGlow)}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Circular Indicator */}
          <CircularProgress percentage={config.percentage} status={status} />
          
          {/* Info Section */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-semibold text-foreground">Status do Sistema</h2>
            </div>
            <p className="text-xs text-muted-foreground mb-3">{config.contextPhrase}</p>
            
            {/* Quick Stats */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Perfil</span>
                <span className="text-xs font-medium text-foreground">{profileLabels[profileType]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Risco</span>
                <span className="text-xs font-medium text-foreground">{riskLabels[riskLevel]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Drawdown</span>
                <span className="text-xs font-medium text-foreground">{drawdownLabels[drawdownStatus]}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { cn } from '@/lib/utils';

interface AnimatedStatusCardProps {
  status: 'success' | 'warning' | 'danger';
  profileType: 'defensivo' | 'normal' | 'agressivo';
  riskLevel: 'baixo' | 'moderado' | 'alto';
  drawdownStatus: 'controlado' | 'em_observacao' | 'fora_do_padrao';
  insightText?: string;
}

const statusConfig = {
  success: {
    label: 'Estável',
    emoji: '🟢',
    contextPhrase: 'Sistema operando dentro do padrão',
    ringColor: 'stroke-status-success',
    textColor: 'text-status-success',
    bgGradient: 'from-status-success/20 via-status-success/5 to-transparent',
    percentage: 85,
  },
  warning: {
    label: 'Atenção',
    emoji: '🟡',
    contextPhrase: 'Mercado exige cautela adicional',
    ringColor: 'stroke-status-warning',
    textColor: 'text-status-warning',
    bgGradient: 'from-status-warning/20 via-status-warning/5 to-transparent',
    percentage: 55,
  },
  danger: {
    label: 'Risco Elevado',
    emoji: '🔴',
    contextPhrase: 'Momento de preservação de capital',
    ringColor: 'stroke-status-danger',
    textColor: 'text-status-danger',
    bgGradient: 'from-status-danger/20 via-status-danger/5 to-transparent',
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
  controlado: 'OK',
  em_observacao: 'Atenção',
  fora_do_padrao: 'Crítico',
};

function CircularProgress({ percentage, status }: { percentage: number; status: 'success' | 'warning' | 'danger' }) {
  const config = statusConfig[status];
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative w-32 h-32">
      {/* Glow effect */}
      <div className={cn(
        'absolute inset-0 rounded-full blur-xl opacity-50',
        status === 'success' && 'bg-status-success/30',
        status === 'warning' && 'bg-status-warning/30',
        status === 'danger' && 'bg-status-danger/30'
      )} />
      
      <svg className="w-full h-full -rotate-90 relative" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
          className="stroke-secondary/50"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="42"
          fill="none"
          strokeWidth="8"
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
        <span className="text-3xl">{config.emoji}</span>
        <span className={cn('text-sm font-bold mt-1', config.textColor)}>{config.label}</span>
      </div>
    </div>
  );
}

export function AnimatedStatusCard({ status, profileType, riskLevel, drawdownStatus, insightText }: AnimatedStatusCardProps) {
  const config = statusConfig[status];

  const pills = [
    { label: 'Perfil', value: profileLabels[profileType] },
    { label: 'Risco', value: riskLabels[riskLevel] },
    { label: 'DD', value: drawdownLabels[drawdownStatus] },
  ];

  return (
    <div className={cn(
      'relative overflow-hidden rounded-2xl p-6',
      'bg-gradient-to-br', config.bgGradient,
      'border border-border/50'
    )}>
      {/* Content */}
      <div className="flex flex-col items-center text-center gap-4">
        {/* Circular Indicator */}
        <CircularProgress percentage={config.percentage} status={status} />
        
        {/* Context Phrase */}
        <p className="text-sm text-muted-foreground max-w-xs">
          {config.contextPhrase}
        </p>

        {/* Pills */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          {pills.map((pill) => (
            <span
              key={pill.label}
              className="px-3 py-1 rounded-full bg-secondary/60 text-xs font-medium text-foreground"
            >
              {pill.label}: {pill.value}
            </span>
          ))}
        </div>

        {/* Insight Text - Optional */}
        {insightText && (
          <p className="text-xs text-muted-foreground/80 italic max-w-xs pt-2 border-t border-border/30">
            💡 {insightText}
          </p>
        )}
      </div>
    </div>
  );
}

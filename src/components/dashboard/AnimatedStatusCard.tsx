import { cn } from '@/lib/utils';
import { Shield, Activity, AlertTriangle, LucideIcon } from 'lucide-react';

interface AnimatedStatusCardProps {
  score: number;
  status: 'success' | 'warning' | 'danger';
  profileType: 'defensivo' | 'normal' | 'agressivo';
  riskLevel: 'baixo' | 'moderado' | 'alto';
  drawdownStatus: 'controlado' | 'em_observacao' | 'fora_do_padrao';
  insightText?: string;
}

const statusConfig = {
  success: {
    label: 'Estável',
    Icon: Shield,
    contextPhrase: 'Sistema operando dentro do padrão',
    percentage: 85,
    barGradient: 'from-status-success via-status-success/80 to-status-success/60',
    glowColor: 'bg-status-success/30',
    textColor: 'text-status-success',
    iconBg: 'bg-status-success/10',
  },
  warning: {
    label: 'Atenção',
    Icon: Activity,
    contextPhrase: 'Mercado exige cautela adicional',
    percentage: 55,
    barGradient: 'from-status-warning via-status-warning/80 to-status-warning/60',
    glowColor: 'bg-status-warning/30',
    textColor: 'text-status-warning',
    iconBg: 'bg-status-warning/10',
  },
  danger: {
    label: 'Risco Elevado',
    Icon: AlertTriangle,
    contextPhrase: 'Momento de preservação de capital',
    percentage: 25,
    barGradient: 'from-status-danger via-status-danger/80 to-status-danger/60',
    glowColor: 'bg-status-danger/30',
    textColor: 'text-status-danger',
    iconBg: 'bg-status-danger/10',
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

function HorizontalStatusBar({ percentage, status }: { percentage: number; status: 'success' | 'warning' | 'danger' }) {
  const config = statusConfig[status];

  return (
    <div className="w-full space-y-2">
      <div className="relative h-3 w-full rounded-full bg-secondary/50 overflow-hidden">
        {/* Glow effect */}
        <div 
          className={cn('absolute inset-0 blur-md opacity-50', config.glowColor)}
          style={{ width: `${percentage}%` }}
        />
        {/* Progress bar */}
        <div
          className={cn(
            'h-full rounded-full bg-gradient-to-r transition-all duration-1000 ease-out',
            config.barGradient
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex justify-between items-center text-xs">
        <span className="text-muted-foreground">Saúde do Sistema</span>
        <span className={cn('font-semibold', config.textColor)}>{percentage}%</span>
      </div>
    </div>
  );
}

export function AnimatedStatusCard({ score, status, profileType, riskLevel, drawdownStatus, insightText }: AnimatedStatusCardProps) {
  const config = statusConfig[status];
  const Icon = config.Icon;

  const pills = [
    { label: 'Perfil', value: profileLabels[profileType] },
    { label: 'Risco', value: riskLabels[riskLevel] },
    { label: 'DD', value: drawdownLabels[drawdownStatus] },
  ];

  return (
    <div className="relative overflow-hidden rounded-2xl p-6 bg-card border border-border/50">
      {/* Header with Icon and Status */}
      <div className="flex items-start gap-4 mb-6">
        <div className={cn('p-3 rounded-xl', config.iconBg)}>
          <Icon className={cn('w-7 h-7', config.textColor)} />
        </div>
        <div className="flex-1">
          <h3 className={cn('text-xl font-bold', config.textColor)}>{config.label}</h3>
          <p className="text-sm text-muted-foreground mt-0.5">{config.contextPhrase}</p>
        </div>
      </div>

      {/* Horizontal Status Bar */}
      <div className="mb-6">
        <HorizontalStatusBar percentage={score} status={status} />
      </div>

      {/* Pills */}
      <div className="flex items-center gap-2 flex-wrap">
        {pills.map((pill) => (
          <span
            key={pill.label}
            className="px-3 py-1.5 rounded-full bg-secondary/60 text-xs font-medium text-foreground"
          >
            {pill.label}: {pill.value}
          </span>
        ))}
      </div>

      {/* Insight Text - Optional */}
      {insightText && (
        <p className="text-xs text-muted-foreground/80 italic max-w-xs pt-4 mt-4 border-t border-border/30">
          💡 {insightText}
        </p>
      )}
    </div>
  );
}

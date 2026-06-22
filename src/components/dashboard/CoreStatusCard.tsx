import { memo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface CoreStatusCardProps {
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
    borderColor: 'border-status-success/30',
    bgColor: 'bg-status-success/5',
  },
  warning: {
    label: 'Atenção',
    emoji: '🟡',
    contextPhrase: 'Mercado exige cautela adicional',
    borderColor: 'border-status-warning/30',
    bgColor: 'bg-status-warning/5',
  },
  danger: {
    label: 'Risco Elevado',
    emoji: '🔴',
    contextPhrase: 'Momento de preservação de capital',
    borderColor: 'border-status-danger/30',
    bgColor: 'bg-status-danger/5',
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

export const CoreStatusCard = memo(function CoreStatusCard({ 
  status, 
  profileType, 
  riskLevel, 
  drawdownStatus 
}: CoreStatusCardProps) {
  const config = statusConfig[status];

  return (
    <Card className={cn('border-2', config.borderColor, config.bgColor)}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-foreground">INSTITUTO TRADER | Status Geral</h2>
          <div className="flex items-center gap-2">
            <span className="text-xl">{config.emoji}</span>
            <span className="text-sm font-medium text-foreground">{config.label}</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mb-4 text-right">{config.contextPhrase}</p>
        
        <div className="space-y-2">
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Perfil do dia</span>
            <span className="text-sm font-medium text-foreground">{profileLabels[profileType]}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-border/50">
            <span className="text-sm text-muted-foreground">Risco atual</span>
            <span className="text-sm font-medium text-foreground">{riskLabels[riskLevel]}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-muted-foreground">Situação do drawdown</span>
            <span className="text-sm font-medium text-foreground">{drawdownLabels[drawdownStatus]}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
});

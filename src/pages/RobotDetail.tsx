import { useNavigate, useParams } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PlanGate } from '@/components/plans/PlanGate';
import {
  ArrowLeft,
  Bot,
  ExternalLink,
  Shield,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  Clock,
  Wallet,
} from 'lucide-react';
import { useRobot } from '@/hooks/useRobots';
import { RobotPerformanceChart } from '@/components/robots/RobotPerformanceChart';

const riskConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  baixo: { label: 'Risco Baixo', icon: ShieldCheck, className: 'text-emerald-500' },
  medio: { label: 'Risco Médio', icon: Shield, className: 'text-amber-500' },
  alto: { label: 'Risco Alto', icon: ShieldAlert, className: 'text-red-500' },
};

export default function RobotDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { data: robot, isLoading } = useRobot(slug);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-6 space-y-6">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="aspect-[16/9] w-full rounded-xl" />
          <Skeleton className="h-32 w-full" />
        </div>
      </AppLayout>
    );
  }

  if (!robot) {
    return (
      <AppLayout>
        <div className="container mx-auto px-4 py-12 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
            <Bot className="w-8 h-8 text-muted-foreground" />
          </div>
          <p className="font-medium">Robô não encontrado</p>
          <Button variant="outline" onClick={() => navigate('/robots')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar para o marketplace
          </Button>
        </div>
      </AppLayout>
    );
  }

  const risk = riskConfig[robot.risk_level] || riskConfig.medio;
  const RiskIcon = risk.icon;

  const content = (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3 animate-fade-in">
        <Button aria-label="Voltar" variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <p className="text-sm text-muted-foreground">Marketplace de Robôs</p>
      </div>

      {/* Hero */}
      <div className="space-y-4 animate-fade-in">
        <div className="relative aspect-[16/9] rounded-xl overflow-hidden bg-muted">
          {robot.cover_url ? (
            <img src={robot.cover_url} alt={robot.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/5">
              <Bot className="w-20 h-20 text-primary/60" />
            </div>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{robot.platform}</Badge>
            <Badge variant="outline" className={risk.className}>
              <RiskIcon className="w-3 h-3 mr-1" />
              {risk.label}
            </Badge>
            {robot.tier_required !== 'free' && (
              <Badge className="bg-primary/15 text-primary border-primary/30 capitalize">
                {robot.tier_required}
              </Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold">{robot.name}</h1>
          {robot.tagline && (
            <p className="text-muted-foreground leading-relaxed">{robot.tagline}</p>
          )}
        </div>
      </div>

      {/* Specs */}
      <Card className="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Spec
          icon={TrendingUp}
          label="Pares"
          value={robot.pairs.length ? robot.pairs.join(', ') : '—'}
        />
        <Spec icon={Clock} label="Timeframe" value={robot.timeframe || '—'} />
        <Spec
          icon={Wallet}
          label="Depósito mín."
          value={robot.min_deposit ? `$ ${robot.min_deposit}` : '—'}
        />
        <Spec icon={Shield} label="Categoria" value={robot.category} />
      </Card>
      {/* Performance chart */}
      <Card className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Resultados mensais</h2>
          <span className="text-[11px] text-muted-foreground">% por mês</span>
        </div>
        <RobotPerformanceChart data={robot.monthly_returns ?? []} height={220} />
      </Card>


      {/* Description */}
      {robot.description && (
        <Card className="p-5 space-y-2">
          <h2 className="font-semibold">Sobre o robô</h2>
          <div className="text-sm text-foreground/85 whitespace-pre-wrap leading-relaxed">
            {robot.description}
          </div>
        </Card>
      )}

      {/* Screenshots */}
      {robot.screenshots.length > 0 && (
        <div className="space-y-3">
          <h2 className="font-semibold">Capturas</h2>
          <div className="flex gap-3 overflow-x-auto scrollbar-hidden -mx-4 px-4">
            {robot.screenshots.map((src, i) => (
              <img
                key={i}
                src={src}
                alt={`${robot.name} screenshot ${i + 1}`}
                loading="lazy"
                className="h-48 rounded-lg border border-border/50 object-cover shrink-0"
              />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {robot.external_url && (
        <Card className="p-5 space-y-3 border-primary/30 bg-gradient-to-br from-primary/10 to-transparent">
          <p className="text-sm text-foreground/80">
            Acesse mais informações no canal oficial deste robô.
          </p>
          <a href={robot.external_url} target="_blank" rel="noopener noreferrer">
            <Button className="w-full gap-2">
              {robot.external_cta_label}
              <ExternalLink className="w-4 h-4" />
            </Button>
          </a>
        </Card>
      )}

      <p className="text-[11px] text-muted-foreground/80 leading-relaxed text-center">
        Conteúdo educacional. Não é recomendação de investimento. Resultados passados não garantem
        resultados futuros.
      </p>
    </div>
  );

  return (
    <AppLayout>
      {robot.tier_required && robot.tier_required !== 'free' ? (
        <div className="container mx-auto px-4 py-6">
          <PlanGate required={robot.tier_required} featureName={robot.name}>
            {content}
          </PlanGate>
        </div>
      ) : (
        content
      )}
    </AppLayout>
  );
}

function Spec({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Shield;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-primary" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className="text-sm font-medium truncate capitalize">{value}</p>
      </div>
    </div>
  );
}

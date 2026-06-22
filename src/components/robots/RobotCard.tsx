import { Link } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bot, Star, ShieldAlert, ShieldCheck, Shield, Wallet, TrendingUp } from 'lucide-react';
import type { Robot } from '@/hooks/useRobots';
import { RobotPerformanceChart } from './RobotPerformanceChart';

const riskConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  baixo: { label: 'Risco Baixo', icon: ShieldCheck, className: 'text-emerald-500' },
  medio: { label: 'Risco Médio', icon: Shield, className: 'text-amber-500' },
  alto: { label: 'Risco Alto', icon: ShieldAlert, className: 'text-red-500' },
};

export function RobotCard({ robot }: { robot: Robot }) {
  const risk = riskConfig[robot.risk_level] || riskConfig.medio;
  const RiskIcon = risk.icon;

  return (
    <Link to={`/robots/${robot.slug}`} className="block group">
      <Card className="overflow-hidden h-full border-border/50 hover:border-primary/40 transition-colors">
        <div className="relative aspect-[16/9] bg-muted overflow-hidden">
          {robot.cover_url ? (
            <img
              src={robot.cover_url}
              alt={robot.name}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/15 to-primary/5">
              <Bot className="w-12 h-12 text-primary/60" />
            </div>
          )}
          {robot.is_featured && (
            <Badge className="absolute top-2 left-2 gap-1 bg-primary text-primary-foreground border-0">
              <Star className="w-3 h-3 fill-current" />
              Destaque
            </Badge>
          )}
          <Badge variant="secondary" className="absolute top-2 right-2 text-[10px]">
            {robot.platform}
          </Badge>
        </div>

        <div className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-semibold text-base leading-tight line-clamp-1">{robot.name}</h3>
          </div>
          {robot.tagline && (
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {robot.tagline}
            </p>
          )}
          <div className="flex items-center gap-3 pt-1 text-[11px]">
            <span className={`flex items-center gap-1 ${risk.className}`}>
              <RiskIcon className="w-3 h-3" />
              {risk.label}
            </span>
            {robot.timeframe && (
              <span className="text-muted-foreground">{robot.timeframe}</span>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

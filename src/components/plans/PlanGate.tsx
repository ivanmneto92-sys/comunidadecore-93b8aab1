import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Lock, ArrowRight } from 'lucide-react';
import { useUserProfile, type MembershipTier } from '@/hooks/useUserProfile';
import { hasTierAccess, PLANS } from '@/lib/plans';
import { Button } from '@/components/ui/button';

interface PlanGateProps {
  /** Tier interno mínimo exigido para ver o conteúdo. */
  required: MembershipTier;
  children: ReactNode;
  /** UI alternativa quando o usuário não tem acesso. Default: card de upgrade. */
  fallback?: ReactNode;
  /** Título/contexto para o card de upgrade padrão. */
  featureName?: string;
}

/**
 * Envolve qualquer conteúdo que dependa de plano.
 * Mostra upgrade card se o usuário não tem o tier necessário.
 */
export function PlanGate({ required, children, fallback, featureName }: PlanGateProps) {
  const { membership, loading } = useUserProfile();

  if (loading) {
    return <div className="h-24 rounded-md bg-card/40 animate-pulse" />;
  }

  if (hasTierAccess(membership, required)) {
    return <>{children}</>;
  }

  if (fallback !== undefined) return <>{fallback}</>;

  const suggested = PLANS.find((p) => p.tier === required) ?? PLANS[1];

  return (
    <div className="rounded-md border border-accent/20 bg-card/40 p-6 text-center">
      <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-primary/15">
        <Lock className="h-4 w-4 text-primary" />
      </div>
      <h3 className="font-serif-display text-lg mb-1.5">
        {featureName ? `${featureName} é exclusivo do plano ${suggested.name}` : `Disponível no plano ${suggested.name}`}
      </h3>
      <p className="text-sm text-foreground/65 mb-5 max-w-sm mx-auto leading-relaxed">
        {suggested.tagline}
      </p>
      <Link to="/planos">
        <Button size="sm" className="rounded-full px-5">
          Ver planos <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}

/**
 * Hook auxiliar: retorna se o usuário tem acesso ao tier exigido.
 * Use para hide/show condicional sem trocar a árvore.
 */
export function usePlanAccess(required: MembershipTier) {
  const { membership, loading } = useUserProfile();
  return {
    loading,
    hasAccess: hasTierAccess(membership, required),
    membership,
  };
}

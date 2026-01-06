import { Users, ArrowRight, DollarSign, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface AffiliateQuickCardProps {
  hasAffiliate: boolean;
  availableBalance?: number;
  totalReferrals?: number;
  pendingCommissions?: number;
}

export function AffiliateQuickCard({
  hasAffiliate,
  availableBalance = 0,
  totalReferrals = 0,
  pendingCommissions = 0,
}: AffiliateQuickCardProps) {
  const navigate = useNavigate();
  const hasBalance = availableBalance > 0;

  return (
    <Card
      className={`overflow-hidden border-border/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-lg cursor-pointer group ${
        hasBalance ? 'hover:border-primary/50 hover:shadow-primary/10' : ''
      }`}
      onClick={() => navigate('/affiliates')}
    >
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`w-14 h-14 rounded-xl flex items-center justify-center transition-all duration-300 ${
                hasAffiliate
                  ? 'bg-gradient-to-br from-primary to-primary/60 shadow-lg shadow-primary/20'
                  : 'bg-muted'
              }`}
            >
              <Users className={`w-7 h-7 ${hasAffiliate ? 'text-background' : 'text-muted-foreground'}`} />
            </div>

            {/* Info */}
            <div className="space-y-1">
              <h3 className="font-semibold text-lg">Programa de Afiliados</h3>
              {hasAffiliate ? (
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-primary" />
                    <span className={hasBalance ? 'text-primary font-medium' : 'text-muted-foreground'}>
                      R$ {availableBalance.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-muted-foreground">
                    <TrendingUp className="w-4 h-4" />
                    <span>{totalReferrals} indicações</span>
                  </div>
                  {pendingCommissions > 0 && (
                    <div className="flex items-center gap-1.5 text-amber-500">
                      <span className="text-xs">+{pendingCommissions} pendentes</span>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Ganhe comissões indicando amigos
                </p>
              )}
            </div>
          </div>

          {/* Arrow */}
          <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all duration-300" />
        </div>
      </CardContent>
    </Card>
  );
}

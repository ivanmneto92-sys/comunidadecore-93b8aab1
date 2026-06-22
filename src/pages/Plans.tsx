import { Link } from 'react-router-dom';
import { Check, ArrowRight, Sparkles, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InstitutoTraderLogo } from '@/components/brand/InstitutoTraderLogo';
import { PLANS, formatPriceBRL } from '@/lib/plans';
import { useUserProfile } from '@/hooks/useUserProfile';
import { hasTierAccess } from '@/lib/plans';

export default function Plans() {
  const { membership, loading } = useUserProfile();

  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Header */}
      <header className="border-b border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition">
            <InstitutoTraderLogo variant="horizontal" size={36} />
          </Link>
          <Link to="/auth">
            <Button size="sm" variant="outline" className="rounded-full px-5 border-accent/30">
              Entrar
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="border-b border-accent/15">
        <div className="max-w-4xl mx-auto px-5 pt-20 pb-12 text-center">
          <span className="text-[11px] uppercase tracking-[0.28em] text-primary/85">
            Planos · Instituto Trader
          </span>
          <h1 className="font-serif-display text-4xl md:text-6xl leading-[1.05] tracking-tight mt-5">
            Escolha o seu nível<br />
            de <em className="not-italic text-primary">profundidade</em>.
          </h1>
          <p className="mt-6 text-foreground/65 max-w-2xl mx-auto leading-relaxed">
            Quatro planos, uma única jornada. Comece pelo gratuito e evolua conforme sua rotina,
            seu método e seus objetivos pedirem mais estrutura.
          </p>
        </div>
      </section>

      {/* Planos */}
      <section>
        <div className="max-w-6xl mx-auto px-5 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {PLANS.map((plan) => {
              const isCurrent = !loading && hasTierAccess(membership, plan.tier) &&
                // mostra "Atual" no maior tier que o usuário tem
                PLANS.filter((p) => hasTierAccess(membership, p.tier)).at(-1)?.id === plan.id;

              return (
                <article
                  key={plan.id}
                  className={[
                    'relative rounded-lg border p-7 flex flex-col bg-background transition',
                    plan.highlight
                      ? 'border-primary/55 shadow-lg shadow-primary/10'
                      : 'border-accent/20 hover:border-primary/40',
                  ].join(' ')}
                >
                  {plan.highlight && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-primary-foreground">
                      <Sparkles className="h-3 w-3" /> Mais escolhido
                    </span>
                  )}

                  <div className="mb-5">
                    <h2 className="font-serif-display text-2xl">{plan.name}</h2>
                    <p className="text-xs text-foreground/55 mt-1 leading-relaxed min-h-[2.5rem]">
                      {plan.tagline}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-serif-display text-4xl tabular-nums">
                        {formatPriceBRL(plan.priceBRL)}
                      </span>
                      {plan.priceBRL > 0 && (
                        <span className="text-xs text-foreground/50">/{plan.period}</span>
                      )}
                    </div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-foreground/40 mt-2">
                      Preço base sugerido
                    </p>
                  </div>

                  <ul className="space-y-2.5 mb-7 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-foreground/75 leading-relaxed">
                        <Check className="h-4 w-4 text-primary mt-0.5 shrink-0" strokeWidth={2.5} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button disabled variant="outline" className="rounded-full border-accent/30 w-full">
                      Plano atual
                    </Button>
                  ) : (
                    <Link to="/auth" className="w-full">
                      <Button
                        className="rounded-full w-full"
                        variant={plan.highlight ? 'default' : 'outline'}
                      >
                        {plan.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  )}
                </article>
              );
            })}
          </div>

          {/* Notas */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5 text-xs text-foreground/55">
            <div className="rounded-md border border-accent/15 p-5">
              <Shield className="h-4 w-4 text-primary mb-2" />
              <p className="leading-relaxed">
                <span className="text-foreground/80 font-medium">Sem promessa de lucro.</span> Forex envolve
                risco. Todo conteúdo é educacional e não constitui recomendação de investimento.
              </p>
            </div>
            <div className="rounded-md border border-accent/15 p-5">
              <p className="leading-relaxed">
                <span className="text-foreground/80 font-medium">Pagamentos.</span> Em breve via Stripe ou
                Paddle. O cadastro grátis (Start) já pode ser feito agora.
              </p>
            </div>
            <div className="rounded-md border border-accent/15 p-5">
              <p className="leading-relaxed">
                <span className="text-foreground/80 font-medium">Cancelamento.</span> Você pode cancelar a
                qualquer momento. Sem fidelidade e sem multa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-accent/15 bg-card/20">
        <div className="max-w-3xl mx-auto px-5 py-20 text-center">
          <h2 className="font-serif-display text-3xl md:text-4xl tracking-tight">
            Em dúvida sobre qual plano?
          </h2>
          <p className="mt-4 text-foreground/65 leading-relaxed">
            Comece pelo <strong className="text-foreground">Start</strong> — é grátis. Conheça a Academy, o
            Club e a comunidade, e evolua quando fizer sentido.
          </p>
          <div className="mt-8">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-7 h-12">
                Criar conta grátis <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-foreground/55">
          <div className="flex items-center gap-3">
            <InstitutoTraderLogo variant="mark" size={24} />
            <span>© {new Date().getFullYear()} Instituto Trader</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/" className="hover:text-foreground transition">Início</Link>
            <Link to="/termos" className="hover:text-foreground transition">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground transition">Privacidade</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { InstitutoTraderLogo } from '@/components/brand/InstitutoTraderLogo';
import {
  GraduationCap,
  Users,
  LineChart,
  Compass,
  Radio,
  Copy as CopyIcon,
  Store,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Building2,
  Globe,
} from 'lucide-react';

const valueProps = [
  { icon: GraduationCap, title: 'Aprender', text: 'Trilhas práticas, linguagem clara e conteúdo organizado para evoluir com método.' },
  { icon: Users, title: 'Conectar', text: 'Comunidade ativa, moderada e colaborativa — networking real entre traders.' },
  { icon: LineChart, title: 'Operar', text: 'Copy trading, EAs, indicadores e ferramentas operacionais com transparência.' },
  { icon: Compass, title: 'Evoluir', text: 'Rotina de aprendizado, acompanhamento e visão estratégica de mercado.' },
];

const ecosystem = [
  { icon: GraduationCap, title: 'Academy', text: 'Cursos, aulas, trilhas, tutoriais, glossário e gestão de risco.' },
  { icon: Radio, title: 'Live', text: 'Lives, análises, calendário econômico e replays de sessão.' },
  { icon: CopyIcon, title: 'Copy', text: 'Estratégias replicáveis, acompanhamento operacional e relatórios.' },
  { icon: Store, title: 'Store', text: 'Marketplace de EAs, indicadores, robôs e ferramentas selecionadas.' },
  { icon: Users, title: 'Club', text: 'Comunidade fechada, ranking, desafios e bastidores.' },
  { icon: Sparkles, title: 'Pro', text: 'Plano premium com benefícios exclusivos e acompanhamento próximo.' },
];

const audiences = [
  { title: 'Iniciantes', text: 'Quer começar com direção, base sólida e orientação prática.' },
  { title: 'Intermediários', text: 'Busca método, constância, ferramentas e acompanhamento.' },
  { title: 'Avançados', text: 'Procura estrutura, tecnologia, comunidade e soluções operacionais.' },
];

const journey = [
  { n: '01', title: 'Entra na comunidade', text: 'Cria conta, aceita termos e escolhe o plano.' },
  { n: '02', title: 'Aprende com método', text: 'Trilhas, aulas e materiais práticos.' },
  { n: '03', title: 'Acompanha o mercado', text: 'Lives, análises e calendário econômico.' },
  { n: '04', title: 'Opera e evolui', text: 'Ferramentas, rotina, suporte e visão estratégica.' },
];

const brand = [
  { icon: ShieldCheck, title: 'Confiança', text: 'Transparência, ética e compromisso com o trader.' },
  { icon: Building2, title: 'Estrutura', text: 'Organização, método e solidez para crescer.' },
  { icon: TrendingUp, title: 'Evolução', text: 'Aprendizado contínuo e desenvolvimento constante.' },
  { icon: Globe, title: 'Mercado global', text: 'Atuação alinhada ao Forex e às melhores práticas internacionais.' },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground font-body">
      {/* Top nav */}
      <header className="sticky top-0 z-40 backdrop-blur bg-background/85 border-b border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <InstitutoTraderLogo variant="horizontal" size={36} />
          <nav className="hidden md:flex items-center gap-7 text-sm text-foreground/70">
            <a href="#ecossistema" className="hover:text-foreground transition">Ecossistema</a>
            <a href="#para-quem" className="hover:text-foreground transition">Para quem é</a>
            <Link to="/planos" className="hover:text-foreground transition">Planos</Link>
            <a href="#marca" className="hover:text-foreground transition">A marca</a>
          </nav>
          <Link to="/auth">
            <Button size="sm" className="rounded-full px-5">Entrar</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              'radial-gradient(circle at 20% 30%, hsl(var(--primary)) 0, transparent 45%), radial-gradient(circle at 80% 70%, hsl(var(--accent)) 0, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="max-w-6xl mx-auto px-5 pt-16 pb-20 md:pt-28 md:pb-32 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.28em] text-primary/85 mb-6">
              <span className="h-px w-8 bg-primary/60" />
              Educação · Tecnologia · Comunidade
            </span>
            <h1 className="font-serif-display text-5xl md:text-7xl leading-[1.02] tracking-tight text-foreground">
              Estrutura completa<br />
              para evoluir no <em className="not-italic text-primary">mercado</em>.
            </h1>
            <p className="mt-7 text-lg md:text-xl text-foreground/70 max-w-2xl leading-relaxed">
              O Instituto Trader reúne formação, comunidade, lives, ferramentas e copy trading em um só
              ecossistema — para iniciantes que querem começar com método e para traders que querem operar
              com consistência.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link to="/auth">
                <Button size="lg" className="rounded-full px-7 h-12 text-base">
                  Entrar na plataforma <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <a href="#ecossistema">
                <Button size="lg" variant="outline" className="rounded-full px-7 h-12 text-base border-accent/30">
                  Conhecer o Instituto
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Valor */}
      <section className="border-t border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Proposta de valor</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight">
              Quatro pilares, uma única jornada.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-accent/15">
            {valueProps.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-8 hover:bg-card/40 transition">
                <Icon className="h-7 w-7 text-primary mb-5" strokeWidth={1.5} />
                <h3 className="font-serif-display text-xl mb-2">{title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Ecossistema */}
      <section id="ecossistema" className="border-t border-accent/15 bg-card/20">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div className="max-w-xl">
              <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Ecossistema</span>
              <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight">
                Seis áreas, conectadas por uma só plataforma.
              </h2>
            </div>
            <p className="text-sm text-foreground/55 max-w-sm">
              Cada área foi pensada para um momento da jornada — do primeiro contato à operação avançada.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {ecosystem.map(({ icon: Icon, title, text }) => (
              <article
                key={title}
                className="group relative rounded-md border border-accent/15 bg-background p-7 hover:border-primary/40 transition"
              >
                <div className="flex items-center justify-between mb-6">
                  <Icon className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  <span className="text-[10px] uppercase tracking-[0.2em] text-foreground/40">Área</span>
                </div>
                <h3 className="font-serif-display text-2xl mb-2">{title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Para quem é */}
      <section id="para-quem" className="border-t border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Para quem é</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight">
              Feito para cada estágio do trader.
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {audiences.map((a, i) => (
              <div key={a.title} className="rounded-md border border-accent/15 p-7">
                <span className="text-[11px] tabular-nums text-primary/80">0{i + 1}</span>
                <h3 className="font-serif-display text-xl mt-3 mb-2">{a.title}</h3>
                <p className="text-sm text-foreground/65 leading-relaxed">{a.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Jornada */}
      <section className="border-t border-accent/15 bg-card/20">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Como funciona</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight">
              Uma jornada contínua, do primeiro passo à rotina.
            </h2>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-4 gap-px bg-accent/15">
            {journey.map((step) => (
              <li key={step.n} className="bg-background p-7">
                <span className="font-serif-display text-3xl text-primary/80">{step.n}</span>
                <h3 className="font-serif-display text-lg mt-4 mb-1.5">{step.title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Marca */}
      <section id="marca" className="border-t border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-20 md:py-28">
          <div className="max-w-2xl mb-14">
            <span className="text-[11px] uppercase tracking-[0.25em] text-foreground/50">Nossos valores</span>
            <h2 className="font-serif-display text-3xl md:text-4xl mt-3 leading-tight">
              Confiança, estrutura e evolução — sempre.
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-accent/15">
            {brand.map(({ icon: Icon, title, text }) => (
              <div key={title} className="bg-background p-7">
                <Icon className="h-6 w-6 text-primary mb-4" strokeWidth={1.5} />
                <h3 className="font-serif-display text-lg mb-1.5">{title}</h3>
                <p className="text-xs text-foreground/60 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-accent/15">
        <div className="max-w-4xl mx-auto px-5 py-24 md:py-32 text-center">
          <InstitutoTraderLogo variant="mark" size={56} className="inline-flex mb-8" />
          <h2 className="font-serif-display text-4xl md:text-5xl leading-tight tracking-tight">
            Aprenda, acompanhe e <em className="not-italic text-primary">evolua</em><br />
            com uma estrutura completa.
          </h2>
          <p className="mt-6 text-foreground/65 max-w-xl mx-auto leading-relaxed">
            Educação, tecnologia e comunidade para traders. Comece sua jornada com método.
          </p>
          <div className="mt-10">
            <Link to="/auth">
              <Button size="lg" className="rounded-full px-8 h-12 text-base">
                Entrar na plataforma <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Aviso de risco */}
      <section className="border-t border-accent/15 bg-card/30">
        <div className="max-w-4xl mx-auto px-5 py-10 text-center">
          <p className="text-[11px] uppercase tracking-[0.22em] text-foreground/45 mb-3">Aviso de risco</p>
          <p className="text-sm text-foreground/60 leading-relaxed">
            Forex envolve risco. Conteúdo educacional e informativo — não constitui recomendação de
            investimento, consultoria financeira ou garantia de resultado. Resultados passados não garantem
            resultados futuros.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-accent/15">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-5 text-xs text-foreground/55">
          <div className="flex items-center gap-3">
            <InstitutoTraderLogo variant="mark" size={28} />
            <span>© {new Date().getFullYear()} Instituto Trader</span>
          </div>
          <nav className="flex items-center gap-6">
            <Link to="/planos" className="hover:text-foreground transition">Planos</Link>
            <Link to="/termos" className="hover:text-foreground transition">Termos</Link>
            <Link to="/privacidade" className="hover:text-foreground transition">Privacidade</Link>
            <Link to="/install" className="hover:text-foreground transition">Instalar app</Link>
            <Link to="/auth" className="hover:text-foreground transition">Entrar</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}

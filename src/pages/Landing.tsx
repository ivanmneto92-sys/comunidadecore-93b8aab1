import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import {
  ArrowRight,
  Users,
  PlayCircle,
  Copy as CopyIcon,
  Code2,
  BookOpen,
  Wrench,
  FileText,
  ShieldCheck,
  XCircle,
  Star,
  Crown,
  Gem,
  CheckCircle2,
} from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const NAVY = '#0b1f3a';
const NAVY_DEEP = '#081628';
const NAVY_PANEL = '#0f2748';
const GOLD = '#cca268';
const GOLD_LIGHT = '#ebd7be';

const fontSerif = { fontFamily: "'Libre Baskerville', Georgia, serif" };
const fontSans = { fontFamily: "'IBM Plex Sans', system-ui, sans-serif" };

function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useReveal<HTMLDivElement>();
  return (
    <div
      ref={ref}
      className={`reveal ${className}`}
      data-reveal={visible ? 'in' : undefined}
      style={{ transitionDelay: visible ? `${delay}ms` : '0ms' }}
    >
      {children}
    </div>
  );
}

const heroBullets = [
  { icon: Users, label: '+15k', sub: 'membros na base' },
  { icon: PlayCircle, label: 'Aulas e lives', sub: 'todas as semanas' },
  { icon: ShieldCheck, label: 'Copy trader', sub: 'com gestão de risco' },
  { icon: Code2, label: 'Tecnologia própria', sub: 'ferramentas exclusivas' },
];

const ecosystem = [
  { n: '01', icon: BookOpen, title: 'Academy', text: 'Aulas, tutoriais e trilhas educacionais para quem quer entender o mercado com método, risco e disciplina.' },
  { n: '02', icon: CopyIcon, title: 'Copy Trader', text: 'Estratégias replicáveis com transparência, controle de risco, histórico operacional e relatórios.' },
  { n: '03', icon: Users, title: 'Club', text: 'Comunidade ativa com lives, bastidores, suporte, networking e acompanhamento próximo.' },
  { n: '04', icon: Code2, title: 'Tecnologia', text: 'Robôs, dashboards, automações, marketplace de EAs e ferramentas para traders.' },
];

const differentials = [
  { icon: BookOpen, title: 'Educação antes da operação', text: 'Aprenda, entenda e depois opere com consciência.' },
  { icon: Users, title: 'Comunidade ativa', text: 'Troque experiências, participe de lives e evolua junto.' },
  { icon: Wrench, title: 'Tecnologia aplicada', text: 'Ferramentas, robôs e dashboards para melhor performance.' },
  { icon: FileText, title: 'Transparência operacional', text: 'Histórico real, relatórios e dados sem maquiagens.' },
  { icon: ShieldCheck, title: 'Gestão de risco', text: 'Método, disciplina e controle são a base de tudo.' },
  { icon: XCircle, title: 'Sem promessa de lucro fácil', text: 'Aqui o foco é evolução, não promessas.' },
];

const plans = [
  { icon: Star, name: 'Start', text: 'Para quem quer entrar na comunidade e acessar os primeiros conteúdos.', cta: 'Começar agora', highlight: false },
  { icon: Crown, name: 'Trader', text: 'Para quem quer acesso às aulas, lives, comunidade e materiais completos.', cta: 'Ver plano Trader', highlight: true },
  { icon: Gem, name: 'Pro', text: 'Para quem quer acompanhamento próximo, copy trader, tecnologia e bastidores.', cta: 'Entrar no Pro', highlight: false },
];

// Mock dashboard data
const kpis = [
  { label: 'EQUITY', value: 'R$ 126.840,00', delta: '+ 8,71%' },
  { label: 'DRAWDOWN', value: '-4,32%', delta: 'controlado' },
  { label: 'TRADES', value: '186', delta: '84% vencedores' },
  { label: 'RETORNO (YTD)', value: '+ 27,34%', delta: 'em 2024' },
];

// Sparkline path (mock) — relative coords on viewBox 400x120
const sparkline = 'M0,90 L40,82 L80,88 L120,70 L160,75 L200,55 L240,60 L280,40 L320,48 L360,28 L400,22';

// Bar chart heights for "Desempenho"
const bars = [40, 55, 42, 60, 48, 70, 55, 78, 65, 85, 72, 92];

export default function Landing() {
  return (
    <div style={{ ...fontSans, backgroundColor: NAVY_DEEP }} className="min-h-screen text-white selection:bg-[#cca268]/30 overflow-x-hidden">
      {/* HERO CARD */}
      <section className="px-4 md:px-8 pt-8 pb-12 md:pt-12 md:pb-20">
        <div className="max-w-7xl mx-auto rounded-sm border border-[#cca268]/15 shadow-[0_30px_80px_rgba(0,0,0,0.45)] overflow-hidden" style={{ backgroundColor: NAVY }}>
          {/* Nav */}
          <nav className="flex items-center justify-between px-6 md:px-10 py-5 border-b border-[#cca268]/10">
            <Link to="/" className="flex items-baseline gap-2">
              <span className="text-white text-base font-semibold tracking-tight">INSTITUTO</span>
              <span style={fontSerif} className="text-[#cca268] text-base italic">Trader</span>
            </Link>
            <div className="hidden lg:flex items-center gap-8 text-[10px] uppercase tracking-[0.25em] text-white/65">
              <Link to="/academy" className="hover:text-[#cca268] transition-colors">Academy</Link>
              <Link to="/community" className="hover:text-[#cca268] transition-colors">Club</Link>
              <Link to="/planos" className="hover:text-[#cca268] transition-colors">Planos</Link>
              <a href="#sobre" className="hover:text-[#cca268] transition-colors">Sobre</a>
              <a href="#contato" className="hover:text-[#cca268] transition-colors">Contato</a>
            </div>
            <Link
              to="/auth"
              className="px-5 py-2.5 bg-[#cca268] text-[#0b1f3a] text-[10px] uppercase tracking-[0.25em] font-bold hover:bg-[#ebd7be] transition-colors"
            >
              Entrar
            </Link>
          </nav>

          {/* Hero body */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 px-6 md:px-10 lg:px-14 py-12 md:py-16">
            {/* Left content (6/12) */}
            <div className="lg:col-span-6 flex flex-col justify-center">
              <div className="flex items-center gap-4 mb-7">
                <div className="h-px w-10 bg-[#cca268]" />
                <span className="uppercase tracking-[0.3em] text-[#cca268] text-[10px] font-semibold">Excelência em Trading</span>
              </div>

              <h1 style={fontSerif} className="text-3xl md:text-5xl text-white leading-[1.15] mb-7">
                Onde traders aprendem, operam e evoluem com <span className="italic text-[#cca268]">método.</span>
              </h1>

              <p className="text-slate-300/80 text-base md:text-lg leading-relaxed font-light max-w-lg mb-9">
                Educação, comunidade, copy trader e tecnologia para quem quer tratar o mercado com disciplina, transparência e visão de longo prazo.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <Link
                  to="/auth"
                  className="px-7 py-4 bg-[#cca268] text-[#0b1f3a] text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-[#ebd7be] transition-colors"
                >
                  Entrar para o Instituto
                </Link>
                <Link
                  to="/planos"
                  className="px-7 py-4 border border-[#cca268]/60 text-white text-[11px] uppercase tracking-[0.25em] font-semibold hover:bg-[#cca268]/10 transition-colors"
                >
                  Conhecer os planos
                </Link>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-5 pt-7 border-t border-[#cca268]/10">
                {heroBullets.map((b) => (
                  <div key={b.label} className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full border border-[#cca268]/40 flex items-center justify-center shrink-0">
                      <b.icon className="w-4 h-4 text-[#cca268]" strokeWidth={1.5} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-white text-[13px] font-semibold leading-tight">{b.label}</div>
                      <div className="text-slate-400 text-[11px] leading-tight mt-0.5">{b.sub}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: dashboard mockup (6/12) */}
            <div className="lg:col-span-6 relative">
              <div
                className="absolute inset-0 opacity-[0.08] pointer-events-none"
                style={{
                  backgroundImage: `linear-gradient(to right, ${GOLD} 1px, transparent 1px), linear-gradient(to bottom, ${GOLD} 1px, transparent 1px)`,
                  backgroundSize: '40px 40px',
                }}
              />
              <div className="relative rounded-sm border border-[#cca268]/20 shadow-[0_20px_60px_rgba(0,0,0,0.45)] overflow-hidden" style={{ backgroundColor: NAVY_PANEL }}>
                {/* Dashboard header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-[#cca268]/10 bg-[#0a1f3e]">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#cca268]" />
                    <span className="text-white text-[11px] font-semibold tracking-wide">Dashboard</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-white/15" />
                    <span className="w-2 h-2 rounded-full bg-white/15" />
                    <span className="w-2 h-2 rounded-full bg-white/15" />
                  </div>
                </div>

                {/* Dashboard body */}
                <div className="grid grid-cols-12 gap-3 p-4">
                  {/* Sidebar */}
                  <div className="col-span-3 space-y-1.5">
                    {['Visão Geral', 'Desempenho', 'Operações', 'Histórico', 'Relatórios', 'Contas', 'Configurações', 'Suporte'].map((it, i) => (
                      <div
                        key={it}
                        className={`text-[9px] uppercase tracking-[0.15em] px-2.5 py-1.5 rounded-sm ${
                          i === 0 ? 'bg-[#cca268]/15 text-[#cca268] font-semibold' : 'text-slate-400/80'
                        }`}
                      >
                        {it}
                      </div>
                    ))}
                  </div>

                  {/* Main chart + KPIs */}
                  <div className="col-span-9 space-y-3">
                    {/* Equity chart */}
                    <div className="rounded-sm border border-[#cca268]/10 p-3 bg-[#0a1f3e]">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Equity / Tempo</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-[#cca268]">+27,34%</span>
                      </div>
                      <svg viewBox="0 0 400 120" className="w-full h-20" preserveAspectRatio="none">
                        <defs>
                          <linearGradient id="eqFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={GOLD} stopOpacity="0.35" />
                            <stop offset="100%" stopColor={GOLD} stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <path d={`${sparkline} L400,120 L0,120 Z`} fill="url(#eqFill)" />
                        <path d={sparkline} fill="none" stroke={GOLD} strokeWidth="1.5" />
                      </svg>
                    </div>

                    {/* KPIs */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      {kpis.map((k) => (
                        <div key={k.label} className="rounded-sm border border-[#cca268]/10 p-2.5 bg-[#0a1f3e]">
                          <div className="text-[8px] uppercase tracking-[0.2em] text-slate-400 mb-1">{k.label}</div>
                          <div className="text-white text-[11px] font-semibold leading-tight">{k.value}</div>
                          <div className="text-[#cca268] text-[8px] mt-1 uppercase tracking-[0.15em]">{k.delta}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bars */}
                    <div className="rounded-sm border border-[#cca268]/10 p-3 bg-[#0a1f3e]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-400">Desempenho</span>
                        <span className="text-[9px] uppercase tracking-[0.2em] text-slate-500">Últimos meses</span>
                      </div>
                      <div className="flex items-end gap-1.5 h-14">
                        {bars.map((h, i) => (
                          <div key={i} className="flex-1 rounded-t-sm" style={{ height: `${h}%`, background: `linear-gradient(to top, ${GOLD}, ${GOLD_LIGHT})` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subtle floating accent */}
              <div className="absolute -bottom-4 -right-4 w-32 h-32 border-r border-b border-[#cca268]/25 pointer-events-none hidden md:block" />
            </div>
          </div>
        </div>
      </section>

      {/* ECOSYSTEM */}
      <section className="px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-14 md:mb-20">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#cca268]" />
                <span className="uppercase tracking-[0.3em] text-[#cca268] text-[10px] font-semibold">O Ecossistema</span>
                <div className="h-px w-8 bg-[#cca268]" />
              </div>
              <h2 style={fontSerif} className="text-3xl md:text-5xl text-white leading-[1.15] mb-5">
                Um ecossistema completo<br />
                para <span className="italic text-[#cca268]">evolução no mercado.</span>
              </h2>
              <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto font-light leading-relaxed">
                Tudo que um trader precisa em um só ambiente: educação, comunidade, tecnologia e acompanhamento.
              </p>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {ecosystem.map((e, i) => (
              <Reveal key={e.n} delay={i * 80}>
                <div className="h-full rounded-sm border border-[#cca268]/20 p-7 hover:border-[#cca268]/50 transition-colors" style={{ backgroundColor: NAVY }}>
                  <div className="flex items-start justify-between mb-6">
                    <span style={fontSerif} className="text-[#cca268] text-xl">{e.n}</span>
                    <e.icon className="w-5 h-5 text-[#cca268]" strokeWidth={1.5} />
                  </div>
                  <h3 style={fontSerif} className="text-white text-xl mb-3">{e.title}</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed font-light">{e.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* DIFFERENTIALS */}
      <section id="sobre" className="px-4 md:px-8 py-20 md:py-28 border-t border-[#cca268]/10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <span className="uppercase tracking-[0.3em] text-[#cca268] text-[10px] font-semibold">Por que o Instituto Trader é diferente?</span>
            </div>
          </Reveal>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {differentials.map((d, i) => (
              <Reveal key={d.title} delay={i * 60}>
                <div className="text-center">
                  <div className="w-12 h-12 mx-auto mb-4 rounded-full border border-[#cca268]/40 flex items-center justify-center">
                    <d.icon className="w-5 h-5 text-[#cca268]" strokeWidth={1.5} />
                  </div>
                  <h4 className="text-white text-[13px] font-semibold leading-tight mb-2">{d.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-snug font-light">{d.text}</p>
                </div>
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="text-center text-slate-400 text-sm md:text-base max-w-3xl mx-auto mt-14 font-light leading-relaxed">
              O Instituto Trader foi criado para quem entende que o mercado não recompensa pressa. Recompensa <span className="text-[#cca268]">método, repetição, controle emocional e gestão de risco.</span>
            </p>
          </Reveal>
        </div>
      </section>

      {/* MANIFESTO */}
      <Reveal>
        <section className="px-4 md:px-8 py-20 md:py-24">
          <div className="max-w-5xl mx-auto rounded-sm border border-[#cca268]/15 px-8 md:px-14 py-14 md:py-20 text-center" style={{ backgroundColor: NAVY }}>
            <span className="uppercase tracking-[0.3em] text-[#cca268] text-[10px] font-semibold">Manifesto</span>
            <blockquote style={fontSerif} className="text-white text-2xl md:text-3xl leading-[1.4] mt-8 mb-8">
              “O mercado não recompensa pressa. Recompensa <span className="italic text-[#cca268]">método</span>, repetição e a coragem de operar dentro da própria régua.”
            </blockquote>
            <div className="inline-flex items-baseline gap-2 opacity-70">
              <span className="text-white text-sm tracking-tight">INSTITUTO</span>
              <span style={fontSerif} className="text-[#cca268] text-sm italic">Trader</span>
            </div>
          </div>
        </section>
      </Reveal>

      {/* PLANS */}
      <section className="px-4 md:px-8 py-20 md:py-28 border-t border-[#cca268]/10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-14">
              <div className="flex items-center justify-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#cca268]" />
                <span className="uppercase tracking-[0.3em] text-[#cca268] text-[10px] font-semibold">Planos</span>
                <div className="h-px w-8 bg-[#cca268]" />
              </div>
              <h2 style={fontSerif} className="text-3xl md:text-4xl text-white leading-[1.2]">
                Escolha como deseja <span className="italic text-[#cca268]">começar.</span>
              </h2>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {plans.map((p, i) => (
              <Reveal key={p.name} delay={i * 100}>
                <div
                  className={`h-full rounded-sm p-7 flex flex-col text-center border transition-colors ${
                    p.highlight ? 'border-[#cca268] shadow-[0_20px_50px_rgba(0,0,0,0.4)]' : 'border-[#cca268]/20 hover:border-[#cca268]/50'
                  }`}
                  style={{ backgroundColor: p.highlight ? NAVY_PANEL : NAVY }}
                >
                  <div className="w-10 h-10 mx-auto mb-4 rounded-full border border-[#cca268]/50 flex items-center justify-center">
                    <p.icon className="w-4 h-4 text-[#cca268]" strokeWidth={1.5} />
                  </div>
                  <h3 style={fontSerif} className="text-white text-2xl mb-3">{p.name}</h3>
                  <p className="text-slate-400 text-[13px] leading-relaxed font-light flex-1 mb-6">{p.text}</p>
                  <div className="text-[10px] uppercase tracking-[0.3em] text-[#cca268]/80 mb-4">Em breve</div>
                  <Link
                    to="/planos"
                    className={`block py-3 text-[11px] uppercase tracking-[0.25em] font-bold transition-colors ${
                      p.highlight
                        ? 'bg-[#cca268] text-[#0b1f3a] hover:bg-[#ebd7be]'
                        : 'border border-[#cca268]/50 text-white hover:bg-[#cca268]/10'
                    }`}
                  >
                    {p.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <Reveal>
        <section className="px-4 md:px-8 py-20 md:py-24">
          <div className="max-w-6xl mx-auto rounded-sm border border-[#cca268]/15 overflow-hidden" style={{ backgroundColor: NAVY }}>
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center px-8 md:px-12 py-12 md:py-16">
              <div className="md:col-span-8">
                <h2 style={fontSerif} className="text-2xl md:text-4xl text-white leading-[1.25] mb-5">
                  Entre para o Instituto Trader<br />
                  e evolua com <span className="italic text-[#cca268]">método.</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base font-light leading-relaxed mb-6 max-w-lg">
                  Uma comunidade criada para traders que buscam clareza, disciplina, tecnologia e visão de longo prazo.
                </p>
                <div className="flex items-center gap-2 text-slate-300 text-[12px]">
                  <CheckCircle2 className="w-4 h-4 text-[#cca268]" strokeWidth={1.5} />
                  <span>Acesso à comunidade, conteúdos, tecnologia e planos exclusivos</span>
                </div>
              </div>
              <div className="md:col-span-4 flex md:justify-end">
                <Link
                  to="/auth"
                  className="px-8 py-4 bg-[#cca268] text-[#0b1f3a] text-[11px] uppercase tracking-[0.25em] font-bold hover:bg-[#ebd7be] transition-colors inline-flex items-center gap-2"
                >
                  Criar minha conta
                  <ArrowRight className="w-4 h-4" strokeWidth={2} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </Reveal>

      {/* FOOTER */}
      <footer id="contato" className="px-4 md:px-8 pt-16 pb-10 border-t border-[#cca268]/15">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            <div>
              <Link to="/" className="flex items-baseline gap-2 mb-4">
                <span className="text-white text-base font-semibold tracking-tight">INSTITUTO</span>
                <span style={fontSerif} className="text-[#cca268] text-base italic">Trader</span>
              </Link>
              <p className="text-slate-400 text-[12px] leading-relaxed font-light">
                Educação, comunidade e tecnologia para traders que querem evoluir com método e consistência.
              </p>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#cca268] font-semibold mb-4">Navegação</div>
              <ul className="space-y-2.5 text-[12px] text-slate-300">
                <li><Link to="/academy" className="hover:text-[#cca268] transition-colors">Academy</Link></li>
                <li><Link to="/community" className="hover:text-[#cca268] transition-colors">Club</Link></li>
                <li><Link to="/planos" className="hover:text-[#cca268] transition-colors">Planos</Link></li>
                <li><a href="#sobre" className="hover:text-[#cca268] transition-colors">Sobre</a></li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#cca268] font-semibold mb-4">Institucional</div>
              <ul className="space-y-2.5 text-[12px] text-slate-300">
                <li><Link to="/terms" className="hover:text-[#cca268] transition-colors">Termos de Uso</Link></li>
                <li><Link to="/privacy" className="hover:text-[#cca268] transition-colors">Privacidade</Link></li>
                <li><Link to="/privacy" className="hover:text-[#cca268] transition-colors">Política de Cookies</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[10px] uppercase tracking-[0.3em] text-[#cca268] font-semibold mb-4">Contato</div>
              <ul className="space-y-2.5 text-[12px] text-slate-300">
                <li>suporte@institutotrader.com</li>
                <li>Atendimento via comunidade</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-[#cca268]/10 pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <p className="text-slate-500 text-[11px] leading-relaxed max-w-3xl font-light">
              Conteúdo educacional. O Instituto Trader não garante retorno financeiro. Operações em mercados financeiros envolvem risco e podem resultar em perdas. Avalie sua tolerância ao risco antes de operar.
            </p>
            <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] shrink-0">
              © {new Date().getFullYear()} Instituto Trader
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

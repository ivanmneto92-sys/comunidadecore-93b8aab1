import { Link } from 'react-router-dom';
import type { ReactNode } from 'react';
import { ArrowRight, TrendingUp, ShieldCheck, Quote } from 'lucide-react';
import { useReveal } from '@/hooks/useReveal';

const NAVY = '#0A1128';
const GOLD = '#C5A059';

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

const pillars = [
  { n: '01', title: 'Academy', text: 'Trilhas, aulas e tutoriais com linguagem editorial. Conhecimento de mercado tratado como ofício, não como receita.' },
  { n: '02', title: 'Copy', text: 'Estratégias replicáveis com transparência total: histórico, drawdown, consentimento e relatórios operacionais.' },
  { n: '03', title: 'Pro', text: 'Bastidores, mentorias e acompanhamento próximo. Acesso ao núcleo institucional do Instituto.' },
];

const seals = [
  { k: 'LGPD', v: 'Dados criptografados' },
  { k: 'Educacional', v: 'Sem promessa de retorno' },
  { k: 'Auditado', v: 'Histórico transparente' },
];

const metrics = [
  { v: '15k+', k: 'Membros ativos' },
  { v: '180+', k: 'Aulas publicadas' },
  { v: '24/7', k: 'Comunidade moderada' },
  { v: '5 anos', k: 'Operando no mercado' },
];

const testimonials = [
  {
    quote: 'A primeira escola que tratou o mercado como ofício de longo prazo. O método mudou minha relação com risco.',
    name: 'R. Almeida',
    role: 'Trader · 3 anos no Instituto',
  },
  {
    quote: 'Transparência rara: histórico, drawdown e regras visíveis. É o oposto do que se vê em grupos por aí.',
    name: 'M. Carvalho',
    role: 'Membro Pro',
  },
  {
    quote: 'A comunidade silenciosa, a academy densa e o suporte próximo me fizeram parar de pular de método.',
    name: 'J. Tavares',
    role: 'Trader · 1 ano no Instituto',
  },
];

// Mini ticker editorial — sem prometer retorno, apenas instrumento visual
const ticker = [
  { sym: 'WIN', spread: '0.05' },
  { sym: 'WDO', spread: '0.50' },
  { sym: 'BTC', spread: '0.02' },
  { sym: 'EUR', spread: '0.01' },
];

export default function Landing() {
  return (
    <div style={{ ...fontSans, backgroundColor: NAVY }} className="min-h-screen text-white selection:bg-[#C5A059]/30 overflow-x-hidden">
      {/* Top Nav */}
      <header className="absolute top-0 left-0 right-0 z-40">
        <nav className="max-w-7xl mx-auto flex items-center justify-between px-6 md:px-12 py-6">
          <Link to="/" className="flex items-baseline gap-2">
            <span className="text-white text-lg font-semibold tracking-tight">INSTITUTO</span>
            <span style={fontSerif} className="text-[#C5A059] text-lg italic font-normal">Trader</span>
          </Link>
          <div className="hidden md:flex items-center gap-10 text-[11px] uppercase tracking-[0.25em] text-white/70">
            <Link to="/academy" className="hover:text-[#C5A059] transition-colors">Academy</Link>
            <Link to="/community" className="hover:text-[#C5A059] transition-colors">Club</Link>
            <Link to="/planos" className="hover:text-[#C5A059] transition-colors">Planos</Link>
            <Link to="/auth" className="hover:text-[#C5A059] transition-colors">Entrar</Link>
          </div>
          <Link to="/auth" className="md:hidden text-[11px] uppercase tracking-[0.25em] text-[#C5A059] border-b border-[#C5A059]/40 pb-0.5">
            Entrar
          </Link>
        </nav>
      </header>

      {/* HERO — Cinematic Asymmetric Split */}
      <section className="relative min-h-screen flex items-stretch pt-20 pb-12 px-4 md:px-8">
        <div className="relative w-full max-w-7xl mx-auto grid grid-cols-12 overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.5)] min-h-[calc(100vh-8rem)]">
          {/* Left: Content (7/12) */}
          <div className="col-span-12 md:col-span-7 relative flex flex-col justify-center px-8 md:px-20 py-16 z-10" style={{ backgroundColor: NAVY }}>
            <div
              className="absolute inset-0 opacity-10 pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 2px 2px, ${GOLD} 1px, transparent 0)`,
                backgroundSize: '40px 40px',
              }}
            />
            <div className="relative animate-fade-in">
              <div className="flex items-center gap-4 mb-12">
                <div className="h-px w-12 bg-[#C5A059]" />
                <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] md:text-xs font-semibold">
                  Excelência em Trading
                </span>
              </div>

              <h1 style={fontSerif} className="text-4xl md:text-6xl text-white mb-8 leading-[1.1]">
                Onde a <span className="italic text-[#C5A059]">estratégia</span>
                <br />
                encontra o legado.
              </h1>

              <p className="text-slate-400 text-lg md:text-xl max-w-md mb-12 leading-relaxed font-light">
                Instituto Trader: comunidade, educação e tecnologia para quem trata o mercado com método, disciplina e visão de longo prazo.
              </p>

              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-8">
                <Link
                  to="/auth"
                  className="group relative px-10 py-5 bg-[#C5A059] text-[#0A1128] font-bold text-sm tracking-widest uppercase transition-all duration-500 hover:bg-white overflow-hidden inline-flex items-center"
                >
                  <span className="relative z-10">Conhecer o Instituto</span>
                  <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white transition-transform duration-500" />
                </Link>

                <Link to="/planos" className="group flex items-center gap-3 text-white/80 hover:text-[#C5A059] transition-colors">
                  <span className="text-xs uppercase tracking-widest font-semibold">Ver Planos</span>
                  <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-[#C5A059] transition-all">
                    <ArrowRight className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" strokeWidth={1.5} />
                  </div>
                </Link>
              </div>

              {/* Mobile-only condensed visual block */}
              <div className="md:hidden mt-14 border border-[#C5A059]/20 p-5 flex items-center justify-between">
                <div>
                  <div style={fontSerif} className="text-[#C5A059] text-3xl">+15k</div>
                  <div className="text-[10px] uppercase tracking-[0.25em] text-slate-400 mt-1">Membros do Instituto</div>
                </div>
                <div className="flex flex-col gap-1 text-right">
                  {ticker.slice(0, 3).map((t) => (
                    <div key={t.sym} className="flex items-center justify-end gap-3 text-[10px] tracking-[0.2em] uppercase text-slate-400">
                      <span>{t.sym}</span>
                      <span className="text-[#C5A059]">{t.spread}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Branding */}
            <div className="absolute bottom-8 left-8 md:left-20 hidden md:flex items-baseline gap-2 opacity-40">
              <span className="text-white text-xl font-bold tracking-tighter">INSTITUTO</span>
              <span style={fontSerif} className="text-[#C5A059] text-xl font-normal italic">Trader</span>
            </div>
          </div>

          {/* Right: Editorial Density Panel (5/12) */}
          <div className="hidden md:flex col-span-5 relative flex-col justify-between p-10 lg:p-12 overflow-hidden" style={{ backgroundColor: '#0d1730' }}>
            {/* Subtle grid backdrop */}
            <div
              className="absolute inset-0 opacity-[0.07] pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(to right, #C5A059 1px, transparent 1px), linear-gradient(to bottom, #C5A059 1px, transparent 1px)',
                backgroundSize: '48px 48px',
              }}
            />
            <div
              className="absolute -top-32 -right-32 w-96 h-96 rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(197,160,89,0.18), transparent 60%)' }}
            />

            {/* Vertical Decorative Text */}
            <div className="absolute top-10 right-6" style={{ writingMode: 'vertical-rl' }}>
              <span className="text-white/10 uppercase tracking-[0.8em] text-3xl font-black select-none">INSTITUTIONAL</span>
            </div>

            {/* Top: ticker editorial */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-3.5 h-3.5 text-[#C5A059]" strokeWidth={1.5} />
                <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] font-semibold">Sessão de hoje</span>
              </div>
              <div className="divide-y divide-[#C5A059]/15 border-y border-[#C5A059]/15">
                {ticker.map((t) => (
                  <div key={t.sym} className="flex items-baseline justify-between py-3">
                    <span style={fontSerif} className="text-white text-lg">{t.sym}</span>
                    <span className="text-slate-400 text-[11px] uppercase tracking-[0.2em]">spread {t.spread}</span>
                  </div>
                ))}
              </div>
              <p className="text-slate-500 text-[10px] uppercase tracking-[0.2em] mt-3 leading-relaxed">
                Instrumentos ilustrativos · sem recomendação operacional
              </p>
            </div>

            {/* Middle: pull quote */}
            <div className="relative z-10 my-10">
              <Quote className="w-5 h-5 text-[#C5A059]/40 mb-3" strokeWidth={1} />
              <p style={fontSerif} className="text-white/85 text-base leading-relaxed italic">
                Método antes de palpite. Repetição antes de pressa.
              </p>
            </div>

            {/* Bottom: stat block dourado */}
            <div className="relative z-10 bg-[#C5A059] p-7 shadow-[0_20px_50px_rgba(0,0,0,0.45)]">
              <div className="text-[#0A1128] text-4xl font-bold mb-1" style={fontSerif}>+15k</div>
              <div className="text-[#0A1128]/70 text-[10px] uppercase tracking-[0.25em] font-bold">Membros do Instituto</div>
              <div className="mt-4 pt-4 border-t border-[#0A1128]/15 flex items-center gap-2 text-[10px] uppercase tracking-[0.25em] text-[#0A1128]/80">
                <ShieldCheck className="w-3 h-3" strokeWidth={2} />
                <span>Comunidade verificada</span>
              </div>
            </div>
          </div>

          {/* Decorative Split Divider */}
          <div className="hidden md:block absolute left-[58.333333%] top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-[#C5A059]/40 to-transparent z-20" />
        </div>
      </section>

      {/* METRICS BAR */}
      <Reveal>
        <section className="px-4 md:px-8 border-t border-[#C5A059]/10">
          <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-px bg-[#C5A059]/10">
            {metrics.map((m) => (
              <div key={m.k} className="px-6 py-8 md:py-10" style={{ backgroundColor: NAVY }}>
                <div style={fontSerif} className="text-white text-3xl md:text-4xl">{m.v}</div>
                <div className="text-slate-400 text-[10px] uppercase tracking-[0.25em] mt-2">{m.k}</div>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* PILLARS */}
      <section className="relative px-4 md:px-8 py-24 md:py-32">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="grid grid-cols-12 gap-8 mb-16 md:mb-24">
              <div className="col-span-12 md:col-span-5">
                <div className="flex items-center gap-4 mb-6">
                  <div className="h-px w-12 bg-[#C5A059]" />
                  <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] font-semibold">O Ecossistema</span>
                </div>
                <h2 style={fontSerif} className="text-3xl md:text-5xl text-white leading-[1.15]">
                  Três frentes,<br />
                  <span className="italic text-[#C5A059]">um instituto</span>.
                </h2>
              </div>
              <div className="col-span-12 md:col-span-6 md:col-start-7 flex items-end">
                <p className="text-slate-400 text-base md:text-lg leading-relaxed font-light">
                  Cada frente do Instituto é projetada com a mesma exigência editorial: clareza, transparência e respeito ao seu tempo de evolução.
                </p>
              </div>
            </div>
          </Reveal>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C5A059]/15">
            {pillars.map((p, i) => (
              <Reveal key={p.n} delay={i * 100}>
                <div className="h-full p-10 md:p-12 transition-colors duration-500 hover:bg-[#0d1730] group" style={{ backgroundColor: NAVY }}>
                  <div style={fontSerif} className="text-[#C5A059] text-2xl mb-10">{p.n}</div>
                  <h3 style={fontSerif} className="text-white text-2xl md:text-3xl mb-5">{p.title}</h3>
                  <p className="text-slate-400 font-light leading-relaxed text-[15px]">{p.text}</p>
                  <div className="mt-10 flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#C5A059]/70 group-hover:text-[#C5A059] transition-colors">
                    <span>Explorar</span>
                    <ArrowRight className="w-3 h-3" strokeWidth={1.5} />
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="relative px-4 md:px-8 py-24 md:py-32 border-t border-[#C5A059]/10">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="flex items-center gap-4 mb-16">
              <div className="h-px w-12 bg-[#C5A059]" />
              <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] font-semibold">Vozes do Instituto</span>
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {testimonials.map((t, i) => (
              <Reveal key={t.name} delay={i * 120}>
                <figure className="h-full flex flex-col border-t border-[#C5A059]/20 pt-8">
                  <Quote className="w-5 h-5 text-[#C5A059]/60 mb-5" strokeWidth={1} />
                  <blockquote style={fontSerif} className="text-white/90 text-lg leading-[1.55] mb-8 flex-1">
                    “{t.quote}”
                  </blockquote>
                  <figcaption>
                    <div className="text-white text-sm font-medium">{t.name}</div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-[0.25em] mt-1">{t.role}</div>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MANIFESTO */}
      <Reveal>
        <section className="relative px-4 md:px-8 py-24 md:py-32 border-t border-[#C5A059]/10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="flex items-center justify-center gap-4 mb-10">
              <div className="h-px w-12 bg-[#C5A059]" />
              <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] font-semibold">Manifesto</span>
              <div className="h-px w-12 bg-[#C5A059]" />
            </div>
            <blockquote style={fontSerif} className="text-white text-2xl md:text-4xl leading-[1.35] mb-12">
              “O mercado não recompensa pressa. Recompensa <span className="italic text-[#C5A059]">método</span>, repetição e a coragem de operar dentro da própria régua.”
            </blockquote>
            <div className="inline-flex items-baseline gap-2 opacity-70">
              <span className="text-white text-sm tracking-tight">INSTITUTO</span>
              <span style={fontSerif} className="text-[#C5A059] text-sm italic">Trader</span>
            </div>
          </div>
        </section>
      </Reveal>

      {/* SEALS */}
      <Reveal>
        <section className="px-4 md:px-8 py-16 border-t border-[#C5A059]/10">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-px bg-[#C5A059]/15">
            {seals.map((s) => (
              <div key={s.k} className="px-8 py-10 flex items-baseline justify-between" style={{ backgroundColor: NAVY }}>
                <span style={fontSerif} className="text-[#C5A059] text-lg italic">{s.k}</span>
                <span className="text-slate-400 text-xs uppercase tracking-[0.2em]">{s.v}</span>
              </div>
            ))}
          </div>
        </section>
      </Reveal>

      {/* CTA FINAL */}
      <Reveal>
        <section className="relative px-4 md:px-8 py-24 md:py-32">
          <div className="max-w-5xl mx-auto grid grid-cols-12 gap-8 items-end">
            <div className="col-span-12 md:col-span-8">
              <div className="flex items-center gap-4 mb-6">
                <div className="h-px w-12 bg-[#C5A059]" />
                <span className="uppercase tracking-[0.3em] text-[#C5A059] text-[10px] font-semibold">Começar</span>
              </div>
              <h2 style={fontSerif} className="text-3xl md:text-5xl text-white leading-[1.15]">
                Entre no Instituto. <span className="italic text-[#C5A059]">Sem ruído.</span>
              </h2>
            </div>
            <div className="col-span-12 md:col-span-4 flex md:justify-end">
              <Link
                to="/auth"
                className="group relative px-10 py-5 bg-[#C5A059] text-[#0A1128] font-bold text-sm tracking-widest uppercase transition-all duration-500 hover:bg-white overflow-hidden inline-flex items-center"
              >
                <span className="relative z-10">Criar conta</span>
                <div className="absolute inset-0 translate-y-full group-hover:translate-y-0 bg-white transition-transform duration-500" />
              </Link>
            </div>
          </div>
        </section>
      </Reveal>

      {/* FOOTER + DISCLAIMER */}
      <footer className="px-4 md:px-8 pt-16 pb-10 border-t border-[#C5A059]/15">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-10">
            <Link to="/" className="flex items-baseline gap-2">
              <span className="text-white text-base font-semibold tracking-tight">INSTITUTO</span>
              <span style={fontSerif} className="text-[#C5A059] text-base italic">Trader</span>
            </Link>
            <div className="flex flex-wrap items-center gap-6 text-[11px] uppercase tracking-[0.25em] text-white/60">
              <Link to="/academy" className="hover:text-[#C5A059] transition-colors">Academy</Link>
              <Link to="/community" className="hover:text-[#C5A059] transition-colors">Club</Link>
              <Link to="/planos" className="hover:text-[#C5A059] transition-colors">Planos</Link>
              <Link to="/terms" className="hover:text-[#C5A059] transition-colors">Termos</Link>
              <Link to="/privacy" className="hover:text-[#C5A059] transition-colors">Privacidade</Link>
            </div>
          </div>
          <p className="text-slate-500 text-xs leading-relaxed max-w-4xl font-light">
            Conteúdo educacional. O Instituto Trader não comercializa sinais de entrada/saída nem garante retorno financeiro. Operações em mercados financeiros envolvem risco e podem resultar em perdas. Avalie sua tolerância ao risco antes de operar.
          </p>
          <p className="text-slate-600 text-[10px] uppercase tracking-[0.3em] mt-8">
            © {new Date().getFullYear()} Instituto Trader. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}

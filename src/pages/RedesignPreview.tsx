import { useState } from "react";
import {
  Activity, TrendingUp, Newspaper, BookOpen, Trophy, Users, MessageSquare,
  Flame, ArrowUpRight, Bell, ChevronRight, Sparkles, Calendar,
} from "lucide-react";

const display = { fontFamily: '"Space Grotesk", ui-sans-serif, system-ui' };
const body = { fontFamily: '"DM Sans", ui-sans-serif, system-ui' };

const NAVY = "#0b1f3a";
const GRAPHITE = "#1f2937";
const GOLD = "#cca268";
const GOLD_LIGHT = "#ebd7be";
const FG = "#f4f6f8";

/* ───────────── Direção A — Editorial Silencioso ───────────── */
function DirectionEditorial() {
  return (
    <div className="w-full" style={{ background: NAVY, color: FG, ...body }}>
      <div className="px-6 pt-8 pb-6 border-b" style={{ borderColor: `${GOLD_LIGHT}22` }}>
        <div className="flex items-center justify-between mb-8">
          <div className="text-[10px] uppercase tracking-[0.25em]" style={{ color: GOLD_LIGHT }}>
            Segunda · 22 Jun
          </div>
          <Bell className="w-4 h-4" style={{ color: GOLD_LIGHT }} />
        </div>
        <div className="text-[11px] uppercase tracking-[0.3em] mb-3" style={{ color: GOLD }}>
          Saúde do sistema
        </div>
        <div className="flex items-end gap-3 mb-2">
          <div style={{ ...display, fontSize: 88, lineHeight: 1, fontWeight: 600, color: GOLD, letterSpacing: "-0.04em" }}>
            87
          </div>
          <div className="pb-3 text-xs opacity-60">/100</div>
        </div>
        <div className="text-sm opacity-75 max-w-[280px]" style={display}>
          Operando dentro do regime saudável, com volatilidade controlada.
        </div>
        <div className="mt-6 flex items-center gap-2 text-xs">
          <Flame className="w-3.5 h-3.5" style={{ color: GOLD }} />
          <span>12 dias positivos consecutivos</span>
        </div>
      </div>

      <section className="px-6 py-7 border-b" style={{ borderColor: `${GOLD_LIGHT}22` }}>
        <header className="flex items-baseline justify-between mb-5">
          <h2 style={{ ...display, fontSize: 20, fontWeight: 500, letterSpacing: "-0.02em" }}>
            Performance
          </h2>
          <span className="text-[10px] uppercase tracking-[0.2em] opacity-50">histórico</span>
        </header>
        <div className="flex gap-5 text-xs mb-5 opacity-70" style={display}>
          <span style={{ color: GOLD, borderBottom: `1px solid ${GOLD}`, paddingBottom: 4 }}>7d</span>
          <span>30d</span><span>90d</span><span>12m</span>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div style={{ ...display, fontSize: 44, fontWeight: 600, color: GOLD, letterSpacing: "-0.03em" }}>
              +4.82%
            </div>
            <div className="text-[11px] opacity-60 mt-1">retorno acumulado</div>
          </div>
          <svg width="120" height="48" viewBox="0 0 120 48" fill="none">
            <path d="M0 38 L20 32 L40 35 L60 22 L80 26 L100 14 L120 8" stroke={GOLD} strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      <section className="px-6 py-7 border-b" style={{ borderColor: `${GOLD_LIGHT}22` }}>
        <header className="flex items-baseline justify-between mb-5">
          <h2 style={{ ...display, fontSize: 20, fontWeight: 500 }}>Mercado hoje</h2>
          <Newspaper className="w-4 h-4 opacity-60" />
        </header>
        {[
          ["FED", "Powell sinaliza pausa nos cortes para 2026"],
          ["FX", "Dólar recua ante real após fluxo estrangeiro"],
          ["COMMODITIES", "Ouro renova máxima histórica em sessão asiática"],
        ].map(([tag, h], i) => (
          <article key={i} className="py-3" style={{ borderTop: i ? `1px solid ${GOLD_LIGHT}15` : "none" }}>
            <div className="text-[10px] uppercase tracking-[0.2em] mb-1" style={{ color: GOLD }}>{tag}</div>
            <div className="text-sm leading-snug" style={display}>{h}</div>
          </article>
        ))}
      </section>

      <section className="px-6 py-7 border-b" style={{ borderColor: `${GOLD_LIGHT}22` }}>
        <h2 style={{ ...display, fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Atalhos</h2>
        <div className="grid grid-cols-2 gap-3">
          {[[BookOpen, "Diário"], [Sparkles, "Academia"], [MessageSquare, "Comunidade"], [Trophy, "Conquistas"]].map(
            ([Icon, label], i) => (
              <button key={i} className="text-left p-4 rounded-md transition-all hover:-translate-y-0.5"
                style={{ background: GRAPHITE, border: `1px solid ${GOLD_LIGHT}15` }}>
                <Icon className="w-4 h-4 mb-3" style={{ color: GOLD }} />
                <div className="text-sm" style={display}>{label as string}</div>
              </button>
            )
          )}
        </div>
      </section>

      <section className="px-6 py-7">
        <h2 style={{ ...display, fontSize: 20, fontWeight: 500, marginBottom: 16 }}>Da comunidade</h2>
        {["Lucas comentou em Análise Macro", "Nova aula publicada · Risk Management"].map((t, i) => (
          <div key={i} className="flex items-center justify-between py-3"
            style={{ borderTop: i ? `1px solid ${GOLD_LIGHT}15` : "none" }}>
            <span className="text-sm opacity-80">{t}</span>
            <ChevronRight className="w-4 h-4 opacity-40" />
          </div>
        ))}
        <p className="text-[10px] mt-6 opacity-40 leading-relaxed">
          Conteúdo educacional. Não constitui recomendação de investimento.
        </p>
      </section>
    </div>
  );
}

/* ───────────── Direção B — Densidade Bloomberg ───────────── */
function DirectionDensity() {
  return (
    <div className="w-full" style={{ background: NAVY, color: FG, ...body }}>
      <div className="px-4 pt-5 pb-3 flex items-center justify-between"
        style={{ borderBottom: `1px solid ${GOLD}33` }}>
        <div>
          <div className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>CORE · LIVE</div>
          <div className="text-sm" style={display}>Boa tarde, André</div>
        </div>
        <div className="flex items-center gap-2 text-[10px] uppercase tracking-widest" style={{ color: GOLD_LIGHT }}>
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#22c55e" }} />
          ativo
        </div>
      </div>

      <div className="grid grid-cols-3 gap-px" style={{ background: `${GOLD_LIGHT}15` }}>
        <div className="col-span-2 p-4" style={{ background: NAVY }}>
          <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2">Health</div>
          <div className="flex items-end gap-2">
            <div style={{ ...display, fontSize: 56, fontWeight: 700, color: GOLD, letterSpacing: "-0.04em", lineHeight: 1 }}>
              87
            </div>
            <div className="pb-2 text-xs" style={{ color: GOLD_LIGHT }}>Saudável</div>
          </div>
          <div className="mt-3 h-1 rounded-full overflow-hidden" style={{ background: `${GOLD}20` }}>
            <div className="h-full" style={{ width: "87%", background: GOLD }} />
          </div>
        </div>
        <div className="p-4" style={{ background: NAVY }}>
          <div className="text-[9px] uppercase tracking-widest opacity-50 mb-2">Streak</div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4" style={{ color: GOLD }} />
            <div style={{ ...display, fontSize: 32, fontWeight: 600, color: FG }}>12</div>
          </div>
          <div className="text-[10px] opacity-60 mt-1">dias +</div>
        </div>
      </div>

      <div className="px-4 py-4" style={{ borderBottom: `1px solid ${GOLD_LIGHT}15` }}>
        <div className="flex items-center justify-between mb-3">
          <div className="text-[10px] uppercase tracking-widest" style={{ color: GOLD }}>Performance</div>
          <div className="flex gap-1 text-[10px]" style={display}>
            {["7d", "30d", "90d", "12m"].map((p, i) => (
              <span key={p} className="px-2 py-0.5 rounded"
                style={i === 1 ? { background: GOLD, color: NAVY, fontWeight: 600 } : { color: GOLD_LIGHT, opacity: 0.6 }}>
                {p}
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {[["Retorno", "+12.4%", GOLD], ["Dias +", "18/22", FG], ["Drawdown", "−2.1%", GOLD_LIGHT], ["Win rate", "76%", FG]].map(
            ([l, v, c], i) => (
              <div key={i} className="p-2 rounded" style={{ background: GRAPHITE }}>
                <div className="text-[9px] uppercase opacity-50 mb-1">{l}</div>
                <div style={{ ...display, fontSize: 16, fontWeight: 600, color: c as string }}>{v}</div>
              </div>
            )
          )}
        </div>
        <svg width="100%" height="40" viewBox="0 0 320 40" className="mt-3">
          <path d="M0 30 L40 26 L80 28 L120 18 L160 22 L200 14 L240 16 L280 8 L320 10"
            stroke={GOLD} strokeWidth="1.2" fill="none" />
        </svg>
      </div>

      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${GOLD_LIGHT}15` }}>
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD }}>Mercado</div>
        <div className="space-y-2">
          {[
            ["09:42", "FED", "Powell sinaliza pausa em 2026"],
            ["09:15", "FX", "Dólar recua ante real"],
            ["08:50", "OURO", "Renova máxima histórica"],
          ].map((row, i) => (
            <div key={i} className="grid grid-cols-[44px_56px_1fr] gap-2 items-center text-xs py-1.5"
              style={{ borderTop: i ? `1px dashed ${GOLD_LIGHT}10` : "none" }}>
              <span className="opacity-50 tabular-nums">{row[0]}</span>
              <span style={{ color: GOLD }} className="text-[10px] uppercase tracking-wider">{row[1]}</span>
              <span style={display}>{row[2]}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="px-4 py-3" style={{ borderBottom: `1px solid ${GOLD_LIGHT}15` }}>
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD }}>Atalhos</div>
        <div className="grid grid-cols-4 gap-2">
          {[[BookOpen, "Diário"], [Sparkles, "Academia"], [Users, "Comunidade"], [Trophy, "Conquistas"]].map(
            ([Icon, l], i) => (
              <button key={i} className="flex flex-col items-center gap-1.5 py-3 rounded"
                style={{ background: GRAPHITE, border: `1px solid ${GOLD_LIGHT}10` }}>
                <Icon className="w-4 h-4" style={{ color: GOLD }} />
                <span className="text-[10px]" style={display}>{l as string}</span>
              </button>
            )
          )}
        </div>
      </div>

      <div className="px-4 py-3">
        <div className="text-[10px] uppercase tracking-widest mb-2" style={{ color: GOLD }}>Feed</div>
        {["Lucas em Análise Macro · há 4 min", "Nova aula · Risk Management"].map((t, i) => (
          <div key={i} className="flex items-center justify-between py-1.5 text-xs"
            style={{ borderTop: i ? `1px dashed ${GOLD_LIGHT}10` : "none" }}>
            <span>{t}</span>
            <ChevronRight className="w-3 h-3 opacity-40" />
          </div>
        ))}
        <p className="text-[9px] mt-3 opacity-40">Conteúdo educacional · não é recomendação.</p>
      </div>
    </div>
  );
}

/* ───────────── Direção C — Hero Hipnótico ───────────── */
function DirectionHero() {
  return (
    <div className="w-full" style={{ background: NAVY, color: FG, ...body }}>
      <div className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full" style={{ background: GOLD_LIGHT }} />
          <div>
            <div className="text-[10px] opacity-50 uppercase tracking-wider">Boa tarde</div>
            <div className="text-sm font-medium" style={display}>André</div>
          </div>
        </div>
        <Bell className="w-5 h-5" style={{ color: GOLD_LIGHT }} />
      </div>

      <div className="px-5 pt-6 pb-12 text-center relative overflow-hidden"
        style={{ background: `radial-gradient(circle at 50% 0%, ${GOLD}18, transparent 60%)` }}>
        <div className="text-[10px] uppercase tracking-[0.3em] mb-6" style={{ color: GOLD_LIGHT }}>
          Saúde do sistema
        </div>
        <div className="relative inline-block">
          <svg width="240" height="240" viewBox="0 0 240 240">
            <circle cx="120" cy="120" r="100" stroke={`${GOLD_LIGHT}20`} strokeWidth="2" fill="none" />
            <circle cx="120" cy="120" r="100" stroke={GOLD} strokeWidth="3" fill="none"
              strokeDasharray={`${2 * Math.PI * 100 * 0.87} ${2 * Math.PI * 100}`}
              strokeDashoffset={2 * Math.PI * 100 * 0.25} transform="rotate(-90 120 120)" strokeLinecap="round" />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div style={{ ...display, fontSize: 96, fontWeight: 700, color: GOLD, letterSpacing: "-0.05em", lineHeight: 1 }}>
              87
            </div>
            <div className="text-xs opacity-60 mt-2">de 100</div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 mt-6 text-sm" style={display}>
          <Flame className="w-4 h-4" style={{ color: GOLD }} />
          <span>12 dias positivos · sistema saudável</span>
        </div>
      </div>

      <div className="px-5 py-4">
        <div className="rounded-2xl p-4 mb-3" style={{ background: GRAPHITE, border: `1px solid ${GOLD_LIGHT}10` }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wider opacity-60">Performance · 30d</span>
            <ArrowUpRight className="w-4 h-4" style={{ color: GOLD }} />
          </div>
          <div className="flex items-end justify-between">
            <div style={{ ...display, fontSize: 36, fontWeight: 600, color: GOLD }}>+12.4%</div>
            <svg width="90" height="32" viewBox="0 0 90 32">
              <path d="M0 24 L15 20 L30 22 L45 14 L60 16 L75 10 L90 6" stroke={GOLD} strokeWidth="1.5" fill="none" />
            </svg>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-3">
          {[[Newspaper, "Mercado", "3 novas"], [TrendingUp, "Diário", "hoje +2"]].map(([Icon, l, sub], i) => (
            <div key={i} className="rounded-2xl p-4" style={{ background: GRAPHITE, border: `1px solid ${GOLD_LIGHT}10` }}>
              <Icon className="w-4 h-4 mb-2" style={{ color: GOLD }} />
              <div className="text-sm" style={display}>{l as string}</div>
              <div className="text-[10px] opacity-50 mt-1">{sub as string}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-4 gap-2 mb-4">
          {[[BookOpen, "Diário"], [Sparkles, "Aulas"], [Users, "Chat"], [Trophy, "Badges"]].map(([Icon, l], i) => (
            <button key={i} className="flex flex-col items-center gap-1 py-3 rounded-xl"
              style={{ background: `${GOLD_LIGHT}08`, border: `1px solid ${GOLD_LIGHT}15` }}>
              <Icon className="w-4 h-4" style={{ color: GOLD }} />
              <span className="text-[10px]" style={display}>{l as string}</span>
            </button>
          ))}
        </div>

        <div className="rounded-2xl p-4" style={{ background: GRAPHITE, border: `1px solid ${GOLD_LIGHT}10` }}>
          <div className="text-xs uppercase tracking-wider opacity-60 mb-3">Da comunidade</div>
          {["Lucas comentou · Análise Macro", "Nova aula · Risk Management"].map((t, i) => (
            <div key={i} className="flex items-center gap-2 py-2 text-sm"
              style={{ borderTop: i ? `1px solid ${GOLD_LIGHT}10` : "none" }}>
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} />
              <span style={display}>{t}</span>
            </div>
          ))}
        </div>
        <p className="text-[10px] mt-4 opacity-40 text-center">
          Conteúdo educacional · não constitui recomendação.
        </p>
      </div>
    </div>
  );
}

/* ───────────── Página comparativa ───────────── */
export default function RedesignPreview() {
  const [active, setActive] = useState<"A" | "B" | "C" | "all">("all");

  const cards = [
    { id: "A" as const, title: "Editorial Silencioso", subtitle: "Whitespace generoso, tipografia gigante, vibe revista financeira premium.", Comp: DirectionEditorial },
    { id: "B" as const, title: "Densidade Bloomberg", subtitle: "Informação por dobra, grid de métricas, ritmo monitor profissional.", Comp: DirectionDensity },
    { id: "C" as const, title: "Hero Hipnótico", subtitle: "Health Score domina a dobra, resto compacto e respira em cards.", Comp: DirectionHero },
  ];

  const visible = active === "all" ? cards : cards.filter((c) => c.id === active);

  return (
    <div className="min-h-dvh" style={{ background: "#050d1a", color: FG, ...body }}>
      <header className="sticky top-0 z-10 backdrop-blur"
        style={{ background: "rgba(5,13,26,0.85)", borderBottom: `1px solid ${GOLD_LIGHT}15` }}>
        <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] uppercase tracking-[0.3em]" style={{ color: GOLD }}>
              Redesign · Dashboard CORE HUB
            </div>
            <h1 style={{ ...display, fontSize: 22, fontWeight: 600, letterSpacing: "-0.02em" }}>
              3 direções · Space Grotesk + DM Sans · Magazine
            </h1>
          </div>
          <div className="flex gap-1 text-xs" style={display}>
            {(["all", "A", "B", "C"] as const).map((k) => (
              <button key={k} onClick={() => setActive(k)} className="px-3 py-1.5 rounded transition-colors"
                style={{
                  background: active === k ? GOLD : "transparent",
                  color: active === k ? NAVY : FG,
                  border: `1px solid ${active === k ? GOLD : `${GOLD_LIGHT}25`}`,
                  fontWeight: active === k ? 600 : 400,
                }}>
                {k === "all" ? "Ver todas" : `Direção ${k}`}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <div className={`grid gap-6 ${active === "all" ? "md:grid-cols-3" : "md:grid-cols-1 max-w-md mx-auto"}`}>
          {visible.map(({ id, title, subtitle, Comp }) => (
            <article key={id}>
              <div className="mb-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-[10px] uppercase tracking-[0.25em]" style={{ color: GOLD }}>
                    Direção {id}
                  </span>
                </div>
                <h2 style={{ ...display, fontSize: 18, fontWeight: 600, marginTop: 4 }}>{title}</h2>
                <p className="text-xs opacity-60 mt-1 leading-relaxed">{subtitle}</p>
              </div>
              <div className="rounded-2xl overflow-hidden shadow-2xl"
                style={{ border: `1px solid ${GOLD_LIGHT}20` }}>
                <div className="flex items-center gap-1.5 px-3 py-2"
                  style={{ background: GRAPHITE, borderBottom: `1px solid ${GOLD_LIGHT}10` }}>
                  <span className="w-2 h-2 rounded-full bg-red-400/60" />
                  <span className="w-2 h-2 rounded-full bg-yellow-400/60" />
                  <span className="w-2 h-2 rounded-full bg-green-400/60" />
                  <span className="ml-2 text-[10px] opacity-40">390 × mobile</span>
                </div>
                <div className="mx-auto" style={{ width: "100%", maxWidth: 390 }}>
                  <Comp />
                </div>
              </div>
            </article>
          ))}
        </div>

        <footer className="mt-10 pt-6 text-center opacity-60 text-xs"
          style={{ borderTop: `1px solid ${GOLD_LIGHT}15` }}>
          Escolha uma direção e me diga "Implementar Direção A/B/C" — replico no Dashboard real.
        </footer>
      </main>
    </div>
  );
}

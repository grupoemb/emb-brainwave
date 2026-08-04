import { Flame, TrendingUp } from "lucide-react";

/**
 * Malha decorativa de mini-cards do produto atrás do formulário de acesso.
 * Conteúdo ilustrativo — nenhuma consulta ao banco nesta tela pública.
 */

function Spark({ pontos, cor }: { pontos: number[]; cor: string }) {
  const max = Math.max(...pontos);
  const min = Math.min(...pontos);
  const faixa = max - min || 1;
  const d = pontos
    .map((p, i) => {
      const x = (i / (pontos.length - 1)) * 100;
      const y = 30 - ((p - min) / faixa) * 26;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="h-8 w-full">
      <path d={d} fill="none" stroke={cor} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function MiniKpi() {
  return (
    <div className="cartao w-[13rem] p-3">
      <span className="rotulo">Alcance · 30 dias</span>
      <div className="mt-1 flex items-end gap-2">
        <span className="numero text-2xl text-txt">184.320</span>
        <span className="pill pill-bom mb-1">+27%</span>
      </div>
      <Spark pontos={[8, 12, 9, 16, 14, 22, 19, 28, 31]} cor="#00e7ff" />
    </div>
  );
}

function MiniDonut() {
  const fatias = [
    { v: 52, cor: "#00a4ff" },
    { v: 28, cor: "#00e7ff" },
    { v: 20, cor: "#0068c9" },
  ];
  let acumulado = 0;
  const raio = 26;
  const circ = 2 * Math.PI * raio;
  return (
    <div className="cartao flex w-[12rem] items-center gap-3 p-3">
      <svg viewBox="0 0 64 64" className="h-16 w-16 -rotate-90">
        {fatias.map((f) => {
          const dash = (f.v / 100) * circ;
          const el = (
            <circle
              key={f.cor}
              cx="32"
              cy="32"
              r={raio}
              fill="none"
              stroke={f.cor}
              strokeWidth="7"
              strokeDasharray={`${dash} ${circ - dash}`}
              strokeDashoffset={-((acumulado / 100) * circ)}
            />
          );
          acumulado += f.v;
          return el;
        })}
      </svg>
      <div className="text-[.68rem] leading-relaxed text-muted">
        <div className="text-corpo">Formatos</div>
        <div>Reels 52%</div>
        <div>Carrossel 28%</div>
        <div>Estático 20%</div>
      </div>
    </div>
  );
}

function MiniKanban() {
  return (
    <div className="cartao w-[12.5rem] p-3">
      <span className="rotulo">Kanban · hoje</span>
      <div className="mt-2 space-y-1.5">
        {[
          { t: "Bastidores do estúdio", c: "#00a4ff" },
          { t: "3 erros de tráfego", c: "#00e7ff" },
          { t: "Case cliente · reels", c: "#3ecf8e" },
        ].map((i) => (
          <div
            key={i.t}
            className="flex items-center gap-2 rounded-[.5rem] border border-line bg-bg2 px-2 py-1.5"
          >
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: i.c }} />
            <span className="truncate text-[.7rem] text-corpo">{i.t}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniOutlier() {
  return (
    <div className="cartao flex w-[12rem] items-center gap-2 p-3">
      <Flame size={16} className="shrink-0 text-alerta" />
      <div className="min-w-0">
        <span className="block truncate text-[.72rem] text-corpo">Fora da curva</span>
        <span className="numero text-sm text-bom">3,4× a mediana</span>
      </div>
    </div>
  );
}

function MiniRitmo() {
  return (
    <div className="cartao w-[11.5rem] p-3">
      <span className="rotulo">Ritmo semanal</span>
      <div className="mt-2 flex items-end gap-1">
        {[40, 62, 35, 80, 55, 92, 70].map((h, i) => (
          <span
            key={i}
            className="flex-1 rounded-t-[3px] bg-gradient-to-t from-royal to-cyan"
            style={{ height: `${h * 0.34}px` }}
          />
        ))}
      </div>
      <div className="mt-1.5 flex items-center gap-1 text-[.66rem] text-muted">
        <TrendingUp size={11} className="text-bom" /> 6 posts/semana
      </div>
    </div>
  );
}

const PECAS: { el: React.ReactNode; classe: string; blur: string; opac: string; atraso: string }[] =
  [
    {
      el: <MiniKpi />,
      classe: "left-[3%] top-[14%]",
      blur: "blur-[2px]",
      opac: "opacity-65",
      atraso: "0s",
    },
    {
      el: <MiniKanban />,
      classe: "left-[7%] bottom-[12%]",
      blur: "blur-[6px]",
      opac: "opacity-40",
      atraso: "-3s",
    },
    {
      el: <MiniOutlier />,
      classe: "left-[16%] top-[52%]",
      blur: "blur-[12px]",
      opac: "opacity-28",
      atraso: "-6s",
    },
    {
      el: <MiniDonut />,
      classe: "right-[4%] top-[18%]",
      blur: "blur-[2px]",
      opac: "opacity-65",
      atraso: "-1.5s",
    },
    {
      el: <MiniRitmo />,
      classe: "right-[9%] bottom-[15%]",
      blur: "blur-[6px]",
      opac: "opacity-40",
      atraso: "-4.5s",
    },
    {
      el: <MiniOutlier />,
      classe: "right-[18%] top-[54%]",
      blur: "blur-[12px]",
      opac: "opacity-28",
      atraso: "-7.5s",
    },
  ];

export function VitrineFundo() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* halo de luz */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div
          className="acesso-halo h-[70vh] w-[70vw] rounded-full opacity-60 blur-[110px]"
          style={{
            background:
              "radial-gradient(circle at 30% 35%, rgba(0,164,255,.55), transparent 60%), radial-gradient(circle at 70% 65%, rgba(0,231,255,.35), transparent 62%)",
          }}
        />
      </div>

      {/* grade sutil */}
      <div
        className="absolute inset-0 opacity-[.05]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,.6) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      {/* mini-cards do produto */}
      <div className="hidden lg:block">
        {PECAS.map((p, i) => (
          <div
            key={i}
            className={`acesso-fade absolute ${p.classe}`}
            style={{ animationDelay: `${0.2 + i * 0.09}s` }}
          >
            <div
              className={`acesso-flutua ${p.blur} ${p.opac}`}
              style={{ animationDelay: p.atraso }}
            >
              {p.el}
            </div>
          </div>
        ))}
      </div>

      {/* faixas suaves no mobile */}
      <div className="lg:hidden">
        <div className="acesso-fade absolute -left-6 top-[6%] opacity-25 blur-[5px]">
          <MiniKpi />
        </div>
        <div className="acesso-fade absolute -right-8 bottom-[7%] opacity-28 blur-[7px]">
          <MiniRitmo />
        </div>
      </div>

      {/* vinheta */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_42%,var(--bg)_95%)]" />
    </div>
  );
}

import { BarChart3, Clock, Layers, Target, Users } from "lucide-react";
import type { ComponentType } from "react";

export type Aba = "geral" | "conteudo" | "ritmo" | "contas" | "benchmark";

export const ABAS: {
  valor: Aba;
  rotulo: string;
  contexto: string;
  icone: ComponentType<{ size?: number }>;
}[] = [
  {
    valor: "geral",
    rotulo: "Visão geral",
    contexto: "Resultado do período: alcance, interação e eficiência em um só lugar.",
    icone: BarChart3,
  },
  {
    valor: "conteudo",
    rotulo: "Conteúdo",
    contexto: "Formatos, pilares, ganchos e a lista completa de posts do período.",
    icone: Layers,
  },
  {
    valor: "ritmo",
    rotulo: "Ritmo & horários",
    contexto: "Quando você publica, quando a audiência responde e como o alcance amadurece.",
    icone: Clock,
  },
  {
    valor: "contas",
    rotulo: "Contas",
    contexto: "Comparação conta a conta: volume, alcance e performance relativa.",
    icone: Users,
  },
  {
    valor: "benchmark",
    rotulo: "Benchmark",
    contexto: "Onde você está frente às faixas de mercado e quais metas vêm em seguida.",
    icone: Target,
  },
];

export const ABA_POR_VALOR = new Map(ABAS.map((a) => [a.valor, a]));

export function ehAba(v: unknown): v is Aba {
  return typeof v === "string" && ABA_POR_VALOR.has(v as Aba);
}

export function SubAbas({
  aba,
  setAba,
  contadores,
}: {
  aba: Aba;
  setAba: (a: Aba) => void;
  contadores?: Partial<Record<Aba, number>>;
}) {
  return (
    <div
      role="tablist"
      aria-label="Seções de métricas"
      className="flex max-w-full snap-x snap-mandatory items-center gap-1 overflow-x-auto rounded-[.7rem] border border-line bg-bg2/70 p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {ABAS.map((a) => {
        const ativo = aba === a.valor;
        const Icone = a.icone;
        const n = contadores?.[a.valor];
        return (
          <button
            key={a.valor}
            role="tab"
            type="button"
            aria-selected={ativo}
            title={a.contexto}
            onClick={() => setAba(a.valor)}
            className={
              "flex h-9 shrink-0 snap-start items-center gap-2 rounded-[.55rem] px-3 text-xs transition-colors " +
              (ativo
                ? "bg-azure/16 font-semibold text-txt shadow-[inset_0_0_0_1px_rgba(0,164,255,.35)]"
                : "text-muted hover:bg-white/5 hover:text-corpo")
            }
          >
            <Icone size={14} />
            <span className="whitespace-nowrap">{a.rotulo}</span>
            {typeof n === "number" ? (
              <span
                className={
                  "numero rounded-full px-1.5 py-px text-[.62rem] " +
                  (ativo ? "bg-azure/22 text-azureClaro" : "bg-white/6 text-muted")
                }
              >
                {n}
              </span>
            ) : null}
          </button>
        );
      })}
    </div>
  );
}

import { BarChart3, Clock, Layers, Target, Users } from "lucide-react";
import type { ComponentType } from "react";

export type Aba = "geral" | "conteudo" | "ritmo" | "contas" | "benchmark";

export const ABAS: { valor: Aba; rotulo: string; icone: ComponentType<{ size?: number }> }[] = [
  { valor: "geral", rotulo: "Visão geral", icone: BarChart3 },
  { valor: "conteudo", rotulo: "Conteúdo", icone: Layers },
  { valor: "ritmo", rotulo: "Ritmo & horários", icone: Clock },
  { valor: "contas", rotulo: "Contas", icone: Users },
  { valor: "benchmark", rotulo: "Benchmark", icone: Target },
];

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
      className="flex flex-wrap items-center gap-1 rounded-[.7rem] border border-line bg-bg2/70 p-1"
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
            onClick={() => setAba(a.valor)}
            className={
              "flex h-9 shrink-0 items-center gap-2 rounded-[.55rem] px-3 text-xs transition-colors " +
              (ativo
                ? "bg-azure/16 font-semibold text-txt shadow-[inset_0_0_0_1px_rgba(0,164,255,.35)]"
                : "text-muted hover:bg-white/5 hover:text-corpo")
            }
          >
            <Icone size={14} />
            <span>{a.rotulo}</span>
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

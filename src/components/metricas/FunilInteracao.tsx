import { ChevronDown } from "lucide-react";

import { numero } from "@/lib/metricas";

const CORES = ["#00a4ff", "#00e7ff", "#3ecf8e"];

/** Funil em blocos de largura proporcional, com conversão entre etapas. */
export function FunilInteracao({
  etapas,
}: {
  etapas: { rotulo: string; valor: number | null; pct: number }[];
}) {
  const base = etapas[0]?.valor ?? null;

  return (
    <div className="cartao p-4">
      <span className="rotulo">Funil de interação</span>
      <p className="mt-1 text-xs text-muted">
        Do alcance até quem salva ou compartilha — a propagação real do conteúdo.
      </p>

      <div className="mt-4 space-y-1">
        {etapas.map((e, i) => {
          const largura =
            base && base > 0 && e.valor !== null
              ? Math.max(14, Math.min(100, (e.valor / base) * 100 + (i === 0 ? 0 : 12)))
              : 14;
          const cor = CORES[i] ?? "#00a4ff";
          const anterior = etapas[i - 1];
          const conversao =
            anterior && anterior.valor && e.valor !== null
              ? (e.valor / anterior.valor) * 100
              : null;

          return (
            <div key={e.rotulo}>
              {i > 0 ? (
                <div className="flex items-center justify-center gap-1 py-1 text-[.65rem] text-muted">
                  <ChevronDown size={11} aria-hidden />
                  {conversao === null
                    ? "—"
                    : `${conversao.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}% avança`}
                </div>
              ) : null}

              <div
                className="mx-auto flex items-center justify-between gap-3 rounded-[.6rem] px-3 py-2.5 transition-[width] duration-700 ease-out"
                style={{
                  width: `${largura}%`,
                  background: `linear-gradient(90deg, ${cor}2e, ${cor}12)`,
                  border: `1px solid ${cor}55`,
                }}
              >
                <span className="truncate text-xs text-corpo">{e.rotulo}</span>
                <span className="numero shrink-0 text-sm text-txt">
                  {numero(e.valor)}
                  <span className="ml-1.5 text-[.68rem] font-normal text-muted">
                    {e.pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                  </span>
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

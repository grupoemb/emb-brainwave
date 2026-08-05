import type React from "react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { numero, type ItemDimensao } from "@/lib/metricas";

export function ComparativoContas({
  contas,
  aoSelecionar,
}: {
  contas: ItemDimensao[];
  aoSelecionar?: (conta: ItemDimensao) => void;
}) {
  const maxAlcance = contas.reduce((m, c) => Math.max(m, c.alcance), 0) || 1;

  return (
    <div className="cartao p-4">
      <span className="rotulo">Comparativo de contas</span>
      <p className="mt-1 text-xs text-muted">
        Desempenho lado a lado das contas com posts no período.
      </p>

      {contas.length === 0 ? (
        <div className="mt-3">
          <EstadoVazio compacto titulo="Nenhuma conta identificada nos posts do período." />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {contas.map((c) => (
            <div
              key={c.chave}
              {...(aoSelecionar
                ? {
                    role: "button" as const,
                    tabIndex: 0,
                    title: `Ver os ${c.n} posts de ${c.rotulo}`,
                    onClick: () => aoSelecionar(c),
                    onKeyDown: (e: React.KeyboardEvent) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        aoSelecionar(c);
                      }
                    },
                    className:
                      "cursor-pointer rounded-[.6rem] px-1.5 py-1 transition-colors hover:bg-white/6",
                  }
                : {})}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <span className="text-sm text-txt">{c.rotulo}</span>
                <span className="flex items-center gap-3 text-xs text-muted">
                  <span>
                    {c.n} {c.n === 1 ? "post" : "posts"}
                  </span>
                  <span className="numero text-corpo">{numero(c.alcance)} alcance</span>
                  <span className="numero text-corpo">
                    {numero(c.engajamento, 2)}% eng.
                  </span>
                  <span className="numero pill text-corpo">
                    {c.rxMedio === null ? "—" : `${numero(c.rxMedio, 2)}×`}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                  style={{ width: `${Math.max(2, (c.alcance / maxAlcance) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

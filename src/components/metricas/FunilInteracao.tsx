import { numero } from "@/lib/metricas";

const CORES = ["#00a4ff", "#00e7ff", "#3ecf8e"];

export function FunilInteracao({
  etapas,
}: {
  etapas: { rotulo: string; valor: number | null; pct: number }[];
}) {
  return (
    <div className="cartao p-4">
      <span className="rotulo">Funil de interação</span>
      <p className="mt-1 text-xs text-muted">
        Do alcance até quem salva ou compartilha — a propagação real do conteúdo.
      </p>

      <div className="mt-4 space-y-3">
        {etapas.map((e, i) => (
          <div key={e.rotulo}>
            <div className="flex items-baseline justify-between gap-2 text-xs">
              <span className="text-corpo">{e.rotulo}</span>
              <span className="numero text-txt">
                {numero(e.valor)}
                <span className="ml-1.5 text-muted">
                  {e.pct.toLocaleString("pt-BR", { maximumFractionDigits: 2 })}%
                </span>
              </span>
            </div>
            <div className="mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${Math.max(1.5, Math.min(100, e.pct))}%`,
                  background: CORES[i] ?? "#00a4ff",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

import { compacto, numero } from "@/lib/metricas";

export type FatiaComposicao = { rotulo: string; valor: number; cor: string };

/** Barra empilhada horizontal com legenda percentual. */
export function BarraComposicao({
  titulo,
  descricao,
  fatias,
  vazio = "Sem interações registradas no período.",
}: {
  titulo: string;
  descricao?: string;
  fatias: FatiaComposicao[];
  vazio?: string;
}) {
  const total = fatias.reduce((s, f) => s + (f.valor || 0), 0);

  return (
    <div className="cartao p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="rotulo">{titulo}</span>
        <span className="numero text-sm text-txt">{compacto(total)}</span>
      </div>
      {descricao ? <p className="mt-1 text-xs text-muted">{descricao}</p> : null}

      {total <= 0 ? (
        <p className="py-6 text-center text-sm text-muted">{vazio}</p>
      ) : (
        <>
          <div className="mt-4 flex h-3.5 w-full overflow-hidden rounded-full bg-white/6">
            {fatias.map((f) => {
              const pct = (f.valor / total) * 100;
              if (pct <= 0) return null;
              return (
                <div
                  key={f.rotulo}
                  title={`${f.rotulo}: ${numero(f.valor)} (${pct.toFixed(1)}%)`}
                  style={{ width: `${pct}%`, background: f.cor }}
                  className="h-full transition-[width] duration-700 ease-out"
                />
              );
            })}
          </div>

          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 sm:grid-cols-4">
            {fatias.map((f) => (
              <li key={f.rotulo} className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span
                    className="h-2 w-2 shrink-0 rounded-full"
                    style={{ background: f.cor }}
                    aria-hidden
                  />
                  <span className="truncate text-[.7rem] text-muted">{f.rotulo}</span>
                </div>
                <p className="numero mt-0.5 text-sm text-txt">
                  {total > 0 ? ((f.valor / total) * 100).toFixed(1) : "0"}
                  <span className="text-corpo">%</span>
                  <span className="ml-1.5 text-[.7rem] font-normal text-muted">
                    {compacto(f.valor)}
                  </span>
                </p>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

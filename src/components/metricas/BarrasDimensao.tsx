import { numero, type ItemDimensao } from "@/lib/metricas";

function corRx(rx: number | null) {
  if (rx === null) return "var(--muted)";
  if (rx >= 1.3) return "var(--bom)";
  if (rx < 0.7) return "var(--ruim)";
  return "var(--alerta)";
}

function classe(rx: number | null) {
  if (rx === null) return "text-muted";
  if (rx >= 1.3) return "pill pill-bom";
  if (rx < 0.7) return "pill pill-ruim";
  return "pill pill-alerta";
}

export function BarrasDimensao({
  titulo,
  descricao,
  itens,
  vazio = "Sem dados classificados no período.",
  limite = 6,
  aoSelecionar,
}: {
  titulo: string;
  descricao?: string;
  itens: ItemDimensao[];
  vazio?: string;
  limite?: number;
  aoSelecionar?: (item: ItemDimensao) => void;
}) {
  const lista = itens.slice(0, limite);
  const max = Math.max(1.35, lista.reduce((m, i) => Math.max(m, i.rxMedio ?? 0), 0));
  const marca = (1 / max) * 100; // posição da linha de referência 1,00×

  return (
    <div className="cartao p-4">
      <span className="rotulo">{titulo}</span>
      {descricao ? <p className="mt-1 text-xs text-muted">{descricao}</p> : null}

      {lista.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{vazio}</p>
      ) : (
        <>
          <ul className="mt-3 space-y-2.5">
            {lista.map((i) => {
              const cor = corRx(i.rxMedio);
              const conteudo = (
                <>
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate font-medium text-corpo">{i.rotulo}</span>
                    <span className="flex shrink-0 items-center gap-2">
                      <span className="text-[.68rem] text-muted">
                        {i.n} {i.n === 1 ? "post" : "posts"} · {numero(i.alcanceMedio)} alc.
                      </span>
                      <span className={"numero text-[.7rem] " + classe(i.rxMedio)}>
                        {i.rxMedio === null ? "—" : `${numero(i.rxMedio, 2)}×`}
                      </span>
                    </span>
                  </div>
                  <div className="relative mt-1.5 h-2.5 w-full overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full transition-[width] duration-700 ease-out"
                      style={{
                        width: `${Math.max(2, ((i.rxMedio ?? 0) / max) * 100)}%`,
                        background: `linear-gradient(90deg, color-mix(in oklab, ${cor} 45%, transparent), ${cor})`,
                      }}
                    />
                    <span
                      aria-hidden
                      className="absolute inset-y-0 w-px bg-white/35"
                      style={{ left: `${marca}%` }}
                    />
                  </div>
                </>
              );

              return (
                <li key={i.chave}>
                  {aoSelecionar ? (
                    <button
                      type="button"
                      onClick={() => aoSelecionar(i)}
                      title={`Ver os ${i.n} posts de ${i.rotulo}`}
                      className="w-full rounded-[.55rem] px-1.5 py-1 text-left transition-colors hover:bg-white/6"
                    >
                      {conteudo}
                    </button>
                  ) : (
                    <div className="px-1.5 py-1">{conteudo}</div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-[.65rem] text-muted">
            A linha vertical marca 1,00× — a mediana do formato.
          </p>
        </>

      )}
    </div>
  );
}

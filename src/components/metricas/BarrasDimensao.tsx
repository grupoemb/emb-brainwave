import { numero, type ItemDimensao } from "@/lib/metricas";

function classe(rx: number | null) {
  if (rx === null) return "text-muted";
  if (rx >= 1.3) return "pill pill-bom";
  if (rx < 0.7) return "pill pill-ruim";
  return "pill text-corpo";
}

export function BarrasDimensao({
  titulo,
  descricao,
  itens,
  vazio = "Sem dados classificados no período.",
  limite = 6,
}: {
  titulo: string;
  descricao?: string;
  itens: ItemDimensao[];
  vazio?: string;
  limite?: number;
}) {
  const lista = itens.slice(0, limite);
  const max = lista.reduce((m, i) => Math.max(m, i.rxMedio ?? 0), 0) || 1;

  return (
    <div className="cartao p-4">
      <span className="rotulo">{titulo}</span>
      {descricao ? <p className="mt-1 text-xs text-muted">{descricao}</p> : null}

      {lista.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">{vazio}</p>
      ) : (
        <ul className="mt-3 space-y-2.5">
          {lista.map((i) => (
            <li key={i.chave}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="truncate text-corpo">{i.rotulo}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="text-muted">
                    {i.n} {i.n === 1 ? "post" : "posts"} · {numero(i.alcanceMedio)} alc. médio
                  </span>
                  <span className={"numero " + classe(i.rxMedio)}>
                    {i.rxMedio === null ? "—" : `${numero(i.rxMedio, 2)}×`}
                  </span>
                </span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-white/6">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                  style={{ width: `${Math.max(2, ((i.rxMedio ?? 0) / max) * 100)}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

import { classeVariacao, numero, textoVariacao, variacao, type Taxas } from "@/lib/metricas";

type Campo = keyof Taxas;

const ITENS: { campo: Campo; rotulo: string; casas: number; sufixo?: string; dica: string }[] = [
  {
    campo: "taxaSalvamento",
    rotulo: "Taxa de salvamento",
    casas: 2,
    sufixo: "%",
    dica: "Salvamentos ÷ alcance. É o sinal mais forte de conteúdo útil.",
  },
  {
    campo: "taxaCompartilhamento",
    rotulo: "Taxa de compartilhamento",
    casas: 2,
    sufixo: "%",
    dica: "Compartilhamentos ÷ alcance. Mede o potencial de alcance novo.",
  },
  {
    campo: "taxaComentario",
    rotulo: "Taxa de comentário",
    casas: 2,
    sufixo: "%",
    dica: "Comentários ÷ alcance.",
  },
  {
    campo: "taxaCurtida",
    rotulo: "Taxa de curtida",
    casas: 2,
    sufixo: "%",
    dica: "Curtidas ÷ alcance.",
  },
  {
    campo: "interacoesPorPost",
    rotulo: "Interações por post",
    casas: 0,
    dica: "Total de interações ÷ número de posts do período.",
  },
  {
    campo: "impressoesMedia",
    rotulo: "Impressões por post",
    casas: 0,
    dica: "Impressões totais ÷ número de posts do período.",
  },
  {
    campo: "taxaAcerto",
    rotulo: "Taxa de acerto",
    casas: 0,
    sufixo: "%",
    dica: "Percentual de posts com rx ≥ 1,00× (acima da mediana do formato).",
  },
  {
    campo: "consistencia",
    rotulo: "Oscilação do rx",
    casas: 2,
    sufixo: "×",
    dica: "Desvio padrão do rx: quanto menor, mais previsível é o resultado.",
  },
];

export function GradeTaxas({
  taxas,
  anterior,
  rotuloComparacao,
}: {
  taxas: Taxas;
  anterior: Taxas | null;
  rotuloComparacao?: string | undefined;
}) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
      {ITENS.map((i) => {
        const v = taxas[i.campo] as number | null;
        const va = anterior ? ((anterior[i.campo] as number | null) ?? null) : null;
        const delta = anterior ? variacao(v, va) : null;
        return (
          <div
            key={i.campo}
            className="cartao group relative flex min-h-[5.4rem] flex-col justify-between p-3.5"
          >
            <span className="rotulo">{i.rotulo}</span>
            <p className="numero text-xl text-txt">
              {v === null ? <span className="text-muted">—</span> : numero(v, i.casas)}
              {v !== null && i.sufixo ? <span className="text-corpo">{i.sufixo}</span> : null}
            </p>
            {anterior ? (
              <p className="mt-1 flex items-center gap-1.5 text-[.7rem]">
                <span className={"pill " + classeVariacao(delta)}>{textoVariacao(delta)}</span>
                <span className="text-muted">antes {numero(va, i.casas)}</span>
              </p>
            ) : null}

            <span
              role="tooltip"
              className="pointer-events-none absolute inset-x-2 bottom-2 z-10 rounded-[.5rem] border border-line-forte bg-card2 px-2.5 py-1.5 text-[.7rem] leading-snug text-corpo opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
            >
              {i.dica}
              {rotuloComparacao ? ` Comparado com ${rotuloComparacao}.` : ""}
            </span>
          </div>
        );
      })}
    </div>
  );
}

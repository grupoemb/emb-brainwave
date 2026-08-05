import { classeVariacao, numero, textoVariacao, variacao, type Taxas } from "@/lib/metricas";
import { faixaDe, type Faixas } from "@/components/metricas/Medidor";

type Campo = keyof Taxas;

const COR = {
  bom: "var(--bom)",
  alerta: "var(--alerta)",
  ruim: "var(--ruim)",
} as const;

const ITENS: {
  campo: Campo;
  rotulo: string;
  casas: number;
  sufixo?: string;
  dica: string;
  faixas?: Faixas;
}[] = [
  {
    campo: "taxaSalvamento",
    rotulo: "Taxa de salvamento",
    casas: 2,
    sufixo: "%",
    dica: "Salvamentos ÷ alcance. É o sinal mais forte de conteúdo útil.",
    faixas: { alerta: 0.4, bom: 0.8, max: 2 },
  },
  {
    campo: "taxaCompartilhamento",
    rotulo: "Taxa de compartilhamento",
    casas: 2,
    sufixo: "%",
    dica: "Compartilhamentos ÷ alcance. Mede o potencial de alcance novo.",
    faixas: { alerta: 0.4, bom: 0.9, max: 2 },
  },
  {
    campo: "taxaComentario",
    rotulo: "Taxa de comentário",
    casas: 2,
    sufixo: "%",
    dica: "Comentários ÷ alcance.",
    faixas: { alerta: 0.1, bom: 0.25, max: 1 },
  },
  {
    campo: "taxaCurtida",
    rotulo: "Taxa de curtida",
    casas: 2,
    sufixo: "%",
    dica: "Curtidas ÷ alcance.",
    faixas: { alerta: 1, bom: 2.5, max: 6 },
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
    faixas: { alerta: 40, bom: 60, max: 100 },
  },
  {
    campo: "consistencia",
    rotulo: "Oscilação do rx",
    casas: 2,
    sufixo: "×",
    dica: "Desvio padrão do rx: quanto menor, mais previsível é o resultado.",
    faixas: { alerta: 1.2, bom: 0.6, max: 2.5, invertido: true },
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
        const faixa = i.faixas ? faixaDe(v, i.faixas) : null;
        const cor = faixa ? COR[faixa] : "var(--line-forte)";
        const pct =
          i.faixas && v !== null ? Math.max(3, Math.min(100, (v / i.faixas.max) * 100)) : null;

        return (
          <div
            key={i.campo}
            className="cartao-plano group relative flex min-h-[5.6rem] flex-col justify-between overflow-hidden p-3.5 pl-4"
          >
            <span
              aria-hidden
              className="absolute inset-y-0 left-0 w-[3px]"
              style={{ background: cor }}
            />
            <span className="rotulo">{i.rotulo}</span>
            <p className="numero text-xl" style={{ color: faixa ? cor : "var(--txt)" }}>
              {v === null ? <span className="text-muted">—</span> : numero(v, i.casas)}
              {v !== null && i.sufixo ? <span className="text-corpo">{i.sufixo}</span> : null}
            </p>

            {pct !== null ? (
              <div className="mt-1.5 barra-trilho">
                <div
                  className="h-full rounded-full transition-[width] duration-700 ease-out"
                  style={{ width: `${pct}%`, background: cor }}
                />
              </div>
            ) : null}

            {anterior ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-[.7rem]">
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

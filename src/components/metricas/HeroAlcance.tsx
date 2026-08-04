import { Sparkline } from "@/components/metricas/Sparkline";
import {
  classeVariacao,
  numero,
  textoVariacao,
  variacao,
  type Taxas,
} from "@/lib/metricas";

function Mini({
  rotulo,
  valor,
  sufixo,
  casas = 0,
  dica,
}: {
  rotulo: string;
  valor: number | null;
  sufixo?: string;
  casas?: number;
  dica: string;
}) {
  return (
    <div className="min-w-0" title={dica}>
      <p className="rotulo">{rotulo}</p>
      <p className="numero mt-1 text-lg text-txt">
        {valor === null ? <span className="text-muted">—</span> : numero(valor, casas)}
        {valor !== null && sufixo ? <span className="text-corpo">{sufixo}</span> : null}
      </p>
    </div>
  );
}

export function HeroAlcance({
  taxas,
  taxasAnterior,
  serie,
  intervalo,
  rotuloComparacao,
  publicados,
}: {
  taxas: Taxas;
  taxasAnterior: Taxas | null;
  serie: { valor: number }[];
  intervalo: string;
  rotuloComparacao?: string | undefined;
  publicados: number;
}) {
  const delta = variacao(taxas.alcance, taxasAnterior?.alcance ?? null);

  return (
    <div className="cartao overflow-hidden p-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="min-w-0">
          <p className="rotulo">Alcance no período · {intervalo}</p>
          <p className="numero grad mt-1 text-4xl leading-none sm:text-5xl">
            {taxas.alcance === null ? "—" : numero(taxas.alcance)}
          </p>
          <p className="mt-2 flex flex-wrap items-center gap-2 text-xs">
            {taxasAnterior ? (
              <>
                <span className={"pill " + classeVariacao(delta)}>{textoVariacao(delta)}</span>
                <span className="text-muted">
                  vs {rotuloComparacao ?? "período anterior"} ({numero(taxasAnterior.alcance)})
                </span>
              </>
            ) : (
              <span className="text-muted">ative a comparação para ver a variação</span>
            )}
            <span className="text-muted">
              · {publicados} {publicados === 1 ? "post" : "posts"} publicados
            </span>
          </p>
        </div>

        <div className="grid min-w-[240px] flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
          <Mini
            rotulo="Impressões"
            valor={taxas.impressoes}
            dica="Soma das impressões da leitura mais recente de cada post."
          />
          <Mini
            rotulo="Frequência"
            valor={taxas.frequencia}
            casas={2}
            sufixo="×"
            dica="Impressões ÷ alcance: quantas vezes, em média, cada pessoa viu."
          />
          <Mini
            rotulo="Engajamento"
            valor={taxas.engajamento}
            casas={1}
            sufixo="%"
            dica="(curtidas + comentários + salvos + compartilhamentos) ÷ alcance."
          />
          <Mini
            rotulo="Alcance médio"
            valor={taxas.alcanceMedio}
            dica="Alcance total ÷ número de posts do período."
          />
        </div>
      </div>

      <div className="mt-4 -mx-1">
        <Sparkline dados={serie} altura={54} />
      </div>
    </div>
  );
}

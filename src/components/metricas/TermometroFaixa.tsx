import { CLASSE_FAIXA, COR_FAIXA, ROTULO_FAIXA, classificar, posicao, type Faixa } from "@/lib/benchmark";
import { numero } from "@/lib/metricas";

export function TermometroFaixa({
  rotulo,
  descricao,
  valor,
  faixa,
  casas = 0,
  sufixo = "",
}: {
  rotulo: string;
  descricao: string;
  valor: number | null;
  faixa: Faixa | null;
  casas?: number;
  sufixo?: string;
}) {
  const nome = classificar(valor, faixa);
  const pos = posicao(valor, faixa);

  return (
    <div className="cartao p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0">
          <span className="rotulo block truncate">{rotulo}</span>
          <span className="mt-1 block text-xs text-muted">{descricao}</span>
        </span>
        <span className="numero shrink-0 text-lg text-txt">
          {numero(valor, casas)}
          {valor === null ? "" : sufixo}
        </span>
      </div>

      {faixa ? (
        <>
          <div className="relative mt-4 h-2.5 w-full overflow-hidden rounded-full">
            <div className="flex h-full w-full">
              <span className="h-full w-1/4" style={{ background: "rgba(255,122,107,.45)" }} />
              <span className="h-full w-1/4" style={{ background: "rgba(246,189,36,.45)" }} />
              <span className="h-full w-1/4" style={{ background: "rgba(0,164,255,.45)" }} />
              <span className="h-full w-1/4" style={{ background: "rgba(62,207,142,.45)" }} />
            </div>
            {pos !== null ? (
              <span
                aria-hidden
                className="absolute top-1/2 h-4 w-[3px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                style={{ left: `${pos}%`, background: nome ? COR_FAIXA[nome] : "#e9eef7" }}
              />
            ) : null}
          </div>

          <div className="mt-2 flex items-center justify-between gap-2 text-[.68rem] text-muted">
            <span className="numero">p25 {numero(faixa.p25, casas)}</span>
            <span className="numero">med {numero(faixa.mediana, casas)}</span>
            <span className="numero">p75 {numero(faixa.p75, casas)}</span>
          </div>

          <div className="mt-2.5">
            {nome ? (
              <span className={CLASSE_FAIXA[nome]}>{ROTULO_FAIXA[nome]}</span>
            ) : (
              <span className="text-xs text-muted">Sem leitura para este indicador.</span>
            )}
          </div>
        </>
      ) : (
        <p className="mt-4 text-xs text-muted">
          Sem referência interna para este formato ainda — publique mais posts para calibrar a
          faixa.
        </p>
      )}
    </div>
  );
}

import { numero } from "@/lib/metricas";

function Item({ rotulo, valor, dica }: { rotulo: string; valor: string; dica: string }) {
  return (
    <div title={dica}>
      <p className="rotulo">{rotulo}</p>
      <p className="numero mt-1 text-xl text-txt">{valor}</p>
    </div>
  );
}

export function RitmoPublicacao({
  cadencia,
  maturacao,
}: {
  cadencia: {
    posts: number;
    porSemana: number | null;
    intervaloMedio: number | null;
    diasComPost: number;
    diasSemPost: number;
    ultimoPost: number | null;
  };
  maturacao: {
    comHistorico: number;
    pctNaPrimeiraLeitura: number | null;
    crescimentoTotal: number | null;
  };
}) {
  const dias = (v: number | null) => (v === null ? "—" : `${numero(v, 1)}d`);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="cartao p-4">
        <span className="rotulo">Cadência</span>
        <p className="mt-1 text-xs text-muted">Com que ritmo a conta publicou no período.</p>
        <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
          <Item
            rotulo="Posts / semana"
            valor={cadencia.porSemana === null ? "—" : numero(cadencia.porSemana, 1)}
            dica="Posts do período projetados para uma semana."
          />
          <Item
            rotulo="Intervalo médio"
            valor={dias(cadencia.intervaloMedio)}
            dica="Tempo médio entre duas publicações consecutivas."
          />
          <Item
            rotulo="Dias com post"
            valor={String(cadencia.diasComPost)}
            dica="Dias distintos em que houve pelo menos uma publicação."
          />
          <Item
            rotulo="Dias sem post"
            valor={String(cadencia.diasSemPost)}
            dica="Dias do período sem nenhuma publicação."
          />
        </div>
      </div>

      <div className="cartao p-4">
        <span className="rotulo">Curva de maturação</span>
        <p className="mt-1 text-xs text-muted">
          Quanto do alcance já existia na primeira leitura de cada post, comparado com a última.
        </p>

        {maturacao.comHistorico === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Ainda não há leituras suficientes para medir o crescimento dos posts.
          </p>
        ) : (
          <>
            <div className="mt-4 flex items-baseline gap-3">
              <span className="numero text-3xl text-txt">
                {numero(maturacao.pctNaPrimeiraLeitura, 0)}
                <span className="text-corpo">%</span>
              </span>
              <span className="text-xs text-muted">
                do alcance final já na primeira leitura · {maturacao.comHistorico} posts com
                histórico
              </span>
            </div>

            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/6">
              <div
                className="h-full rounded-full bg-gradient-to-r from-royal to-cyan"
                style={{
                  width: `${Math.max(2, Math.min(100, maturacao.pctNaPrimeiraLeitura ?? 0))}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-muted">
              Crescimento acumulado entre a primeira e a última leitura:{" "}
              <span className="numero text-corpo">{numero(maturacao.crescimentoTotal)}</span> de
              alcance.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

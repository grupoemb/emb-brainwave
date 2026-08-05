import { EstadoVazio } from "@/components/ui/EstadoVazio";
import {
  CLASSE_PRIORIDADE,
  ROTULO_FAIXA,
  ROTULO_PRIORIDADE,
  type Recomendacao,
} from "@/lib/benchmark";
import { numero } from "@/lib/metricas";

export function Recomendacoes({ itens }: { itens: Recomendacao[] }) {
  return (
    <div className="cartao p-4">
      <span className="rotulo">O que fazer em seguida</span>
      <p className="mt-1 text-xs text-muted">
        Cada recomendação mostra quanto falta, em números, para o indicador subir de faixa. A
        prioridade combina o quão atrás está e o peso daquele sinal no resultado.
      </p>

      {itens.length === 0 ? (
        <div className="mt-4">
          <EstadoVazio
            titulo="Nenhum indicador abaixo do padrão neste recorte"
            descricao="Mantenha o ritmo e suba a régua nas metas."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {itens.map((r) => {
            const p = r.alvo > 0 ? Math.max(4, Math.min(100, (r.atual / r.alvo) * 100)) : 0;
            return (
              <div key={r.chave} className="rounded-[.7rem] border border-line p-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs text-corpo">{r.rotulo}</span>
                  <span className={CLASSE_PRIORIDADE[r.prioridade] + " shrink-0"}>
                    {ROTULO_PRIORIDADE[r.prioridade]}
                  </span>
                </div>

                <span className="mt-0.5 block text-[.68rem] text-muted">
                  Hoje: {ROTULO_FAIXA[r.faixaAtual]} → {ROTULO_FAIXA[r.proximaFaixa]}
                </span>

                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="numero text-lg text-txt">
                    {numero(r.atual, r.casas)}
                    {r.sufixo}
                  </span>
                  <span className="text-xs text-muted">→</span>
                  <span className="numero text-sm text-azureClaro">
                    {numero(r.alvo, r.casas)}
                    {r.sufixo}
                  </span>
                </div>

                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/6">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                    style={{ width: `${p}%` }}
                  />
                </div>

                <p className="mt-2 text-[.68rem] text-muted">
                  Faltam{" "}
                  <span className="numero text-corpo">
                    {numero(r.delta, r.casas)}
                    {r.sufixo}
                  </span>
                  {r.deltaPct === null ? "" : ` (+${numero(r.deltaPct, 0)}%)`} para sair da faixa
                  atual.
                </p>
                <p className="mt-1 text-[.68rem] text-muted">{r.acao}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import { useMemo } from "react";

import { MetasSugeridas } from "@/components/metricas/MetasSugeridas";
import { Recomendacoes } from "@/components/metricas/Recomendacoes";
import { TabelaMercado } from "@/components/metricas/TabelaMercado";
import { TermometroFaixa } from "@/components/metricas/TermometroFaixa";
import {
  CLASSE_FAIXA,
  MERCADO,
  ROTULO_FAIXA,
  comparativoMercado,
  faixaRx,
  faixaTaxa,
  metasSugeridas,
  recomendacoes,
  termometros,
} from "@/lib/benchmark";
import { numero, type Baseline, type ItemDimensao, type LinhaMetrica, type Taxas } from "@/lib/metricas";


function Pill({ nome }: { nome: ReturnType<typeof faixaRx> }) {
  if (!nome) return <span className="text-muted">—</span>;
  return <span className={CLASSE_FAIXA[nome]}>{ROTULO_FAIXA[nome]}</span>;
}

export function Benchmark({
  linhas,
  baselines,
  taxas,
  publicados,
  porSemana,
  porConta,
}: {
  linhas: LinhaMetrica[];
  baselines: Baseline[];
  taxas: Taxas;
  publicados: number;
  porSemana: number | null;
  porConta: ItemDimensao[];
}) {
  const termos = useMemo(() => termometros(linhas, baselines), [linhas, baselines]);
  const mercado = useMemo(() => comparativoMercado(taxas), [taxas]);
  const metas = useMemo(
    () => metasSugeridas({ linhas, taxas, baselines, publicados, porSemana }),
    [linhas, taxas, baselines, publicados, porSemana],
  );

  return (
    <div className="space-y-4">
      <div className="secao-entrada cartao p-4">
        <span className="rotulo">Como ler estas faixas</span>
        <p className="mt-1.5 text-xs text-muted">
          As faixas de <span className="text-corpo">abaixo do padrão · regular · bom · excelente</span>{" "}
          vêm dos percentis p25, mediana e p75 da sua própria base de posts, ponderados pelo mix de
          formatos do recorte. As taxas comparadas com o mercado usam uma referência pública
          consolidada — servem de norte, não de verdade absoluta.
        </p>
      </div>

      <div className="secao-entrada grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {termos.map((t) => (
          <TermometroFaixa
            key={t.chave}
            rotulo={t.rotulo}
            descricao={t.descricao}
            valor={t.valor}
            faixa={t.faixa}
            casas={t.casas}
          />
        ))}
      </div>

      <div className="secao-entrada">
        <TabelaMercado linhas={mercado} />
      </div>

      <div className="secao-entrada">
        <MetasSugeridas metas={metas} />
      </div>

      <div className="secao-entrada cartao p-4">
        <span className="rotulo">Faixa por conta</span>
        <p className="mt-1 text-xs text-muted">
          Em que patamar cada conta caiu no período — alcance médio, engajamento e rx.
        </p>

        {porConta.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Nenhuma conta identificada nos posts do período.
          </p>
        ) : (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead>
                <tr className="text-muted">
                  <th className="pb-2 font-normal">Conta</th>
                  <th className="pb-2 text-right font-normal">Alcance médio</th>
                  <th className="pb-2 text-right font-normal">Engajamento</th>
                  <th className="pb-2 text-right font-normal">rx médio</th>
                  <th className="pb-2 text-right font-normal">Faixa geral</th>
                </tr>
              </thead>
              <tbody>
                {porConta.map((c) => (
                  <tr key={c.chave} className="border-t border-line">
                    <td className="py-2 pr-2 text-corpo">@{c.rotulo}</td>
                    <td className="numero py-2 text-right text-txt">{numero(c.alcanceMedio)}</td>
                    <td className="py-2 text-right">
                      <span className="numero text-txt">
                        {c.engajamento === null ? "—" : `${numero(c.engajamento, 2)}%`}
                      </span>{" "}
                      <Pill nome={faixaTaxa(c.engajamento, MERCADO.engajamento)} />
                    </td>
                    <td className="numero py-2 text-right text-txt">
                      {c.rxMedio === null ? "—" : `${numero(c.rxMedio, 2)}×`}
                    </td>
                    <td className="py-2 text-right">
                      <Pill nome={faixaRx(c.rxMedio)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

import { FONTE_MERCADO, type LinhaMercado } from "@/lib/benchmark";
import { numero } from "@/lib/metricas";

export function TabelaMercado({ linhas }: { linhas: LinhaMercado[] }) {
  return (
    <div className="cartao p-4">
      <span className="rotulo">Taxas vs. mercado</span>
      <p className="mt-1 text-xs text-muted">{FONTE_MERCADO} — todas calculadas sobre o alcance.</p>

      <div className="mt-3 overflow-x-auto">
        <table className="w-full min-w-[520px] text-left text-xs">
          <thead>
            <tr className="text-muted">
              <th className="pb-2 font-normal">Indicador</th>
              <th className="pb-2 text-right font-normal">Você</th>
              <th className="pb-2 text-right font-normal">Mercado</th>
              <th className="pb-2 text-right font-normal">Diferença</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((l) => {
              const dif = l.atual === null ? null : l.atual - l.referencia;
              const classe =
                dif === null ? "text-muted" : dif >= 0 ? "pill pill-bom" : "pill pill-ruim";
              return (
                <tr key={l.rotulo} className="border-t border-line">
                  <td className="py-2 pr-2">
                    <span className="block text-corpo">{l.rotulo}</span>
                    <span className="block text-[.68rem] text-muted">{l.descricao}</span>
                  </td>
                  <td className="numero py-2 text-right text-txt">
                    {l.atual === null ? "—" : `${numero(l.atual, 2)}%`}
                  </td>
                  <td className="numero py-2 text-right text-muted">
                    {numero(l.referencia, 2)}%
                  </td>
                  <td className="py-2 text-right">
                    <span className={"numero " + classe}>
                      {dif === null
                        ? "—"
                        : `${dif >= 0 ? "+" : "−"}${numero(Math.abs(dif), 2)} p.p.`}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

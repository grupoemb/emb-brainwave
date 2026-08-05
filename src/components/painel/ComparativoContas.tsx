import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Link } from "@tanstack/react-router";
import { ArrowDownRight, ArrowUpRight, Flame } from "lucide-react";

import { Dica } from "@/components/painel/Dica";
import { TooltipProvider } from "@/components/ui/tooltip";
import { classeRx, numero } from "@/lib/metricas";
import { corDoCanal, type Canal } from "@/lib/conteudo";
import { GLOSSARIO } from "@/lib/glossario";
import type { ContaPainel } from "@/lib/painel.functions";

const MEDALHAS = ["1º", "2º", "3º", "4º", "5º"];

function Variacao({ v }: { v: number | null }) {
  if (v === null) return <span className="text-xs text-muted">sem base anterior</span>;
  const sobe = v >= 0;
  const Icone = sobe ? ArrowUpRight : ArrowDownRight;
  return (
    <span className={"flex items-center gap-0.5 text-xs " + (sobe ? "text-bom" : "text-ruim")}>
      <Icone size={12} />
      <span className="numero">{numero(Math.abs(v), 1)}%</span>
    </span>
  );
}

function Linha({
  rotulo,
  dica,
  valor,
}: {
  rotulo: string;
  dica: string;
  valor: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-2">
      <span className="flex items-center gap-1 text-xs text-muted">
        {rotulo}
        <Dica texto={dica} />
      </span>
      <span className="numero text-sm text-corpo">{valor}</span>
    </div>
  );
}

export function ComparativoContas({
  contas,
  dias,
}: {
  contas: ContaPainel[];
  dias: number;
}) {
  const total = contas.reduce((t, c) => t + (c.alcance ?? 0), 0);

  if (contas.length === 0) {
    return (
      <div className="cartao p-4">
        <h2 className="rotulo mb-2">Comparativo de contas — {dias} dias</h2>
        <EstadoVazio
          compacto
          titulo="Nenhum post publicado nesta janela"
          descricao="Experimente ampliar o período para 30 dias."
        />
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-3">
        <h2 className="rotulo">Comparativo de contas — {dias} dias</h2>
        <div className="grid gap-3 lg:grid-cols-3">
          {contas.map((c, i) => {
            const share = total > 0 ? ((c.alcance ?? 0) / total) * 100 : 0;
            return (
              <div key={c.conta} className="cartao flex flex-col gap-3 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: corDoCanal((c.channel ?? null) as Canal | null) }}
                    />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold">@{c.conta}</p>
                      <p className="text-xs text-muted">
                        {c.posts} {c.posts === 1 ? "post" : "posts"} no período
                      </p>
                    </div>
                  </div>
                  <span className="numero rounded-[.5rem] bg-azure/14 px-2 py-0.5 text-xs text-azureClaro">
                    {MEDALHAS[i] ?? `${i + 1}º`}
                  </span>
                </div>

                <div>
                  <div className="flex items-end justify-between gap-2">
                    <span className="numero text-2xl">{numero(c.alcance)}</span>
                    <Variacao v={c.variacaoAlcance} />
                  </div>
                  <span className="rotulo flex items-center gap-1">
                    alcance no período
                    <Dica texto={GLOSSARIO.alcancePeriodo} />
                  </span>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                      style={{ width: `${Math.max(2, share)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-muted">
                    <span className="numero">{numero(share, 1)}%</span> do alcance total
                  </p>
                </div>

                <div className="space-y-1.5 border-t border-line pt-2">
                  <Linha
                    rotulo="Alcance médio / post"
                    dica={GLOSSARIO.alcanceMedio}
                    valor={numero(c.alcanceMedio)}
                  />
                  <Linha
                    rotulo="Engajamento"
                    dica={GLOSSARIO.engajamento}
                    valor={c.engajamento === null ? "—" : `${numero(c.engajamento, 2)}%`}
                  />
                  <Linha
                    rotulo="rx médio"
                    dica={`${GLOSSARIO.rx} ${GLOSSARIO.rxMedio}`}
                    valor={
                      c.rxMedio === null ? (
                        "—"
                      ) : (
                        <span className={"pill numero " + (classeRx(c.rxMedio) || "text-corpo")}>
                          {numero(c.rxMedio, 2)}×
                        </span>
                      )
                    }
                  />
                  <Linha
                    rotulo="Consistência (rx ≥ 1)"
                    dica={GLOSSARIO.consistencia}
                    valor={c.consistencia === null ? "—" : `${c.consistencia}%`}
                  />
                  <Linha
                    rotulo="Fora da curva"
                    dica={GLOSSARIO.foraDaCurva}
                    valor={
                      <span className="flex items-center gap-1">
                        {c.outliers}
                        {c.outliers > 0 ? <Flame size={12} color="#f6bd24" /> : null}
                      </span>
                    }
                  />
                </div>

                <div className="border-t border-line pt-2">
                  <span className="rotulo flex items-center gap-1">
                    Melhor post
                    <Dica texto={GLOSSARIO.melhorPost} />
                  </span>
                  {c.melhorPost ? (
                    <Link
                      to="/post/$id"
                      params={{ id: c.melhorPost.id }}
                      search={{ origem: "painel", dias }}
                      className="mt-1 flex items-center gap-2 rounded-[.5rem] px-1 py-1 hover:bg-white/6"
                    >
                      <span className="min-w-0 flex-1 truncate text-xs text-corpo">
                        {c.melhorPost.title}
                      </span>
                      <span className="numero shrink-0 text-xs text-muted">
                        {numero(c.melhorPost.alcance)}
                      </span>
                      {c.melhorPost.rx !== null ? (
                        <span
                          className={
                            "pill numero shrink-0 " + (classeRx(c.melhorPost.rx) || "text-corpo")
                          }
                        >
                          {numero(c.melhorPost.rx, 2)}×
                        </span>
                      ) : null}
                    </Link>
                  ) : (
                    <p className="mt-1 text-xs text-muted">Sem leitura de métricas ainda.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </TooltipProvider>
  );
}

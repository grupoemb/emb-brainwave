import { useMemo, useState } from "react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { ChevronDown, Users } from "lucide-react";

import { BarrasContas } from "@/components/radar/BarrasContas";
import { BuscaPerfil } from "@/components/radar/BuscaPerfil";
import { CartaoConta } from "@/components/radar/CartaoConta";
import { DrawerConta } from "@/components/radar/DrawerConta";
import { LeituraSemana } from "@/components/radar/LeituraSemana";
import { LinhaCompacta, LinhaRanking } from "@/components/radar/LinhaRanking";

import { RankingReels } from "@/components/radar/RankingReels";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { KpiSeguidores } from "@/components/ui/KpiSeguidores";
import { useContas } from "@/hooks/useContas";
import { useRanking } from "@/hooks/useRanking";
import { useTopReels } from "@/hooks/useTopReels";
import { haQuantoTempo } from "@/lib/contas";
import { numero } from "@/lib/metricas";
import {
  alavancaDe,
  inteligenciaRapida,
  rotuloGancho,
  rotuloIntencao,
  topGeral,
  topPorPerfil,
} from "@/lib/ranking";

const DIAS = 90;

function CartaoKpiSimples({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="cartao flex min-h-[6.6rem] flex-col justify-between p-3.5">
      <span className="rotulo">{rotulo}</span>
      <span className="numero mt-2 text-2xl">{valor}</span>
    </div>
  );
}

function MiniStat({
  rotulo,
  valor,
  cor,
}: {
  rotulo: string;
  valor: string;
  cor?: string | undefined;
}) {
  return (
    <div className="rounded-[.6rem] border border-line px-3 py-2.5">
      <p className="rotulo text-[.64rem]">{rotulo}</p>
      <p className="mt-1 text-sm font-semibold" style={cor ? { color: cor } : undefined}>
        {valor}
      </p>
    </div>
  );
}

export function PainelContas() {
  const { data, isPending, error } = useContas();
  const top = useTopReels(12);
  const ranking = useRanking(DIAS);
  const [aberta, setAberta] = useState<string | null>(null);
  const [visaoAberta, setVisaoAberta] = useState(false);

  const contas = data?.contas ?? [];
  const frescor = haQuantoTempo(data?.ultimaColeta ?? null);

  const reels = useMemo(() => ranking.data ?? [], [ranking.data]);
  const top10 = useMemo(() => topGeral(reels, 10), [reels]);
  const porPerfil = useMemo(() => topPorPerfil(reels, 3), [reels]);
  const inteligencia = useMemo(() => inteligenciaRapida(reels), [reels]);

  const melhorAlavanca = alavancaDe(inteligencia.alavanca);

  return (
    <div className="space-y-5">
      <CabecalhoTela
        icone={<Users size={17} />}
        titulo="Suas contas"
        descricao={
          frescor
            ? `Ranking de reels dos últimos ${DIAS} dias · coletado há ${frescor}.`
            : `Ranking de reels dos últimos ${DIAS} dias das contas próprias.`
        }
      />

      {/* 1 · KPIs */}
      <div className="space-y-2">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <KpiSeguidores />
          <CartaoKpiSimples
            rotulo="Reels no período"
            valor={ranking.isPending ? "…" : numero(reels.length)}
          />
          <CartaoKpiSimples
            rotulo="Melhor alavanca"
            valor={melhorAlavanca?.rotulo ?? "—"}
          />
        </div>
        <p className="text-xs text-muted">
          Ranking por qualidade de crescimento — compartilhamentos, salvamentos e comentários por
          alcance. Views é vaidade.
        </p>
      </div>

      {/* 2 · Leitura da semana */}
      <LeituraSemana dias={DIAS} />

      {/* 3 · Inteligência rápida */}
      <section className="cartao p-4">
        <h2 className="rotulo mb-3">Inteligência rápida</h2>
        {top10.length === 0 ? (
          <p className="text-sm text-muted">
            Sem reels suficientes no período para ler os padrões dos campeões.
          </p>
        ) : (
          <>
            <div className="grid gap-2 sm:grid-cols-3">
              <MiniStat
                rotulo="Alavanca dominante"
                valor={melhorAlavanca?.rotulo ?? "—"}
                cor={melhorAlavanca?.cor}
              />
              <MiniStat rotulo="Gancho campeão" valor={rotuloGancho(inteligencia.gancho)} />
              <MiniStat rotulo="Intenção campeã" valor={rotuloIntencao(inteligencia.intencao)} />
            </div>
            {inteligencia.frase ? (
              <p className="mt-3 text-sm text-corpo">{inteligencia.frase}</p>
            ) : null}
          </>
        )}
      </section>

      {/* 4 · Top 10 */}
      <section className="cartao overflow-hidden">
        <div className="flex items-baseline justify-between gap-3 px-3 py-3">
          <h2 className="text-sm font-bold text-txt">Top 10 do período</h2>
          <span className="text-xs text-muted">todos os perfis · {DIAS} dias</span>
        </div>
        {ranking.isPending ? (
          <div className="space-y-2 p-3">
            {[0, 1, 2, 3, 4].map((i) => (
              <div key={i} className="h-9 animate-pulse rounded-[.5rem] bg-white/5" />
            ))}
          </div>
        ) : ranking.error ? (
          <div className="p-3">
            <EstadoVazio
              variante="erro"
              compacto
              marca={false}
              titulo="Não foi possível montar o ranking"
              descricao={
                ranking.error instanceof Error ? ranking.error.message : "Tente de novo em instantes."
              }
            />
          </div>
        ) : top10.length === 0 ? (
          <div className="p-3">
            <EstadoVazio
              compacto
              marca={false}
              titulo="Nenhum reel classificado ainda."
              descricao="Assim que a coleta trouxer reels do período, o ranking aparece aqui."
            />
          </div>
        ) : (
          <ul className="border-t border-line">
            {top10.map((r, i) => (
              <LinhaRanking key={r.id} reel={r} posicao={r.rank_geral ?? i + 1} />
            ))}
          </ul>
        )}
      </section>

      {/* 5 · Top 3 por perfil */}
      {porPerfil.length > 0 ? (
        <div className="grid gap-3 lg:grid-cols-2">
          {porPerfil.map((g) => (
            <section key={g.handle} className="cartao overflow-hidden">
              <h2 className="px-3 py-2.5 text-sm font-bold text-txt">Top 3 · @{g.handle}</h2>
              {g.reels.length === 0 ? (
                <p className="px-3 pb-3 text-xs text-muted">Sem reels classificados nesta conta.</p>
              ) : (
                <ul className="border-t border-line">
                  {g.reels.map((r, i) => (
                    <LinhaCompacta key={r.id} reel={r} posicao={r.rank_perfil ?? i + 1} />
                  ))}
                </ul>
              )}
            </section>
          ))}
        </div>
      ) : null}

      {/* 6 · Visão geral das contas (secundária) */}
      <section className="cartao overflow-hidden">
        <button
          type="button"
          onClick={() => setVisaoAberta((v) => !v)}
          aria-expanded={visaoAberta}
          className="flex w-full items-center justify-between gap-3 px-3 py-3 text-left transition-colors hover:bg-white/4"
        >
          <span className="text-sm font-bold text-txt">Visão geral das contas</span>
          <ChevronDown
            size={16}
            className={"text-muted transition-transform " + (visaoAberta ? "rotate-180" : "")}
            aria-hidden
          />
        </button>

        {visaoAberta ? (
          <div className="space-y-4 border-t border-line p-3">
            {isPending ? (
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="cartao h-[190px] animate-pulse p-5" />
                ))}
              </div>
            ) : error ? (
              <EstadoVazio
                variante="erro"
                compacto
                marca={false}
                titulo="Não foi possível ler as contas"
                descricao={error instanceof Error ? error.message : "Tente de novo em instantes."}
              />
            ) : contas.length === 0 ? (
              <EstadoVazio
                compacto
                marca={false}
                titulo="Aguardando a primeira coleta das contas."
                descricao="Assim que os reels das contas conectadas forem lidos, os cartões aparecem aqui."
              />
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {contas.map((c) => (
                    <CartaoConta key={c.handle} conta={c} aoAbrir={() => setAberta(c.handle)} />
                  ))}
                </div>

                <RankingReels reels={top.data ?? []} carregando={top.isPending} />

                <div className="grid gap-3 lg:grid-cols-2">
                  <BarrasContas
                    id="gradContasViews"
                    titulo="Média de views por conta"
                    cor="#00a4ff"
                    dados={contas.map((c) => ({ rotulo: `@${c.handle}`, valor: c.avgViews ?? 0 }))}
                  />
                  <BarrasContas
                    id="gradContasEng"
                    titulo="Engajamento % por conta"
                    cor="#3ecf8e"
                    casas={1}
                    sufixo="%"
                    dados={contas.map((c) => ({ rotulo: `@${c.handle}`, valor: c.engPct ?? 0 }))}
                  />
                </div>
              </>
            )}
          </div>
        ) : null}
      </section>

      <DrawerConta handle={aberta} aoFechar={() => setAberta(null)} />
    </div>
  );
}

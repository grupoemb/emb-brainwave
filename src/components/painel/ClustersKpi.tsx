import { CartaoKpiPainel } from "@/components/painel/CartaoKpiPainel";
import { GLOSSARIO } from "@/lib/glossario";
import type { DadosPainel } from "@/lib/painel.tipos";

function Grupo({
  titulo,
  legenda,
  children,
}: {
  titulo: string;
  legenda: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="rotulo">{titulo}</h2>
        <span className="text-[.7rem] text-muted">{legenda}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">{children}</div>
    </section>
  );
}

/** Métricas secundárias agrupadas por significado, sem competir com os heróis. */
export function ClustersKpi({ dados }: { dados: DadosPainel }) {
  const k = dados.kpis;
  const a = dados.anterior;

  return (
    <div className="space-y-4">
      <Grupo titulo="Distribuição" legenda="quanto conteúdo circulou">
        <CartaoKpiPainel
          rotulo="Alcance"
          compactar
          valor={k.alcance}
          anterior={a?.alcance ?? null}
          dica={GLOSSARIO.alcancePeriodo}
        />
        <CartaoKpiPainel
          rotulo="Views"
          compactar
          valor={k.impressoes}
          anterior={a?.impressoes ?? null}
          dica="Soma das visualizações (antigas impressões) da leitura mais recente de cada post do período."
        />
        <CartaoKpiPainel
          rotulo="Novos seguidores"
          compactar
          valor={k.seguidores}
          anterior={a?.seguidores ?? null}
          dica="Soma do saldo de seguidores atribuído aos posts do período."
        />
        <CartaoKpiPainel
          rotulo="rx médio"
          valor={k.rxMedio}
          anterior={a?.rxMedio ?? null}
          casas={2}
          sufixo="×"
          dica={`${GLOSSARIO.rx} ${GLOSSARIO.rxMedio}`}
        />
        <CartaoKpiPainel
          rotulo="Fora da curva"
          valor={k.outliers}
          anterior={a?.outliers ?? null}
          dica={GLOSSARIO.foraDaCurvaBloco}
        />
      </Grupo>

      <Grupo titulo="Ressonância" legenda="o que a audiência devolveu">
        <CartaoKpiPainel
          rotulo="Interações"
          compactar
          valor={k.interacoes}
          anterior={a?.interacoes ?? null}
          dica="Curtidas + comentários + salvamentos + compartilhamentos."
        />
        <CartaoKpiPainel
          rotulo="Engajamento"
          valor={k.engajamento}
          anterior={a?.engajamento ?? null}
          casas={2}
          sufixo="%"
          dica={GLOSSARIO.engajamento}
        />
        <CartaoKpiPainel
          rotulo="Salvamentos"
          compactar
          valor={k.saves}
          anterior={a?.saves ?? null}
          dica="Sinal mais forte de conteúdo de valor: quantas pessoas guardaram o post."
        />
        <CartaoKpiPainel
          rotulo="Compartilhamentos"
          compactar
          valor={k.shares}
          anterior={a?.shares ?? null}
          dica="Principal motor de alcance novo no Instagram."
        />
        <CartaoKpiPainel
          rotulo="Comentários"
          compactar
          valor={k.comments}
          anterior={a?.comments ?? null}
          dica="Total de comentários das leituras mais recentes do período."
        />
      </Grupo>

      <Grupo titulo="Produção" legenda="o ritmo do time">
        <CartaoKpiPainel
          rotulo="Posts publicados"
          valor={k.publicados}
          anterior={a?.publicados ?? null}
          dica="Quantidade de posts publicados dentro da janela."
        />
        <CartaoKpiPainel
          rotulo="Ritmo semanal"
          valor={k.frequencia}
          anterior={a?.frequencia ?? null}
          casas={1}
          sufixo="/sem"
          dica="Média de posts publicados por semana dentro da janela."
        />
      </Grupo>
    </div>
  );
}

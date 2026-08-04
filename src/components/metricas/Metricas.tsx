import { useState } from "react";

import { Revelar } from "@/components/Revelar";
import { CartaoKpi } from "@/components/metricas/CartaoKpi";
import { DonutFormatos } from "@/components/metricas/DonutFormatos";
import { EsqueletoMetricas } from "@/components/metricas/EsqueletoMetricas";
import { FiltrosMetricas } from "@/components/metricas/FiltrosMetricas";
import { GraficoAlcance } from "@/components/metricas/GraficoAlcance";
import { TabelaPosts } from "@/components/metricas/TabelaPosts";
import { usePilares } from "@/hooks/useConteudo";
import { useContasConectadas, useMetricas } from "@/hooks/useMetricas";

export function Metricas() {
  const m = useMetricas();
  const contas = useContasConectadas();
  const { pilares } = usePilares();
  const [acumulado, setAcumulado] = useState(false);
  const [modo, setModo] = useState<"top" | "piores">("top");

  const k = m.kpis;
  const semPosts = !m.carregando && m.linhas.length === 0;

  return (
    <Revelar className="space-y-4">
      <div className="secao-entrada">
        <FiltrosMetricas
          dias={m.dias}
          setDias={m.setDias}
          conta={m.conta}
          setConta={m.setConta}
          pilar={m.pilar}
          setPilar={m.setPilar}
          contas={contas}
          pilares={pilares}
          ultimaColeta={m.ultimaColeta}
          atualizando={m.atualizando}
          atualizar={m.atualizar}
        />
      </div>

      {m.carregando ? (
        <div className="secao-entrada">
          <EsqueletoMetricas />
        </div>
      ) : semPosts ? (
        <div className="cartao secao-entrada p-8 text-center text-sm text-muted">
          {m.houveColeta
            ? "Nenhum post no período selecionado"
            : "Aguardando a primeira coleta das contas"}
        </div>
      ) : (
        <>
          <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
            <CartaoKpi
              rotulo="Alcance total"
              valor={k.alcance}
              formula="Soma do alcance da leitura mais recente de cada post no período."
            />
            <CartaoKpi
              rotulo="Salvamentos"
              valor={k.saves}
              formula="Soma dos salvamentos da leitura mais recente de cada post."
            />
            <CartaoKpi
              rotulo="Compartilhamentos"
              valor={k.shares}
              formula="Soma dos compartilhamentos da leitura mais recente de cada post."
            />
            <CartaoKpi
              rotulo="Comentários"
              valor={k.comments}
              formula="Soma dos comentários da leitura mais recente de cada post."
            />
            <CartaoKpi
              rotulo="Curtidas"
              valor={k.likes}
              formula="Soma das curtidas da leitura mais recente de cada post."
            />
            <CartaoKpi
              rotulo="Engajamento médio"
              valor={k.engajamento}
              casas={1}
              sufixo="%"
              formula="(curtidas + comentários + salvamentos + compartilhamentos) ÷ alcance."
            />
            <CartaoKpi
              rotulo="Posts publicados"
              valor={k.publicados}
              formula="Quantidade de posts publicados dentro do período e dos filtros."
            />
            <CartaoKpi
              rotulo="rx médio"
              valor={k.rxMedio}
              casas={2}
              sufixo="×"
              formula="Média do rx: alcance do post ÷ mediana da baseline do canal e formato."
            />
            <CartaoKpi
              rotulo="Melhor formato"
              texto={k.melhorFormato ? `${k.melhorFormato.rotulo}` : null}
              formula="Formato com maior rx médio, considerando no mínimo 3 posts."
            />
            <CartaoKpi
              rotulo="Melhor horário"
              texto={k.melhorHorario ? k.melhorHorario.faixa : null}
              formula="Faixa de hora com maior alcance médio, no fuso America/Sao_Paulo."
            />
          </div>

          <div className="secao-entrada grid gap-4 lg:grid-cols-3">
            <GraficoAlcance
              dados={m.serie}
              acumulado={acumulado}
              onToggle={() => setAcumulado((v) => !v)}
            />
            <DonutFormatos dados={m.formatos} />
          </div>

          <div className="secao-entrada">
            <TabelaPosts linhas={m.linhas} modo={modo} setModo={setModo} />
          </div>
        </>
      )}
    </Revelar>
  );
}

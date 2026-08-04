import { useMemo, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";

import { BarChart3 } from "lucide-react";

import { Revelar } from "@/components/Revelar";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";

import { BarrasDimensao } from "@/components/metricas/BarrasDimensao";
import { Benchmark } from "@/components/metricas/Benchmark";
import { CartaoKpi } from "@/components/metricas/CartaoKpi";
import { ComparativoContas } from "@/components/metricas/ComparativoContas";
import { EsqueletoMetricas } from "@/components/metricas/EsqueletoMetricas";
import { FiltrosMetricas } from "@/components/metricas/FiltrosMetricas";
import { FunilInteracao } from "@/components/metricas/FunilInteracao";
import { GradeTaxas } from "@/components/metricas/GradeTaxas";
import { GraficoAlcance } from "@/components/metricas/GraficoAlcance";
import { HeroAlcance } from "@/components/metricas/HeroAlcance";
import { MapaDeCalor } from "@/components/metricas/MapaDeCalor";
import { RitmoPublicacao } from "@/components/metricas/RitmoPublicacao";
import { SubAbas, type Aba } from "@/components/metricas/SubAbas";
import { TabelaPosts } from "@/components/metricas/TabelaPosts";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import { rotuloIntervalo } from "@/lib/metricas";
import { usePilares } from "@/hooks/useConteudo";
import { useContasConectadas, useMetricas, type Periodo } from "@/hooks/useMetricas";

export function Metricas() {
  const { dias: diasUrl, origem } = useSearch({ from: "/_authenticated/metricas" });
  const navigate = useNavigate();
  const diasInicial: Periodo = ([7, 30, 90] as const).includes(diasUrl as Periodo)
    ? (diasUrl as Periodo)
    : 30;
  const m = useMetricas(diasInicial);
  const contas = useContasConectadas();
  const { pilarPorId, pilares } = usePilares();
  const [acumulado, setAcumulado] = useState(false);
  const [modo, setModo] = useState<"top" | "piores">("top");
  const [soOutliers, setSoOutliers] = useState(false);
  const [aba, setAba] = useState<Aba>("geral");

  const doPainel = origem === "painel";
  const faixa = doPainel ? (
    <FaixaDeContexto
      recorte={`últimos ${m.dias} dias`}
      onLimpar={() => void navigate({ to: "/metricas", search: { dias: 30, origem: "" } })}
    />
  ) : null;

  const k = m.kpis;
  const ka = m.kpisComparados;
  const t = m.taxas;
  const ta = m.taxasComparadas;
  const comparando = !!m.intervaloComparado;
  const semPosts = !m.carregando && m.linhas.length === 0;
  const rotuloComp = m.intervaloComparado ? rotuloIntervalo(m.intervaloComparado) : undefined;

  const porPilar = useMemo(
    () =>
      m.porPilarBruto.map((p) => ({
        ...p,
        rotulo: pilarPorId.get(p.chave)?.name ?? "Sem pilar",
      })),
    [m.porPilarBruto, pilarPorId],
  );

  // undefined = comparação desligada; null = sem base
  const anterior = (v: number | null | undefined) =>
    comparando ? ((v ?? null) as number | null) : undefined;
  const anteriorTexto = (v: string | null | undefined) =>
    comparando ? ((v ?? null) as string | null) : undefined;
  const extras = { comparando: m.comparando, rotuloComparacao: rotuloComp };

  return (
    <Revelar className="space-y-4">
      <CabecalhoTela
        icone={<BarChart3 size={17} />}
        titulo="Métricas"
        descricao="Desempenho das contas, ritmo de publicação e comparação com o mercado."
      />
      {faixa}


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
          comparacao={m.comparacao}
          setComparacao={m.setComparacao}
          customDesde={m.customDesde}
          setCustomDesde={m.setCustomDesde}
          customAte={m.customAte}
          setCustomAte={m.setCustomAte}
        />
      </div>

      {m.carregando ? (
        <div className="secao-entrada">
          <EsqueletoMetricas />
        </div>
      ) : semPosts ? (
        <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted">
            {doPainel && m.dias === 7
              ? "Sem leituras de métricas nos últimos 7 dias."
              : m.houveColeta
                ? "Nenhum post no período selecionado"
                : "Aguardando a primeira coleta das contas"}
          </p>
          {doPainel && m.dias === 7 ? (
            <button className="btn px-3 py-1.5 text-xs" onClick={() => m.setDias(30)}>
              ver 30 dias
            </button>
          ) : null}
        </div>
      ) : (
        <>
          <div className="secao-entrada">
            <HeroAlcance
              taxas={t}
              taxasAnterior={ta}
              serie={m.sparkAlcance}
              intervalo={rotuloIntervalo(m.intervalo)}
              rotuloComparacao={rotuloComp}
              publicados={k.publicados}
            />
          </div>

          <div className="secao-entrada flex flex-wrap items-center justify-between gap-3">
            <SubAbas aba={aba} setAba={setAba} />
            {comparando ? (
              <span className="text-xs text-muted">
                {rotuloIntervalo(m.intervalo)} <span className="text-corpo">vs</span> {rotuloComp}
              </span>
            ) : null}
          </div>

          {aba === "geral" ? (
            <>
              <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
                <CartaoKpi
                  rotulo="Alcance total"
                  valor={k.alcance}
                  valorAnterior={anterior(ka?.alcance)}
                  {...extras}
                  formula="Soma do alcance da leitura mais recente de cada post no período."
                />
                <CartaoKpi
                  rotulo="Impressões"
                  valor={t.impressoes}
                  valorAnterior={anterior(ta?.impressoes)}
                  {...extras}
                  formula="Soma das impressões da leitura mais recente de cada post."
                />
                <CartaoKpi
                  rotulo="Interações"
                  valor={t.interacoes}
                  valorAnterior={anterior(ta?.interacoes)}
                  {...extras}
                  formula="Curtidas + comentários + salvamentos + compartilhamentos."
                />
                <CartaoKpi
                  rotulo="Salvamentos"
                  valor={k.saves}
                  valorAnterior={anterior(ka?.saves)}
                  {...extras}
                  formula="Soma dos salvamentos da leitura mais recente de cada post."
                />
                <CartaoKpi
                  rotulo="Compartilhamentos"
                  valor={k.shares}
                  valorAnterior={anterior(ka?.shares)}
                  {...extras}
                  formula="Soma dos compartilhamentos da leitura mais recente de cada post."
                />
                <CartaoKpi
                  rotulo="Comentários"
                  valor={k.comments}
                  valorAnterior={anterior(ka?.comments)}
                  {...extras}
                  formula="Soma dos comentários da leitura mais recente de cada post."
                />
                <CartaoKpi
                  rotulo="Curtidas"
                  valor={k.likes}
                  valorAnterior={anterior(ka?.likes)}
                  {...extras}
                  formula="Soma das curtidas da leitura mais recente de cada post."
                />
                <CartaoKpi
                  rotulo="Posts publicados"
                  valor={k.publicados}
                  valorAnterior={anterior(ka?.publicados)}
                  {...extras}
                  formula="Quantidade de posts publicados dentro do período e dos filtros."
                />
                <CartaoKpi
                  rotulo="rx médio"
                  valor={k.rxMedio}
                  valorAnterior={anterior(ka?.rxMedio)}
                  {...extras}
                  casas={2}
                  sufixo="×"
                  formula="Média do rx: alcance do post ÷ mediana da baseline do canal e formato."
                  aoClicar={() => {
                    setSoOutliers((v) => !v);
                    setAba("conteudo");
                  }}
                  ativo={soOutliers}
                  dicaAcao="Clique para ver só os posts fora da curva (rx ≥ 2,00×)."
                />
                <CartaoKpi
                  rotulo="Fora da curva"
                  valor={t.outliers}
                  valorAnterior={anterior(ta?.outliers)}
                  {...extras}
                  formula="Posts com alcance de pelo menos 2× a mediana do formato."
                />
              </div>

              <div className="secao-entrada">
                <GradeTaxas taxas={t} anterior={ta} rotuloComparacao={rotuloComp} />
              </div>

              <div className="secao-entrada grid gap-4 lg:grid-cols-3">
                <GraficoAlcance
                  dados={m.serie}
                  acumulado={acumulado}
                  onToggle={() => setAcumulado((v) => !v)}
                />
                <FunilInteracao etapas={m.funil} />
              </div>
            </>
          ) : null}

          {aba === "conteudo" ? (
            <>
              <div className="secao-entrada grid gap-4 lg:grid-cols-2">
                <BarrasDimensao
                  titulo="Desempenho por formato"
                  descricao="rx médio de cada formato — acima de 1,30× está performando."
                  itens={m.porFormato}
                />
                <BarrasDimensao
                  titulo="Desempenho por gancho"
                  descricao="Qual abertura de conteúdo entrega mais alcance relativo."
                  itens={m.porGancho}
                  vazio="Nenhum post do período tem gancho classificado."
                />
                <BarrasDimensao
                  titulo="Desempenho por pilar"
                  descricao="Como cada pilar editorial performa contra a mediana."
                  itens={porPilar}
                  vazio="Nenhum post do período tem pilar definido."
                />
                <BarrasDimensao
                  titulo="Desempenho por tema"
                  descricao="Temas recorrentes ordenados por rx médio."
                  itens={m.porTema}
                  vazio="Nenhum post do período tem tema classificado."
                  limite={8}
                />
              </div>

              <div className="secao-entrada">
                <TabelaPosts
                  linhas={m.linhas}
                  modo={modo}
                  setModo={setModo}
                  soOutliers={soOutliers}
                  aoLimparOutliers={() => setSoOutliers((v) => !v)}
                />
              </div>
            </>
          ) : null}

          {aba === "ritmo" ? (
            <>
              <div className="secao-entrada">
                <MapaDeCalor grade={m.calor.grade} max={m.calor.max} melhor={m.calor.melhor} />
              </div>
              <div className="secao-entrada">
                <RitmoPublicacao cadencia={m.cadencia} maturacao={m.maturacao} />
              </div>
              <div className="secao-entrada">
                <BarrasDimensao
                  titulo="Desempenho por intenção"
                  descricao="Educar, vender, engajar: o que a audiência responde melhor."
                  itens={m.porIntencao}
                  vazio="Nenhum post do período tem intenção classificada."
                />
              </div>
            </>
          ) : null}

          {aba === "contas" ? (
            <div className="secao-entrada space-y-4">
              <ComparativoContas contas={m.porConta} />
              <BarrasDimensao
                titulo="rx médio por conta"
                descricao="Performance relativa à mediana do formato, conta a conta."
                itens={m.porConta}
                vazio="Nenhuma conta identificada nos posts do período."
              />
            </div>
          ) : null}

          {aba === "benchmark" ? (
            <Benchmark
              linhas={m.linhas}
              baselines={m.baselines}
              taxas={t}
              publicados={k.publicados}
              porSemana={m.cadencia.porSemana}
              porConta={m.porConta}
            />
          ) : null}
        </>
      )}
    </Revelar>
  );
}

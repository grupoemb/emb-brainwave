import { useMemo, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";

import {
  AlertTriangle,
  BarChart3,
  Bookmark,
  CalendarRange,
  Clock,

  Eye,
  Filter,
  Flame,
  Heart,
  Layers,
  MessageCircle,
  Satellite,
  Send,
  Sparkle,
  Target,
  Users,

  Zap,
} from "lucide-react";


import { Revelar } from "@/components/Revelar";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";

import { BarraComposicao } from "@/components/metricas/BarraComposicao";
import { BarrasDimensao } from "@/components/metricas/BarrasDimensao";
import { PainelDrill } from "@/components/metricas/PainelDrill";
import { Benchmark } from "@/components/metricas/Benchmark";
import { CartaoKpi } from "@/components/metricas/CartaoKpi";
import { KpiSeguidores } from "@/components/ui/KpiSeguidores";
import { ComparativoContas } from "@/components/metricas/ComparativoContas";
import { DonutFormatos } from "@/components/metricas/DonutFormatos";
import { EsqueletoMetricas } from "@/components/metricas/EsqueletoMetricas";
import { FiltrosMetricas } from "@/components/metricas/FiltrosMetricas";
import { FunilInteracao } from "@/components/metricas/FunilInteracao";
import { GradeTaxas } from "@/components/metricas/GradeTaxas";
import { GraficoAlcance } from "@/components/metricas/GraficoAlcance";
import { GrupoKpis } from "@/components/metricas/GrupoKpis";
import { MapaDeCalor } from "@/components/metricas/MapaDeCalor";
import { PainelResultado } from "@/components/metricas/PainelResultado";
import { RadarDesempenho } from "@/components/metricas/RadarDesempenho";
import { RitmoPublicacao } from "@/components/metricas/RitmoPublicacao";
import {
  ABA_POR_VALOR,
  SubAbas,
  ehAba,
  type Aba,
} from "@/components/metricas/SubAbas";
import { TrilhaMetricas } from "@/components/metricas/TrilhaMetricas";

import { TabelaPosts } from "@/components/metricas/TabelaPosts";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import {
  filtrarPorRecorte,
  rotuloIntervalo,
  rotuloRecorte,
  type Recorte,
} from "@/lib/metricas";
import { usePilares } from "@/hooks/useConteudo";
import { useContasConectadas, useMetricas, type Periodo } from "@/hooks/useMetricas";

/** Título + linha de leitura acima de um bloco analítico. */
function TituloBloco({ titulo, leitura }: { titulo: string; leitura: string }) {
  return (
    <div className="mb-2">
      <h3 className="titulo-secao">{titulo}</h3>
      <p className="text-xs text-muted">{leitura}</p>
    </div>
  );
}

export function Metricas() {
  const { dias: diasUrl, origem, aba: abaUrl } = useSearch({ from: "/_authenticated/metricas" });
  const navigate = useNavigate();
  const diasInicial: Periodo = ([7, 14, 30, 90] as const).includes(diasUrl as Periodo)
    ? (diasUrl as Periodo)
    : 30;
  const m = useMetricas(diasInicial);
  const contas = useContasConectadas();
  const { pilarPorId, pilares } = usePilares();
  const [acumulado, setAcumulado] = useState(false);
  const [modo, setModo] = useState<"top" | "piores">("top");
  const [soOutliers, setSoOutliers] = useState(false);
  const [drill, setDrill] = useState<Recorte | null>(null);
  const [recorteTabela, setRecorteTabela] = useState<Recorte | null>(null);

  const verNaTabela = (r: Recorte) => {
    setRecorteTabela(r);
    setDrill(null);
    setAba("conteudo");
  };

  const aba: Aba = ehAba(abaUrl) ? abaUrl : "geral";
  const setAba = (a: Aba) => {
    void navigate({
      to: "/metricas",
      search: { dias: diasUrl, origem, aba: a },
      replace: true,
    });
  };
  const abaAtual = ABA_POR_VALOR.get(aba)!;

  const doPainel = origem === "painel";
  const faixa = doPainel ? (
    <FaixaDeContexto
      recorte={`últimos ${m.dias} dias`}
      onLimpar={() =>
        void navigate({ to: "/metricas", search: { dias: 30, origem: "", aba } })
      }
    />
  ) : null;

  const k = m.kpis;
  const ka = m.kpisComparados;
  const t = m.taxas;
  const ta = m.taxasComparadas;
  const comparando = !!m.intervaloComparado;
  const semPosts = !m.carregando && m.linhas.length === 0;
  const comRecorte = m.conta !== "todas" || m.pilar !== "todos";
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
  const extras = { comparando: m.comparando, rotuloComparacao: rotuloComp };

  const totalInteracoes = t.interacoes ?? 0;
  const parte = (v: number | null) =>
    totalInteracoes > 0 && v !== null ? (v / totalInteracoes) * 100 : null;

  const fatias = [
    { rotulo: "Curtidas", valor: k.likes ?? 0, cor: "#00a4ff" },
    { rotulo: "Comentários", valor: k.comments ?? 0, cor: "#00e7ff" },
    { rotulo: "Salvamentos", valor: k.saves ?? 0, cor: "#3ecf8e" },
    { rotulo: "Compartilhamentos", valor: k.shares ?? 0, cor: "#f2c14e" },
  ];

  return (
    <Revelar className="space-y-4">
      {m.carregando ? null : <TrilhaMetricas aba={abaAtual.rotulo} dias={diasUrl} origem={origem} />}
      <CabecalhoTela
        icone={<BarChart3 size={17} />}
        titulo="Métricas"
        descricao="Desempenho das contas, ritmo de publicação e comparação com o mercado."
      />
      {faixa}


      <div className="secao-entrada sticky top-14 z-20 -mx-4 border-b border-line bg-bg/92 px-4 py-2 backdrop-blur lg:-mx-6 lg:px-6">
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
      ) : m.erro ? (
        <div className="secao-entrada">
          <EstadoVazio
            variante="erro"
            icone={<AlertTriangle size={16} />}
            titulo="Não foi possível carregar as métricas"
            descricao="A consulta falhou. Tente novamente; se persistir, verifique sua conexão e acesso à organização."
            acao={
              <button type="button" className="btn-primario px-3 py-1.5 text-xs" onClick={m.atualizar}>
                Tentar novamente
              </button>
            }
          />
        </div>
      ) : semPosts ? (
        <div className="secao-entrada">
          {comRecorte && m.houveColeta ? (
            <EstadoVazio
              variante="filtro"
              icone={<Filter size={16} />}
              titulo="Nenhum post com os recortes atuais"
              descricao="Os filtros de conta e pilar deixaram o período sem posts. Limpe os recortes para ver tudo."
              acao={
                <button
                  type="button"
                  className="btn px-3 py-1.5 text-xs"
                  onClick={() => {
                    m.setConta("todas");
                    m.setPilar("todos");
                  }}
                >
                  Limpar recortes
                </button>
              }
            />
          ) : m.houveColeta ? (
            <EstadoVazio
              icone={<CalendarRange size={16} />}
              titulo="Nenhum post neste período"
              descricao={`Não há posts publicados nos últimos ${m.dias} dias. Amplie a janela para encontrar conteúdo.`}
              acao={
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    className="btn px-3 py-1.5 text-xs"
                    onClick={() => m.setDias(30)}
                  >
                    Ver 30 dias
                  </button>
                  <button
                    type="button"
                    className="btn-primario px-3 py-1.5 text-xs"
                    onClick={() => m.setDias(90)}
                  >
                    Ver 90 dias
                  </button>
                </div>
              }
            />
          ) : (
            <EstadoVazio
              icone={<Satellite size={16} />}
              titulo="Aguardando a primeira coleta"
              descricao="As contas conectadas ainda não trouxeram leituras de métricas. Confira as conexões em Ajustes."
              acao={
                <Link to="/ajustes" className="btn-primario px-3 py-1.5 text-xs">
                  Abrir Ajustes › Contas
                </Link>
              }
            />
          )}
        </div>
      ) : (

        <>
          <div className="secao-entrada">
            <PainelResultado
              taxas={t}
              taxasAnterior={ta}
              rxMedio={k.rxMedio}
              serie={m.serie}
              intervalo={rotuloIntervalo(m.intervalo)}
              rotuloComparacao={rotuloComp}
              publicados={k.publicados}
            />
          </div>

          <div className="secao-entrada space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <SubAbas
                aba={aba}
                setAba={setAba}
                contadores={{
                  conteudo: k.publicados,
                  contas: m.porConta.length,
                  benchmark: m.baselines.length,
                }}
              />
              {comparando ? (
                <span className="text-xs text-muted">
                  {rotuloIntervalo(m.intervalo)} <span className="text-corpo">vs</span> {rotuloComp}
                </span>
              ) : null}
            </div>
            <p className="text-xs text-muted">{abaAtual.contexto}</p>
          </div>


          {aba === "geral" ? (
            <>
              <div className="secao-entrada">
                <GrupoKpis
                  familia="alcance"
                  titulo="Alcance"
                  descricao="quantas pessoas viram e quantas vezes"
                  colunas="grid-cols-2 lg:grid-cols-4"
                >
                  <KpiSeguidores compactoVisual />
                  <CartaoKpi
                    familia="alcance"
                    destaque
                    icone={<Eye size={13} />}
                    rotulo="Alcance total"
                    compactar
                    valor={k.alcance}
                    valorAnterior={anterior(ka?.alcance)}
                    serie={m.sparkAlcance}
                    {...extras}
                    formula="Soma do alcance da leitura mais recente de cada post no período."
                  />
                  <CartaoKpi
                    familia="alcance"
                    icone={<Layers size={13} />}
                    rotulo="Impressões"
                    compactar
                    valor={t.impressoes}
                    valorAnterior={anterior(ta?.impressoes)}
                    {...extras}
                    formula="Soma das impressões da leitura mais recente de cada post."
                  />
                  <CartaoKpi
                    familia="alcance"
                    icone={<Sparkle size={13} />}
                    rotulo="Impressões por post"
                    compactar
                    valor={t.impressoesMedia}
                    valorAnterior={anterior(ta?.impressoesMedia)}
                    {...extras}
                    formula="Impressões totais ÷ número de posts do período."
                  />
                </GrupoKpis>
              </div>

              <div className="secao-entrada">
                <GrupoKpis
                  familia="interacao"
                  titulo="Interação"
                  descricao="o que a audiência fez depois de ver"
                  colunas="grid-cols-2 lg:grid-cols-6"
                >
                  <CartaoKpi
                    familia="interacao"
                    destaque
                    icone={<Zap size={13} />}
                    rotulo="Interações"
                    compactar
                    valor={t.interacoes}
                    valorAnterior={anterior(ta?.interacoes)}
                    serie={m.sparkInteracoes}
                    {...extras}
                    formula="Curtidas + comentários + salvamentos + compartilhamentos."
                  />
                  <CartaoKpi
                    familia="interacao"
                    icone={<Heart size={13} />}
                    rotulo="Curtidas"
                    compactar
                    valor={k.likes}
                    valorAnterior={anterior(ka?.likes)}
                    participacao={parte(k.likes)}
                    {...extras}
                    formula="Soma das curtidas da leitura mais recente de cada post."
                  />
                  <CartaoKpi
                    familia="interacao"
                    icone={<MessageCircle size={13} />}
                    rotulo="Comentários"
                    compactar
                    valor={k.comments}
                    valorAnterior={anterior(ka?.comments)}
                    participacao={parte(k.comments)}
                    {...extras}
                    formula="Soma dos comentários da leitura mais recente de cada post."
                  />
                  <CartaoKpi
                    familia="interacao"
                    icone={<Bookmark size={13} />}
                    rotulo="Salvamentos"
                    compactar
                    valor={k.saves}
                    valorAnterior={anterior(ka?.saves)}
                    participacao={parte(k.saves)}
                    {...extras}
                    formula="Soma dos salvamentos da leitura mais recente de cada post."
                  />
                  <CartaoKpi
                    familia="interacao"
                    icone={<Send size={13} />}
                    rotulo="Compartilhamentos"
                    compactar
                    valor={k.shares}
                    valorAnterior={anterior(ka?.shares)}
                    participacao={parte(k.shares)}
                    {...extras}
                    formula="Soma dos compartilhamentos da leitura mais recente de cada post."
                  />
                </GrupoKpis>
              </div>

              <div className="secao-entrada">
                <GrupoKpis
                  familia="eficiencia"
                  titulo="Eficiência"
                  descricao="quanto cada post rende contra a mediana do formato"
                  colunas="grid-cols-2 lg:grid-cols-5"
                >
                  <CartaoKpi
                    familia="eficiencia"
                    destaque
                    icone={<Target size={13} />}
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
                    familia="eficiencia"
                    icone={<Flame size={13} />}
                    rotulo="Fora da curva"
                    valor={t.outliers}
                    valorAnterior={anterior(ta?.outliers)}
                    {...extras}
                    formula="Posts com alcance de pelo menos 2× a mediana do formato."
                  />
                  <CartaoKpi
                    familia="eficiencia"
                    icone={<BarChart3 size={13} />}
                    rotulo="Posts publicados"
                    valor={k.publicados}
                    valorAnterior={anterior(ka?.publicados)}
                    {...extras}
                    formula="Quantidade de posts publicados dentro do período e dos filtros."
                  />
                  <CartaoKpi
                    familia="eficiencia"
                    icone={<Target size={13} />}
                    rotulo="Taxa de acerto"
                    valor={t.taxaAcerto}
                    valorAnterior={anterior(ta?.taxaAcerto)}
                    sufixo="%"
                    {...extras}
                    formula="Percentual de posts com rx ≥ 1,00× (acima da mediana do formato)."
                  />
                </GrupoKpis>
              </div>

              <div className="secao-entrada grid gap-4 lg:grid-cols-2">
                <BarraComposicao
                  titulo="Composição das interações"
                  descricao="De onde vem o engajamento — salvar e compartilhar valem mais que curtir."
                  fatias={fatias}
                />
                <FunilInteracao etapas={m.funil} />
              </div>

              <div className="secao-entrada">
                <TituloBloco
                  titulo="Curva do período"
                  leitura="Picos indicam posts que estouraram; vales indicam dias sem publicação ou entrega fraca."
                />
                <div className="grid gap-4 lg:grid-cols-3">
                  <GraficoAlcance
                    dados={m.serie}
                    acumulado={acumulado}
                    onToggle={() => setAcumulado((v) => !v)}
                    aoSelecionar={(dia) => setDrill({ tipo: "dia", dia })}
                  />
                  <RadarDesempenho
                    taxas={t}
                    rxMedio={k.rxMedio}
                    taxasAnterior={ta}
                    rxMedioAnterior={ka?.rxMedio ?? null}
                    rotuloComparacao={rotuloComp}
                  />
                </div>
              </div>

              <div className="secao-entrada">
                <TituloBloco
                  titulo="Taxas de qualidade"
                  leitura="Cada barra mostra onde você está dentro da faixa saudável de mercado."
                />
                <GradeTaxas taxas={t} anterior={ta} rotuloComparacao={rotuloComp} />
              </div>
            </>
          ) : null}

          {aba === "conteudo" ? (
            <>
              <div className="secao-entrada grid gap-4 lg:grid-cols-3">
                <DonutFormatos
                  dados={m.formatos}
                  aoSelecionar={(nome) => setDrill({ tipo: "formatoNome", nome })}
                />
                <div className="grid gap-4 lg:col-span-2">
                  <BarrasDimensao
                    titulo="Desempenho por formato"
                    descricao="rx médio de cada formato — acima de 1,30× está performando."
                    itens={m.porFormato}
                    aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "format", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
                  <BarrasDimensao
                    titulo="Desempenho por gancho"
                    descricao="Qual abertura de conteúdo entrega mais alcance relativo."
                    itens={m.porGancho}
                    vazio="Nenhum post do período tem gancho classificado."
                    aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "hook", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
                </div>
              </div>

              <div className="secao-entrada grid gap-4 lg:grid-cols-2">
                <BarrasDimensao
                  titulo="Desempenho por pilar"
                  descricao="Como cada pilar editorial performa contra a mediana."
                  itens={porPilar}
                  vazio="Nenhum post do período tem pilar definido."
                  aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "pillar_id", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
                <BarrasDimensao
                  titulo="Desempenho por tema"
                  descricao="Temas recorrentes ordenados por rx médio."
                  itens={m.porTema}
                  vazio="Nenhum post do período tem tema classificado."
                  limite={8}
                  aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "theme", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
              </div>

              <div className="secao-entrada">
                <TabelaPosts
                  linhas={recorteTabela ? filtrarPorRecorte(m.linhas, recorteTabela) : m.linhas}
                  recorte={recorteTabela ? rotuloRecorte(recorteTabela) : null}
                  aoLimparRecorte={() => setRecorteTabela(null)}
                  modo={modo}
                  setModo={setModo}
                  soOutliers={soOutliers}
                  aoLimparOutliers={() => setSoOutliers((v) => !v)}
                />
              </div>
            </>
          ) : null}

          {aba === "ritmo" ? (
            m.calor.max === 0 ? (
              <div className="secao-entrada">
                <EstadoVazio
                  icone={<Clock size={16} />}
                  titulo="Ainda sem leitura de horários"
                  descricao="Precisamos de posts com data e alcance coletado para montar o mapa de calor deste período."
                  acao={
                    <button
                      type="button"
                      className="btn px-3 py-1.5 text-xs"
                      onClick={() => m.setDias(90)}
                    >
                      Ver 90 dias
                    </button>
                  }
                />
              </div>
            ) : (
              <>
                <div className="secao-entrada">
                  <MapaDeCalor
                    grade={m.calor.grade}
                    max={m.calor.max}
                    melhor={m.calor.melhor}
                    aoSelecionar={(c) => setDrill({ tipo: "calor", dia: c.dia, faixa: c.faixa })}
                  />
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
                    aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "intent", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
                </div>
              </>
            )
          ) : null}

          {aba === "contas" ? (
            m.porConta.length === 0 ? (
              <div className="secao-entrada">
                <EstadoVazio
                  icone={<Users size={16} />}
                  titulo="Nenhuma conta identificada"
                  descricao="Os posts do período não têm conta de origem registrada. Conecte ou revise as contas em Ajustes."
                  acao={
                    <Link to="/ajustes" className="btn-primario px-3 py-1.5 text-xs">
                      Abrir Ajustes › Contas
                    </Link>
                  }
                />
              </div>
            ) : (
              <div className="secao-entrada space-y-4">
                <ComparativoContas
                  contas={m.porConta}
                  aoSelecionar={(c) =>
                    setDrill({ tipo: "dimensao", dimensao: "conta", chave: c.chave, rotulo: c.rotulo })
                  }
                />
                <BarrasDimensao
                  titulo="rx médio por conta"
                  descricao="Performance relativa à mediana do formato, conta a conta."
                  itens={m.porConta}
                  vazio="Nenhuma conta identificada nos posts do período."
                  aoSelecionar={(i) =>
                      setDrill({ tipo: "dimensao", dimensao: "conta", chave: i.chave, rotulo: i.rotulo })
                    }
                  />
              </div>
            )
          ) : null}

          {aba === "benchmark" ? (
            m.baselines.length === 0 ? (
              <div className="secao-entrada">
                <EstadoVazio
                  icone={<Target size={16} />}
                  titulo="Base de comparação ainda vazia"
                  descricao="Sem medianas por formato não dá para posicionar você nas faixas de mercado. Elas aparecem depois das primeiras coletas."
                  acao={
                    <button
                      type="button"
                      className="btn px-3 py-1.5 text-xs"
                      onClick={m.atualizar}
                    >
                      Atualizar dados
                    </button>
                  }
                />
              </div>
            ) : (
              <Benchmark
                linhas={m.linhas}
                baselines={m.baselines}
                taxas={t}
                publicados={k.publicados}
                porSemana={m.cadencia.porSemana}
                porConta={m.porConta}
              />
            )
          ) : null}

          <PainelDrill
            recorte={drill}
            linhas={m.linhas}
            linhasComparadas={m.linhasComparadas}
            rotuloPeriodo={rotuloIntervalo(m.intervalo)}
            {...(rotuloComp ? { rotuloComparacao: rotuloComp } : {})}
            contas={m.contasDisponiveis}
            contaAtual={m.conta}
            aoFechar={() => setDrill(null)}
            aoVerNaTabela={verNaTabela}
          />
        </>
      )}

    </Revelar>
  );
}

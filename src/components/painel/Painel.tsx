import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, Flame, Share2, Sparkles, UserPlus } from "lucide-react";

import { Revelar } from "@/components/Revelar";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { LogoB7 } from "@/components/ui/LogoB7";
import { TooltipProvider } from "@/components/ui/tooltip";

import { JanelaPublicacao, MixDeFormatos } from "@/components/painel/BlocosAnaliticos";
import { CartaoKpiPainel } from "@/components/painel/CartaoKpiPainel";
import { DestaquesPeriodo } from "@/components/painel/DestaquesPeriodo";
import { Dica } from "@/components/painel/Dica";
import { EvolucaoAlcance } from "@/components/painel/EvolucaoAlcance";
import { Podio } from "@/components/painel/Podio";

import { usePainel, type DiasPainel } from "@/hooks/usePainel";
import { COLUNAS, comAlfa, corDoCanal, type Canal } from "@/lib/conteudo";
import { GLOSSARIO } from "@/lib/glossario";
import { numero, textoFrescor } from "@/lib/metricas";

const TZ = "America/Sao_Paulo";
const JANELAS: DiasPainel[] = [7, 14, 30, 90];

function saudacao(d: Date) {
  const hora = Number(
    new Intl.DateTimeFormat("pt-BR", { hour: "numeric", hour12: false, timeZone: TZ }).format(d),
  );
  if (hora < 12) return "Bom dia";
  if (hora < 18) return "Boa tarde";
  return "Boa noite";
}

function dataPorExtenso(d: Date) {
  return new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TZ,
  }).format(d);
}

function diaHora(iso: string) {
  return new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: TZ,
  }).format(new Date(iso));
}

function Dot({ cor, title }: { cor: string; title?: string }) {
  return (
    <span
      title={title}
      className="inline-block h-2 w-2 shrink-0 rounded-full"
      style={{ backgroundColor: cor }}
    />
  );
}

function Cartao({
  titulo,
  rodape,
  children,
}: {
  titulo: string;
  rodape?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="cartao flex flex-col p-4">
      <h2 className="rotulo mb-3">{titulo}</h2>
      <div className="flex-1 space-y-2">{children}</div>
      {rodape ? <div className="mt-3 border-t border-line pt-2 text-xs">{rodape}</div> : null}
    </div>
  );
}

function BlocoVazio({ children }: { children: string }) {
  return <EstadoVazio compacto marca={false} titulo={children} />;
}

function CartaoOperacional({
  rotulo,
  valor,
  dica,
  vazio,
}: {
  rotulo: string;
  valor: number;
  dica: string;
  vazio: string;
}) {
  return (
    <div
      className="cartao flex min-h-[4.6rem] flex-col justify-between p-3.5 transition-colors hover:bg-white/4"
      title={valor === 0 ? vazio : undefined}
    >
      <span className="rotulo flex items-center gap-1 text-[.62rem]">
        {rotulo}
        <Dica texto={dica} />
      </span>
      <span className={"numero text-xl " + (valor === 0 ? "text-muted" : "")}>{valor}</span>
    </div>
  );
}

export function Painel() {
  const [dias, setDias] = useState<DiasPainel>(7);
  const { dados, carregando, recalculando } = usePainel(dias);
  const agora = new Date();
  const primeiroNome = (dados?.nome ?? "").trim().split(/\s+/)[0] ?? "";
  const coleta = dados?.ultimaColeta ? new Date(dados.ultimaColeta).getTime() : null;

  if (carregando || !dados) {
    return (
      <Revelar className="space-y-4">
        <div className="secao-entrada esqueleto h-12 w-72 rounded" />
        <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="cartao min-h-[6.6rem] p-3.5">
              <div className="esqueleto h-3 w-20 rounded" />
              <div className="esqueleto mt-6 h-6 w-16 rounded" />
            </div>
          ))}
        </div>
        <div className="secao-entrada grid gap-3 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="cartao h-72 p-4">
              <div className="esqueleto h-3 w-28 rounded" />
            </div>
          ))}
        </div>
      </Revelar>
    );
  }

  const k = dados.kpis;
  const a = dados.anterior;
  const op = dados.operacao;

  return (
    <TooltipProvider delayDuration={200}>
      <Revelar className="space-y-4">
        <CabecalhoTela
          titulo={`${saudacao(agora)}${primeiroNome ? `, ${primeiroNome}` : ""}`}
          descricao={<span className="capitalize">{dataPorExtenso(agora)}</span>}
          acoes={
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted">{textoFrescor(coleta)}</span>
              <span aria-hidden className="hidden h-5 w-px bg-line sm:block" />
              <LogoB7 altura={20} className="hidden opacity-70 sm:block" />
            </div>
          }
        />

        <div className="secao-entrada flex flex-wrap items-center justify-between gap-2">
          <span className="text-xs text-muted">
            Todos os indicadores abaixo consideram os últimos {dias} dias, comparados com os {dias}{" "}
            dias anteriores.
          </span>
          <div className="flex items-center gap-1">
            {JANELAS.map((d) => {
              const ativo = d === dias;
              return (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDias(d)}
                  aria-pressed={ativo}
                  className={
                    "numero rounded-[.5rem] px-2.5 py-1 text-xs transition-colors " +
                    (ativo
                      ? "bg-azure/14 font-semibold text-txt"
                      : "text-muted hover:bg-white/6 hover:text-corpo")
                  }
                >
                  {d}d
                </button>
              );
            })}
          </div>
        </div>

        {/* Faixa de performance */}
        <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
          <CartaoKpiPainel
            rotulo="Alcance"
            valor={k.alcance}
            anterior={a?.alcance ?? null}
            dica={GLOSSARIO.alcancePeriodo}
            serie={dados.serie}
          />
          <CartaoKpiPainel
            rotulo="Impressões"
            valor={k.impressoes}
            anterior={a?.impressoes ?? null}
            dica="Soma das impressões da leitura mais recente de cada post do período."
          />
          <CartaoKpiPainel
            rotulo="Interações"
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
          <CartaoKpiPainel
            rotulo="Salvamentos"
            valor={k.saves}
            anterior={a?.saves ?? null}
            dica="Sinal mais forte de conteúdo de valor: quantas pessoas guardaram o post."
          />
          <CartaoKpiPainel
            rotulo="Compartilhamentos"
            valor={k.shares}
            anterior={a?.shares ?? null}
            dica="Principal motor de alcance novo no Instagram."
          />
          <CartaoKpiPainel
            rotulo="Comentários"
            valor={k.comments}
            anterior={a?.comments ?? null}
            dica="Total de comentários das leituras mais recentes do período."
          />
          <CartaoKpiPainel
            rotulo="Novos seguidores"
            valor={k.seguidores}
            anterior={a?.seguidores ?? null}
            dica="Soma do saldo de seguidores atribuído aos posts do período."
          />
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
        </div>

        {/* Operação */}
        <div className="secao-entrada grid grid-cols-2 gap-3 sm:grid-cols-4">
          <Link to="/calendario" search={{ foco: "7d", origem: "painel" }}>
            <CartaoOperacional
              rotulo="Agendados 7d"
              valor={op.agendados}
              dica={GLOSSARIO.agendados}
              vazio="Nada agendado pros próximos 7 dias"
            />
          </Link>
          <Link to="/kanban" search={{ foco: "review", origem: "painel" }}>
            <CartaoOperacional
              rotulo="Aguardando aprovação"
              valor={op.aguardandoAprovacao}
              dica={GLOSSARIO.aguardandoAprovacao}
              vazio="Nada aguardando aprovação"
            />
          </Link>
          <Link
            to="/pautas"
            search={{ q: "", status: "new", tipo: "todos", pilar: "todos", origem: "painel" }}
          >
            <CartaoOperacional
              rotulo="Pautas novas"
              valor={op.pautasNovas}
              dica={GLOSSARIO.pautasNovas}
              vazio="Nenhuma pauta aberta agora"
            />
          </Link>
          <Link to="/ajustes" search={{ secao: "contas", origem: "painel" }}>
            <CartaoOperacional
              rotulo="Contas conectadas"
              valor={op.contasConectadas}
              dica={GLOSSARIO.contasConectadas}
              vazio="Nenhuma conta conectada ainda"
            />
          </Link>
        </div>

        {/* Destaques + pódio */}
        <div className="secao-entrada space-y-3">
          {recalculando ? (
            <div className="grid gap-3 lg:grid-cols-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="cartao h-80 p-4">
                  <div className="esqueleto h-3 w-24 rounded" />
                  <div className="esqueleto mt-6 h-7 w-28 rounded" />
                </div>
              ))}
            </div>
          ) : (
            <>
              <DestaquesPeriodo destaques={dados.destaques} dias={dias} />
              <Podio contas={dados.contas} dias={dias} />
            </>
          )}
        </div>

        {/* Analítico */}
        <div className="secao-entrada grid gap-3 lg:grid-cols-3">
          <EvolucaoAlcance serie={dados.serie} />
          <MixDeFormatos mix={dados.mixFormatos} />
        </div>

        <div className="secao-entrada grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <JanelaPublicacao grade={dados.calor.grade} max={dados.calor.max} />
          </div>

          <div className="cartao p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h2 className="rotulo flex items-center gap-1.5">
                <Flame size={12} color="#f6bd24" />
                Fora da curva
                <Dica texto={`${GLOSSARIO.rx} ${GLOSSARIO.foraDaCurvaBloco}`} />
              </h2>
              <Link
                to="/metricas"
                search={{ dias, origem: "painel" }}
                className="text-xs text-azureClaro hover:underline"
              >
                ver métricas
              </Link>
            </div>
            {dados.outliers.length === 0 ? (
              <BlocoVazio>Nenhum post fora da curva nesta janela.</BlocoVazio>
            ) : (
              <div className="space-y-1">
                {dados.outliers.map((o) => (
                  <Link
                    key={o.id}
                    to="/post/$id"
                    params={{ id: o.id }}
                    search={{ origem: "painel", dias }}
                    className="flex items-center gap-2 rounded-[.5rem] px-2 py-1.5 hover:bg-white/6"
                  >
                    <span className="flex-1 truncate text-sm text-corpo">{o.title}</span>
                    <span className="shrink-0 text-xs text-muted">
                      {o.conta ? `@${o.conta}` : "—"}
                    </span>
                    <span className="pill pill-bom numero shrink-0">{numero(o.rx, 2)}×</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Operação editorial */}
        <div className="secao-entrada grid gap-3 lg:grid-cols-3">
          <Cartao titulo="Próximos agendamentos">
            {dados.agendados.length === 0 ? (
              <div className="space-y-3">
                <BlocoVazio>Nada agendado pros próximos 7 dias.</BlocoVazio>
                <Link to="/calendario" className="btn inline-block px-3 py-1.5 text-xs">
                  Abrir calendário
                </Link>
              </div>
            ) : (
              dados.agendados.map((p) => (
                <Link
                  key={p.id}
                  to="/post/$id"
                  params={{ id: p.id }}
                  search={{ origem: "painel" }}
                  className="flex items-center gap-2 rounded-[.5rem] px-2 py-1.5 hover:bg-white/6"
                >
                  <Dot cor={corDoCanal((p.channel ?? null) as Canal | null)} />
                  <span className="flex-1 truncate text-sm text-corpo">{p.title}</span>
                  {!p.aprovado ? <Dot cor="#f6bd24" title="sem aprovação" /> : null}
                  <span className="numero shrink-0 text-xs text-muted">
                    {diaHora(p.scheduled_for)}
                  </span>
                </Link>
              ))
            )}
          </Cartao>

          <Cartao
            titulo="Pautas em destaque"
            rodape={
              <Link to="/pautas" className="text-azureClaro hover:underline">
                ver todas
              </Link>
            }
          >
            {dados.pautas.length === 0 ? (
              <BlocoVazio>Sem pautas abertas — a próxima rodada é segunda.</BlocoVazio>
            ) : (
              dados.pautas.map((s) => (
                <div
                  key={s.id}
                  className="rounded-[.5rem] border-l-2 bg-white/4 p-3"
                  style={{ borderLeftColor: comAlfa("#00a4ff", 0.6) }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-1.5">
                      <Sparkles size={12} className="text-azureClaro" />
                      <span className="text-sm font-bold">{s.title}</span>
                    </div>
                    <span className="numero shrink-0 text-sm">{numero(s.priority, 0)}</span>
                  </div>
                  {s.rationale ? <p className="mt-1 text-xs text-muted">{s.rationale}</p> : null}
                </div>
              ))
            )}
          </Cartao>

          <Cartao
            titulo="O que os dados dizem"
            rodape={
              <Link to="/cerebro" className="text-azureClaro hover:underline">
                ver o cérebro
              </Link>
            }
          >
            {dados.insights.length === 0 ? (
              <BlocoVazio>
                O cérebro ainda não tem aprendizados registrados nesta organização.
              </BlocoVazio>
            ) : (
              dados.insights.map((i) => (
                <div key={i.id} className="space-y-1.5">
                  <p className="text-sm text-corpo">{i.statement}</p>
                  <div className="h-1 w-full overflow-hidden rounded-full bg-white/6">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-royal to-azure"
                      style={{ width: `${Math.max(0, Math.min(1, i.strength)) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </Cartao>
        </div>

        {/* Voz da audiência */}
        {dados.audiencia.temas.length > 0 || dados.audiencia.perguntas.length > 0 ? (
          <div className="secao-entrada grid gap-3 lg:grid-cols-2">
            <Cartao titulo="Temas mais citados (30d)">
              {dados.audiencia.temas.map((t) => (
                <div key={t.texto} className="flex items-center gap-2 text-sm text-corpo">
                  <span className="flex-1 truncate">{t.texto}</span>
                  <span className="numero text-xs text-muted">{t.n}×</span>
                </div>
              ))}
            </Cartao>
            <Cartao titulo="Perguntas mais frequentes (30d)">
              {dados.audiencia.perguntas.map((t) => (
                <div key={t.texto} className="flex items-center gap-2 text-sm text-corpo">
                  <span className="flex-1 truncate">{t.texto}</span>
                  <span className="numero text-xs text-muted">{t.n}×</span>
                </div>
              ))}
            </Cartao>
          </div>
        ) : null}

        {/* Produção */}
        <Link to="/kanban" className="secao-entrada cartao block p-4 hover:bg-white/4">
          <h2 className="rotulo mb-3 flex items-center gap-2">
            Produção agora
            <span className="inline-flex items-center gap-1 text-[.62rem] font-normal normal-case tracking-normal text-muted">
              <Bookmark size={11} /> {numero(k.saves)} salvos · <Share2 size={11} />{" "}
              {numero(k.shares)} compart. · <UserPlus size={11} /> {numero(k.seguidores)} seguidores
            </span>
          </h2>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            {COLUNAS.map((c) => (
              <span key={c.status} className="flex items-center gap-1.5 text-xs text-muted">
                <Dot cor={c.cor} />
                {c.rotulo}
                <span className="numero text-sm text-txt">{dados.producao[c.status] ?? 0}</span>
              </span>
            ))}
          </div>
        </Link>
      </Revelar>
    </TooltipProvider>
  );
}

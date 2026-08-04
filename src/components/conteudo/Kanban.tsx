import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { toastDesfazer } from "@/lib/toastDesfazer";

import { Revelar } from "@/components/Revelar";
import { MenuFiltro } from "@/components/filtros/MenuFiltro";
import { VazioFiltrado } from "@/components/filtros/VazioFiltrado";
import { CartaoPost } from "@/components/conteudo/CartaoPost";
import { KanbanEsqueleto } from "@/components/conteudo/Esqueleto";
import { NovoCardDialog } from "@/components/conteudo/NovoCardDialog";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import { usePilares, usePosts, useMoverStatus } from "@/hooks/useConteudo";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { CANAIS, COLUNAS, type Canal, type Status } from "@/lib/conteudo";


export function Kanban() {
  useRealtimePosts();
  const navigate = useNavigate();
  const { foco, origem } = useSearch({ from: "/_authenticated/kanban" });
  const { posts, carregando } = usePosts();
  const { pilares, pilarPorId } = usePilares();
  const mover = useMoverStatus();
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [verTodosPublicados, setVerTodosPublicados] = useState(false);
  const [sobre, setSobre] = useState<Status | null>(null);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [pilar, setPilar] = useState<string | null>(null);
  const [mostrarVazias, setMostrarVazias] = useState(false);

  const doPainel = origem === "painel";
  const colunaFoco = COLUNAS.find((c) => c.status === foco) ?? null;
  const refFoco = useRef<HTMLElement | null>(null);

  const [recalculando, setRecalculando] = useState(false);
  const primeiroRecorte = useRef(true);

  useEffect(() => {
    if (!carregando && colunaFoco) {
      refFoco.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [carregando, colunaFoco]);

  // Skeleton curto ao trocar o recorte de canal/pilar, pra sinalizar o recálculo das colunas.
  useEffect(() => {
    if (primeiroRecorte.current) {
      primeiroRecorte.current = false;
      return;
    }
    const semMovimento =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (semMovimento) return;

    setRecalculando(true);
    const t = window.setTimeout(() => setRecalculando(false), 320);
    return () => window.clearTimeout(t);
  }, [canal, pilar]);


  const limparRecorte = () => void navigate({ to: "/kanban", search: { foco: "", origem: "" } });

  const filtroAtivo = !!canal || !!pilar;
  const limparFiltros = () => {
    setCanal(null);
    setPilar(null);
  };

  const descricaoRecorte = useMemo(() => {
    const partes: string[] = [];
    if (canal) partes.push(`Canal ${CANAIS.find((c) => c.valor === canal)?.rotulo ?? canal}`);
    if (pilar) partes.push(`Pilar ${pilarPorId.get(pilar)?.name ?? "selecionado"}`);
    return partes.join(" · ");
  }, [canal, pilar, pilarPorId]);

  const filtrados = useMemo(
    () =>
      posts.filter(
        (p) => (!canal || p.channel === canal) && (!pilar || p.pillar_id === pilar),
      ),
    [posts, canal, pilar],
  );

  const porStatus = useMemo(() => {
    const mapa = new Map<Status, typeof posts>();
    for (const c of COLUNAS) mapa.set(c.status, []);
    for (const p of filtrados) mapa.get(p.status)?.push(p);
    mapa.set(
      "published",
      [...(mapa.get("published") ?? [])].sort(
        (a, b) =>
          new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
      ),
    );
    return mapa;
  }, [filtrados]);

  const totalPorStatus = useMemo(() => {
    const mapa = new Map<Status, number>();
    for (const c of COLUNAS) mapa.set(c.status, 0);
    for (const p of posts) mapa.set(p.status, (mapa.get(p.status) ?? 0) + 1);
    return mapa;
  }, [posts]);


  const colunasVazias = filtroAtivo
    ? COLUNAS.filter((c) => (porStatus.get(c.status) ?? []).length === 0).length
    : 0;
  const nadaNoFiltro = !carregando && filtroAtivo && filtrados.length === 0;
  const trabalhoVazio =
    !filtroAtivo && COLUNAS.slice(0, 6).every((c) => (porStatus.get(c.status) ?? []).length === 0);
  const focoVazio =
    !!colunaFoco &&
    !carregando &&
    !nadaNoFiltro &&
    (porStatus.get(colunaFoco.status) ?? []).length === 0;



  async function soltar(status: Status, e: React.DragEvent) {
    e.preventDefault();
    setSobre(null);
    const id = e.dataTransfer.getData("text/post-id");
    if (!id) return;
    const atual = posts.find((p) => p.id === id);
    if (!atual || atual.status === status) return;

    try {
      const r = await mover.mutateAsync({ id, status });
      if (!r.ok) {
        toast("Este post ainda não foi aprovado", {
          style: {
            background: "rgba(246, 189, 36, 0.12)",
            border: "1px solid rgba(246, 189, 36, 0.35)",
            color: "#f6bd24",
          },
        });
        return;
      }
      const rotulo = COLUNAS.find((c) => c.status === status)?.rotulo ?? "etapa";
      const anterior = atual.status;
      toastDesfazer(`Movido para ${rotulo}`, async () => {
        try {
          const volta = await mover.mutateAsync({ id, status: anterior });
          if (!volta.ok) {
            toast.error("Não foi possível desfazer");
            return;
          }
          toast("Movimento desfeito");
        } catch {
          toast.error("Não foi possível desfazer");
        }
      });
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar");
    }
  }

  if (carregando && (doPainel || colunaFoco)) {
    return (
      <Revelar className="space-y-4">
        {doPainel ? (
          <FaixaDeContexto
            recorte={colunaFoco ? `coluna ${colunaFoco.rotulo}` : "fluxo de produção"}
            onLimpar={limparRecorte}
          />
        ) : null}
        <div className="secao-entrada">
          <KanbanEsqueleto colunas={[...COLUNAS]} foco={colunaFoco?.status ?? null} />
        </div>
      </Revelar>
    );
  }

  return (
    <Revelar className="space-y-4">
      {doPainel ? (
        <FaixaDeContexto
          recorte={colunaFoco ? `coluna ${colunaFoco.rotulo}` : "fluxo de produção"}
          onLimpar={limparRecorte}
        />
      ) : null}

      <div className="secao-entrada flex flex-wrap items-center gap-2">
        <p className="text-sm text-muted">
          {carregando
            ? "Carregando…"
            : recalculando
              ? "Recalculando o recorte…"
              : filtroAtivo
                ? `${filtrados.length} de ${posts.length} cards · ${descricaoRecorte}`
                : `${posts.length} cards no fluxo`}
        </p>


        {filtroAtivo && !carregando ? (
          <button className="btn px-2.5 py-1 text-xs" onClick={limparFiltros}>
            limpar filtros
          </button>
        ) : null}

        {filtroAtivo && !carregando && colunasVazias > 0 ? (
          <button
            className="btn px-2.5 py-1 text-xs"
            onClick={() => setMostrarVazias((v) => !v)}
          >
            {mostrarVazias
              ? `ocultar ${colunasVazias} colunas vazias`
              : `mostrar ${colunasVazias} colunas vazias`}
          </button>
        ) : null}



        <MenuFiltro
          rotulo="Canal"
          valor={canal ?? "todos"}
          padrao="todos"
          largura="w-52"
          opcoes={[
            { valor: "todos", rotulo: "Todos os canais" },
            ...CANAIS.map((c) => ({ valor: c.valor, rotulo: c.rotulo })),
          ]}
          onEscolher={(v) => setCanal(v === "todos" ? null : (v as Canal))}
        />

        <MenuFiltro
          rotulo="Pilar"
          valor={pilar ?? "todos"}
          padrao="todos"
          largura="w-60"
          opcoes={[
            { valor: "todos", rotulo: "Todos os pilares" },
            ...pilares.map((p) => ({ valor: p.id, rotulo: p.name, cor: p.color })),
          ]}
          onEscolher={(v) => setPilar(v === "todos" ? null : v)}
        />

        <button className="btn-primario ml-auto" onClick={() => setAbrirNovo(true)}>
          <Plus size={15} /> Novo card
        </button>
      </div>


      {recalculando ? (
        <div className="secao-entrada">
          <KanbanEsqueleto
            colunas={
              filtroAtivo && !mostrarVazias
                ? COLUNAS.filter(
                    (c) =>
                      (porStatus.get(c.status) ?? []).length > 0 ||
                      colunaFoco?.status === c.status,
                  )
                : [...COLUNAS]
            }
            foco={colunaFoco?.status ?? null}
          />
        </div>
      ) : (
        <>
      {nadaNoFiltro && (

        <VazioFiltrado
          mensagem="Nenhum card corresponde ao filtro."
          detalhe={descricaoRecorte}
          acao="limpar filtros"
          onAcao={limparFiltros}
        />
      )}

      {focoVazio && (
        <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted">
            {filtroAtivo
              ? `Nenhum post na coluna ${colunaFoco?.rotulo} com o filtro aplicado.`
              : colunaFoco?.status === "review"
                ? "Nenhum post aguardando aprovação."
                : `Nenhum post na coluna ${colunaFoco?.rotulo}.`}
          </p>
          {filtroAtivo ? <p className="text-xs text-muted/80">{descricaoRecorte}</p> : null}
          <div className="flex flex-wrap justify-center gap-2">
            {filtroAtivo ? (
              <button className="btn px-3 py-1.5 text-xs" onClick={limparFiltros}>
                limpar filtros
              </button>
            ) : null}
            <button className="btn px-3 py-1.5 text-xs" onClick={limparRecorte}>
              ver todo o fluxo
            </button>
          </div>
        </div>
      )}

      {trabalhoVazio && !carregando && !focoVazio && (
        <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted">Nenhuma ideia por aqui. Peça pautas ao cérebro.</p>
          <button className="btn-primario" onClick={() => void navigate({ to: "/pautas" })}>
            Gerar pautas
          </button>
        </div>
      )}


      <div className="secao-entrada flex gap-3 overflow-x-auto pb-2">

        {COLUNAS.map((coluna) => {
          const todos = porStatus.get(coluna.status) ?? [];
          const total = totalPorStatus.get(coluna.status) ?? 0;
          const publicado = coluna.status === "published";
          const lista = publicado && !verTodosPublicados ? todos.slice(0, 10) : todos;

          const emFoco = colunaFoco?.status === coluna.status;
          const apagada = filtroAtivo && todos.length === 0;

          if (apagada && !mostrarVazias && !emFoco) return null;

          return (
            <section
              key={coluna.status}
              ref={emFoco ? refFoco : undefined}
              onDragOver={(e) => {
                e.preventDefault();
                setSobre(coluna.status);
              }}
              onDragLeave={() => setSobre((s) => (s === coluna.status ? null : s))}
              onDrop={(e) => void soltar(coluna.status, e)}
              className={
                "w-[272px] shrink-0 self-start rounded-xl bg-bg2 p-3 transition-colors " +
                (sobre === coluna.status ? "ring-1 ring-azure/50 " : "") +
                (emFoco ? "ring-1 ring-azure/40 " : "") +
                (apagada ? "opacity-45" : "")
              }
            >

              <header className="mb-3 flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: coluna.cor }}
                />
                <span className="rotulo flex-1">{coluna.rotulo}</span>
                <span className="numero text-xs text-muted">
                  {filtroAtivo ? `${todos.length} de ${total}` : total}
                </span>
              </header>

              {apagada ? (
                <p className="py-2 text-xs text-muted">sem cards neste recorte</p>
              ) : (
                <div className="flex flex-col gap-[10px]">
                  {lista.map((p) => (
                    <CartaoPost
                      key={p.id}
                      post={p}
                      pilar={p.pillar_id ? pilarPorId.get(p.pillar_id) : undefined}
                      onDragStart={(e) => e.dataTransfer.setData("text/post-id", p.id)}
                      onClick={() => void navigate({ to: "/post/$id", params: { id: p.id }, search: { origem: "kanban" } })}
                    />
                  ))}

                  {publicado && todos.length > 10 && (
                    <button
                      className="btn justify-center"
                      onClick={() => setVerTodosPublicados((v) => !v)}
                    >
                      {verTodosPublicados ? "Mostrar menos" : `Ver todos (${todos.length})`}
                    </button>
                  )}
                </div>
              )}

            </section>
          );
        })}
      </div>
        </>
      )}


      <NovoCardDialog aberto={abrirNovo} aoFechar={() => setAbrirNovo(false)} />
    </Revelar>
  );
}

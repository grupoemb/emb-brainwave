import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { toast } from "sonner";

import { toastDesfazer } from "@/lib/toastDesfazer";

import { Revelar } from "@/components/Revelar";
import { CartaoPost } from "@/components/conteudo/CartaoPost";
import { KanbanEsqueleto } from "@/components/conteudo/Esqueleto";
import { NovoCardDialog } from "@/components/conteudo/NovoCardDialog";
import { FaixaDeContexto } from "@/components/painel/FaixaDeContexto";
import { usePilares, usePosts, useMoverStatus } from "@/hooks/useConteudo";
import { useRealtimePosts } from "@/hooks/useRealtimePosts";
import { COLUNAS, type Status } from "@/lib/conteudo";

export function Kanban() {
  useRealtimePosts();
  const navigate = useNavigate();
  const { foco, origem } = useSearch({ from: "/_authenticated/kanban" });
  const { posts, carregando } = usePosts();
  const { pilarPorId } = usePilares();
  const mover = useMoverStatus();
  const [abrirNovo, setAbrirNovo] = useState(false);
  const [verTodosPublicados, setVerTodosPublicados] = useState(false);
  const [sobre, setSobre] = useState<Status | null>(null);

  const doPainel = origem === "painel";
  const colunaFoco = COLUNAS.find((c) => c.status === foco) ?? null;
  const refFoco = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!carregando && colunaFoco) {
      refFoco.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }
  }, [carregando, colunaFoco]);

  const limparRecorte = () => void navigate({ to: "/kanban", search: { foco: "", origem: "" } });

  const porStatus = useMemo(() => {
    const mapa = new Map<Status, typeof posts>();
    for (const c of COLUNAS) mapa.set(c.status, []);
    for (const p of posts) mapa.get(p.status)?.push(p);
    mapa.set(
      "published",
      [...(mapa.get("published") ?? [])].sort(
        (a, b) =>
          new Date(b.published_at ?? 0).getTime() - new Date(a.published_at ?? 0).getTime(),
      ),
    );
    return mapa;
  }, [posts]);

  const trabalhoVazio = COLUNAS.slice(0, 6).every((c) => (porStatus.get(c.status) ?? []).length === 0);
  const focoVazio =
    !!colunaFoco && !carregando && (porStatus.get(colunaFoco.status) ?? []).length === 0;


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

      <div className="secao-entrada flex items-center justify-between">
        <p className="text-sm text-muted">
          {carregando ? "Carregando…" : `${posts.length} cards no fluxo`}
        </p>
        <button className="btn-primario" onClick={() => setAbrirNovo(true)}>
          <Plus size={15} /> Novo card
        </button>
      </div>

      {focoVazio && (
        <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
          <p className="text-sm text-muted">
            {colunaFoco?.status === "review"
              ? "Nenhum post aguardando aprovação."
              : `Nenhum post na coluna ${colunaFoco?.rotulo}.`}
          </p>
          <button className="btn px-3 py-1.5 text-xs" onClick={limparRecorte}>
            ver todo o fluxo
          </button>
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
          const publicado = coluna.status === "published";
          const lista = publicado && !verTodosPublicados ? todos.slice(0, 10) : todos;

          const emFoco = colunaFoco?.status === coluna.status;

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
                "w-[272px] shrink-0 rounded-xl bg-bg2 p-3 transition-colors " +
                (sobre === coluna.status ? "ring-1 ring-azure/50 " : "") +
                (emFoco ? "ring-1 ring-azure/40" : "")
              }
            >

              <header className="mb-3 flex items-center gap-2">
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ background: coluna.cor }}
                />
                <span className="rotulo flex-1">{coluna.rotulo}</span>
                <span className="numero text-xs text-muted">{todos.length}</span>
              </header>

              <div className="flex flex-col gap-[10px]">
                {lista.map((p) => (
                  <CartaoPost
                    key={p.id}
                    post={p}
                    pilar={p.pillar_id ? pilarPorId.get(p.pillar_id) : undefined}
                    onDragStart={(e) => e.dataTransfer.setData("text/post-id", p.id)}
                    onClick={() => void navigate({ to: "/post/$id", params: { id: p.id } })}
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
            </section>
          );
        })}
      </div>

      <NovoCardDialog aberto={abrirNovo} aoFechar={() => setAbrirNovo(false)} />
    </Revelar>
  );
}

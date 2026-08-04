import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Instagram, Linkedin, Music2, Youtube } from "lucide-react";
import { toast } from "sonner";

import { Revelar } from "@/components/Revelar";
import { Frescor } from "@/components/conteudo/Frescor";
import { MidiaPost } from "@/components/conteudo/MidiaPost";
import { LateralPost } from "@/components/conteudo/LateralPost";
import { TrilhaPost } from "@/components/conteudo/TrilhaPost";
import { PostDetalheEsqueleto } from "@/components/conteudo/Esqueleto";
import { usePilares } from "@/hooks/useConteudo";
import {
  usePost,
  useSalvarPost,
  useCriarVersao,
  useVersoes,
  useAutosave,
  type CamposPost,
} from "@/hooks/usePost";
import {
  CANAIS,
  COLUNAS,
  FORMATOS,
  ROTULO_STATUS,
  comAlfa,
  type Canal,
} from "@/lib/conteudo";

const HOOKS: { valor: string; rotulo: string }[] = [
  { valor: "question", rotulo: "Pergunta" },
  { valor: "bold_claim", rotulo: "Afirmação forte" },
  { valor: "story", rotulo: "História" },
  { valor: "stat", rotulo: "Dado" },
  { valor: "contrarian", rotulo: "Contraintuitivo" },
  { valor: "list", rotulo: "Lista" },
  { valor: "news", rotulo: "Notícia" },
  { valor: "how_to", rotulo: "Passo a passo" },
  { valor: "other", rotulo: "Outro" },
];

/** ISO -> valor de datetime-local no fuso America/Sao_Paulo (UTC-3). */
function paraInputSP(iso: string | null) {
  if (!iso) return "";
  return new Date(new Date(iso).getTime() - 3 * 3600_000).toISOString().slice(0, 16);
}

function deInputSP(valor: string) {
  if (!valor) return null;
  return new Date(`${valor}:00-03:00`).toISOString();
}

function IconeCanal({ canal }: { canal: Canal | null }) {
  const props = { size: 15, className: "text-muted shrink-0" } as const;
  if (canal === "instagram") return <Instagram {...props} />;
  if (canal === "linkedin") return <Linkedin {...props} />;
  if (canal === "youtube") return <Youtube {...props} />;
  if (canal === "tiktok") return <Music2 {...props} />;
  return null;
}

const CAMPO =
  "w-full rounded-[.55rem] border border-line bg-card2 px-3 py-2 text-sm text-corpo outline-none disabled:opacity-50";

export function PostDetalhe({ id }: { id: string }) {
  const { post, carregando } = usePost(id);
  const { pilares } = usePilares();
  const salvar = useSalvarPost(id);
  const versao = useCriarVersao(id);
  const { versoes } = useVersoes(id);

  const [titulo, setTitulo] = useState("");
  const [corpo, setCorpo] = useState("");
  const [corpoSalvo, setCorpoSalvo] = useState("");

  const { agendar, descarregar, salvando, salvoEm } = useAutosave(async (campos: CamposPost) => {
    await salvar.mutateAsync(campos);
    if (campos.body !== undefined) await talvezSnapshot(campos.body ?? "");
  });

  useEffect(() => {
    if (!post) return;
    setTitulo(post.title);
    setCorpo(post.body ?? "");
    setCorpoSalvo(post.body ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post?.id]);

  async function talvezSnapshot(novoCorpo: string) {
    if (novoCorpo === corpoSalvo) return;
    setCorpoSalvo(novoCorpo);
    const ultima = versoes[0];
    const idade = ultima ? Date.now() - new Date(ultima.created_at).getTime() : Infinity;
    if (idade > 3 * 60_000) {
      try {
        await versao.mutateAsync(novoCorpo);
      } catch {
        /* snapshot é best-effort */
      }
    }
  }

  if (carregando) {
    return <PostDetalheEsqueleto />;
  }

  if (!post) {
    return (
      <div className="cartao p-6" style={{ borderLeft: "4px solid #ff7a6b" }}>
        <h1 className="text-lg font-bold">Post não encontrado</h1>
        <p className="mt-1 text-sm text-muted">
          Ele pode ter sido removido ou pertence a outra organização.
        </p>
        <Link to="/kanban" className="btn mt-3 inline-flex">
          Voltar ao Kanban
        </Link>
      </div>
    );
  }

  const importado = post.status === "published" && !!post.source_handle;
  const bloqueado = importado;
  const cor = COLUNAS.find((c) => c.status === post.status)?.cor ?? "#8294ab";

  async function salvarVersaoAgora() {
    await descarregar();
    try {
      await versao.mutateAsync(corpo);
      setCorpoSalvo(corpo);
      toast.success("Versão salva");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível salvar a versão");
    }
  }

  async function restaurar(texto: string | null, numero: number) {
    try {
      await salvar.mutateAsync({ body: texto ?? "" });
      await versao.mutateAsync(texto ?? "");
      setCorpo(texto ?? "");
      setCorpoSalvo(texto ?? "");
      toast.success(`Versão v${numero} restaurada`);
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível restaurar");
    }
  }

  return (
    <Revelar className="grid gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        <TrilhaPost />
        <header className="cartao secao-entrada flex flex-wrap items-center gap-3 p-4">

          <IconeCanal canal={post.channel} />
          <input
            value={titulo}
            disabled={bloqueado}
            onChange={(e) => {
              setTitulo(e.target.value);
              agendar({ title: e.target.value });
            }}
            className="min-w-[12rem] flex-1 bg-transparent text-lg font-bold outline-none disabled:opacity-70"
            aria-label="Título do post"
          />
          <span
            className="pill"
            style={{ color: cor, background: comAlfa(cor, 0.14) }}
          >
            {ROTULO_STATUS[post.status]}
          </span>
          <Frescor salvando={salvando} salvoEm={salvoEm} />
        </header>

        {importado && (
          <p className="cartao secao-entrada px-4 py-2 text-xs text-muted">
            Post publicado — importado do Instagram
          </p>
        )}

        <section className="cartao secao-entrada space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="rotulo">Corpo</span>
            {!bloqueado && (
              <button className="btn" onClick={() => void salvarVersaoAgora()}>
                Salvar versão
              </button>
            )}
          </div>
          <textarea
            value={corpo}
            disabled={bloqueado}
            rows={14}
            onChange={(e) => {
              setCorpo(e.target.value);
              agendar({ body: e.target.value });
            }}
            className={CAMPO + " resize-y leading-relaxed"}
            placeholder="Escreva o conteúdo do post…"
          />
        </section>

        <section className="cartao secao-entrada grid gap-3 p-4 md:grid-cols-2">
          <label className="block">
            <span className="rotulo mb-1 block">Canal</span>
            <select
              className={CAMPO}
              disabled={bloqueado}
              defaultValue={post.channel ?? ""}
              onChange={(e) => agendar({ channel: e.target.value || null })}
            >
              <option value="">—</option>
              {CANAIS.map((c) => (
                <option key={c.valor} value={c.valor}>
                  {c.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="rotulo mb-1 block">Formato</span>
            <select
              className={CAMPO}
              disabled={bloqueado}
              defaultValue={post.format ?? ""}
              onChange={(e) => agendar({ format: e.target.value || null })}
            >
              <option value="">—</option>
              {FORMATOS.map((f) => (
                <option key={f.valor} value={f.valor}>
                  {f.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="rotulo mb-1 block">Gancho</span>
            <select
              className={CAMPO}
              defaultValue={post.hook ?? ""}
              onChange={(e) => agendar({ hook: e.target.value || null })}
            >
              <option value="">—</option>
              {HOOKS.map((h) => (
                <option key={h.valor} value={h.valor}>
                  {h.rotulo}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="rotulo mb-1 flex items-center gap-1.5">
              Pilar
              {(() => {
                const atual = pilares.find((p) => p.id === post.pillar_id);
                return atual ? (
                  <span
                    className="h-2 w-2 rounded-full"
                    style={{ background: atual.color || "#8294ab" }}
                  />
                ) : null;
              })()}
            </span>
            <select
              className={CAMPO}
              defaultValue={post.pillar_id ?? ""}
              onChange={(e) => agendar({ pillar_id: e.target.value || null })}
            >
              <option value="">—</option>
              {pilares.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="rotulo mb-1 block">Agendamento</span>
            <input
              type="datetime-local"
              className={CAMPO}
              disabled={bloqueado}
              defaultValue={paraInputSP(post.scheduled_for)}
              onChange={(e) => agendar({ scheduled_for: deInputSP(e.target.value) })}
            />
          </label>

          <label className="block">
            <span className="rotulo mb-1 block">CTA</span>
            <input
              className={CAMPO}
              disabled={bloqueado}
              defaultValue={post.cta ?? ""}
              onChange={(e) => agendar({ cta: e.target.value || null })}
              placeholder="Chamada para ação"
            />
          </label>
        </section>

        <MidiaPost
          postId={post.id}
          organizationId={post.organization_id}
          somenteLeitura={bloqueado}
        />
      </div>

      <LateralPost postId={post.id} aoRestaurar={restaurar} />
    </Revelar>
  );
}

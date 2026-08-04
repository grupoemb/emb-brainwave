import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Loader2, Sparkles } from "lucide-react";
import Markdown from "react-markdown";
import { toast } from "sonner";

import { Revelar } from "@/components/Revelar";
import { supabase } from "@/integrations/supabase/client";
import { salvarPostGerado } from "@/lib/conteudo.functions";
import { useOrg } from "@/hooks/useOrg";
import type { Formato } from "@/lib/conteudo";

type Tipo = "carousel" | "headline" | "news_card" | "caption" | "improvement";

const TIPOS: { valor: Tipo; rotulo: string; formato: Formato | null }[] = [
  { valor: "carousel", rotulo: "Carrossel", formato: "carousel" },
  { valor: "headline", rotulo: "Headlines", formato: "text" },
  { valor: "news_card", rotulo: "Card de notícia", formato: "image" },
  { valor: "caption", rotulo: "Legenda", formato: "text" },
  { valor: "improvement", rotulo: "Diagnóstico", formato: null },
];

type Geracao = { id: string; tipo: Tipo; texto: string; hora: string };

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
        (ativo
          ? "border-azure/40 bg-azure/14 font-semibold text-txt"
          : "border-line text-muted hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

function EsqueletoResultado() {
  return (
    <div className="cartao animate-pulse space-y-3 p-4">
      <div className="h-4 w-1/3 rounded bg-white/6" />
      <div className="h-3 w-full rounded bg-white/6" />
      <div className="h-3 w-11/12 rounded bg-white/6" />
      <div className="h-3 w-4/5 rounded bg-white/6" />
      <div className="h-3 w-full rounded bg-white/6" />
      <div className="h-3 w-2/3 rounded bg-white/6" />
    </div>
  );
}

function extrairTexto(payload: unknown): string {
  if (typeof payload === "string") return payload;
  if (payload && typeof payload === "object") {
    const o = payload as Record<string, unknown>;
    for (const chave of ["result", "text", "content", "output", "message", "data"]) {
      const v = o[chave];
      if (typeof v === "string" && v.trim()) return v;
    }
  }
  return "";
}

function tituloDe(texto: string, brief: string) {
  const primeira = texto
    .split("\n")
    .map((l) => l.replace(/^[#>*\-\s]+/, "").trim())
    .find((l) => l.length > 0);
  const base = primeira || brief;
  return base.slice(0, 200) || "Novo post";
}

export function Estudio() {
  const { organizationId } = useOrg();
  const navigate = useNavigate();

  const [tipo, setTipo] = useState<Tipo>("carousel");
  const [brief, setBrief] = useState("");
  const [resultado, setResultado] = useState<string>("");
  const [semChave, setSemChave] = useState(false);
  const [historico, setHistorico] = useState<Geracao[]>([]);

  const salvar = useServerFn(salvarPostGerado);

  const gerar = useMutation({
    mutationFn: async (textoBrief: string) => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const { data, error } = await supabase.functions.invoke("generate", {
        body: { organization_id: organizationId, kind: tipo, brief: textoBrief },
      });
      if (error) {
        const status = (error as { context?: { status?: number } }).context?.status;
        let mensagem = error.message || "Falha ao gerar.";
        const corpo = (error as { context?: Response }).context;
        if (corpo && typeof corpo.text === "function") {
          try {
            const bruto = await corpo.clone().text();
            const json = JSON.parse(bruto) as { error?: string; message?: string };
            mensagem = json.error || json.message || bruto || mensagem;
          } catch {
            /* mantém a mensagem original */
          }
        }
        throw Object.assign(new Error(mensagem), { status });
      }
      const texto = extrairTexto(data);
      if (!texto.trim()) throw new Error("A IA não retornou conteúdo.");
      return texto;
    },
    onMutate: () => setSemChave(false),
    onSuccess: (texto) => {
      setResultado(texto);
      setHistorico((h) => [
        {
          id: crypto.randomUUID(),
          tipo,
          texto,
          hora: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }),
        },
        ...h,
      ]);
    },
    onError: (erro: Error & { status?: number }) => {
      if (erro.status === 503) {
        setSemChave(true);
        return;
      }
      toast.error(erro.message);
    },
  });

  const salvarPost = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const formato = TIPOS.find((t) => t.valor === tipo)?.formato ?? null;
      return salvar({
        data: {
          organizationId,
          title: tituloDe(resultado, brief),
          body: resultado,
          format: formato,
        },
      });
    },
    onSuccess: ({ id }) => {
      toast.success("Post salvo como roteiro.");
      navigate({ to: "/post/$id", params: { id } });
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  const podeGerar = brief.trim().length > 0 && !gerar.isPending && !!organizationId;

  const rotuloTipo = useMemo(
    () => (t: Tipo) => TIPOS.find((x) => x.valor === t)?.rotulo ?? t,
    [],
  );

  return (
    <Revelar className="space-y-4">
      <h1 className="secao-entrada text-lg font-bold">Criar</h1>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="secao-entrada cartao space-y-3 p-4">
            <p className="rotulo">Tipo de peça</p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {TIPOS.map((t) => (
                <Chip key={t.valor} ativo={tipo === t.valor} onClick={() => setTipo(t.valor)}>
                  {t.rotulo}
                </Chip>
              ))}
            </div>

            <textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              rows={6}
              placeholder="Descreva o tema, a notícia ou o post que quer melhorar…"
              className="w-full resize-y rounded-[.55rem] border border-line bg-bg2 px-3 py-2.5 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none focus:ring-2 focus:ring-azure/40"
            />

            <div className="flex justify-end">
              <button
                type="button"
                className="btn-primario disabled:opacity-60"
                disabled={!podeGerar}
                onClick={() => gerar.mutate(brief.trim())}
              >
                {gerar.isPending ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Sparkles size={15} />
                )}
                Gerar
              </button>
            </div>
          </div>

          {semChave && (
            <div
              className="secao-entrada cartao p-4 text-sm text-corpo"
              style={{ borderLeft: "4px solid #ff7a6b" }}
            >
              A chave da IA ainda não foi configurada.
            </div>
          )}

          {gerar.isPending ? (
            <div className="secao-entrada">
              <EsqueletoResultado />
            </div>
          ) : resultado ? (
            <div className="secao-entrada space-y-3">
              <div className="cartao p-4">
                <div className="prosa">
                  <Markdown>{resultado}</Markdown>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="btn-primario disabled:opacity-60"
                  disabled={salvarPost.isPending}
                  onClick={() => salvarPost.mutate()}
                >
                  {salvarPost.isPending && <Loader2 size={15} className="animate-spin" />}
                  Salvar como post
                </button>
                <button
                  type="button"
                  className="btn"
                  disabled={gerar.isPending || !brief.trim()}
                  onClick={() =>
                    gerar.mutate(`Gere uma variação diferente da anterior: ${brief.trim()}`)
                  }
                >
                  Gerar variação
                </button>
              </div>
            </div>
          ) : (
            <div className="secao-entrada cartao p-8 text-sm text-muted">
              O resultado da geração aparece aqui.
            </div>
          )}
        </div>

        <div className="secao-entrada cartao h-fit space-y-2 p-4">
          <p className="rotulo">Histórico da sessão</p>
          {historico.length === 0 ? (
            <p className="text-sm text-muted">Nada gerado ainda nesta sessão.</p>
          ) : (
            historico.map((g) => (
              <button
                key={g.id}
                type="button"
                onClick={() => setResultado(g.texto)}
                className="w-full rounded-[.6rem] border border-line bg-card2 p-3.5 text-left transition-colors hover:bg-white/6"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="pill bg-azure/14 text-azureClaro">{rotuloTipo(g.tipo)}</span>
                  <span className="numero text-[.7rem] text-muted">{g.hora}</span>
                </div>
                <p className="mt-1.5 line-clamp-2 text-xs text-corpo">
                  {g.texto.replace(/[#*`>\-]/g, " ").trim().slice(0, 120)}
                </p>
              </button>
            ))
          )}
        </div>
      </div>
    </Revelar>
  );
}

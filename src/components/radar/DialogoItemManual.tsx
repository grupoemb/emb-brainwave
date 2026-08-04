import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, X } from "lucide-react";
import { toast } from "sonner";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useOrg } from "@/hooks/useOrg";
import { supabase } from "@/integrations/supabase/client";
import { FAIXAS_DURACAO } from "@/lib/biblioteca";

const campo =
  "w-full rounded-[.55rem] border border-line bg-bg2 px-3 py-2 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none focus:ring-2 focus:ring-azure/40";

function Rotulo({ children }: { children: React.ReactNode }) {
  return <span className="rotulo mb-1.5 block">{children}</span>;
}

export function DialogoItemManual({
  aberto,
  aoFechar,
  urlInicial = "",
}: {
  aberto: boolean;
  aoFechar: () => void;
  urlInicial?: string;
}) {
  const { organizationId } = useOrg();
  const qc = useQueryClient();

  const [url, setUrl] = useState(urlInicial);
  const [perfil, setPerfil] = useState("");
  const [nicho, setNicho] = useState("");
  const [faixa, setFaixa] = useState<string>("");
  const [views, setViews] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagAtual, setTagAtual] = useState("");
  const [caption, setCaption] = useState("");
  const [note, setNote] = useState("");

  function limpar() {
    setUrl("");
    setPerfil("");
    setNicho("");
    setFaixa("");
    setViews("");
    setTags([]);
    setTagAtual("");
    setCaption("");
    setNote("");
  }

  function adicionarTag() {
    const t = tagAtual.trim().replace(/^#/, "");
    if (!t || tags.includes(t)) return setTagAtual("");
    setTags((v) => [...v, t]);
    setTagAtual("");
  }

  const salvar = useMutation({
    mutationFn: async () => {
      if (!organizationId) throw new Error("Organização não encontrada.");
      const segundos = FAIXAS_DURACAO.find((f) => f.valor === faixa)?.segundos ?? null;
      const vistas = views.replace(/\D/g, "");
      const { error } = await supabase.functions.invoke("library_add", {
        body: {
          organization_id: organizationId,
          url: url.trim(),
          creator_handle: perfil.trim().replace(/^@/, "") || null,
          niche: nicho.trim() || null,
          duration_s: segundos,
          views: vistas ? Number(vistas) : null,
          tags,
          note: note.trim() || null,
          source: "competitor",
          caption: caption.trim() || null,
        },
      });
      if (error) throw new Error(error.message || "Falha ao adicionar o item.");
    },
    onSuccess: () => {
      toast.success("Item enviado para a biblioteca — a análise roda em seguida.");
      void qc.invalidateQueries({ queryKey: ["biblioteca"] });
      void qc.invalidateQueries({ queryKey: ["biblioteca-insights"] });
      limpar();
      aoFechar();
    },
    onError: (erro: Error) => toast.error(erro.message),
  });

  return (
    <Dialog open={aberto} onOpenChange={(v) => (!v && !salvar.isPending ? aoFechar() : null)}>
      <DialogContent className="max-h-[90vh] overflow-y-auto border-line bg-card sm:max-w-[34rem]">
        <DialogHeader>
          <DialogTitle className="text-base">Adicionar item manual</DialogTitle>
          <DialogDescription className="text-xs text-muted">
            Cole o link do reel e o que der pra preencher. A legenda é o que a IA analisa.
          </DialogDescription>
        </DialogHeader>

        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (!url.trim()) return toast.error("O link do reel é obrigatório.");
            salvar.mutate();
          }}
        >
          <label className="block">
            <Rotulo>Link do reel *</Rotulo>
            <input
              className={campo}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://instagram.com/reel/…"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <Rotulo>Perfil</Rotulo>
              <input
                className={campo}
                value={perfil}
                onChange={(e) => setPerfil(e.target.value)}
                placeholder="@perfil"
              />
            </label>
            <label className="block">
              <Rotulo>Nicho</Rotulo>
              <input
                className={campo}
                value={nicho}
                onChange={(e) => setNicho(e.target.value)}
                placeholder="fitness, finanças…"
              />
            </label>
            <label className="block">
              <Rotulo>Faixa de duração</Rotulo>
              <select className={campo} value={faixa} onChange={(e) => setFaixa(e.target.value)}>
                {FAIXAS_DURACAO.map((f) => (
                  <option key={f.rotulo} value={f.valor}>
                    {f.rotulo}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <Rotulo>Views</Rotulo>
              <input
                className={campo + " numero"}
                inputMode="numeric"
                value={views}
                onChange={(e) => setViews(e.target.value)}
                placeholder="120000"
              />
            </label>
          </div>

          <div>
            <Rotulo>Tags</Rotulo>
            <div className="flex flex-wrap items-center gap-1.5">
              {tags.map((t) => (
                <span key={t} className="pill flex items-center gap-1 bg-white/6 text-corpo">
                  {t}
                  <button
                    type="button"
                    aria-label={`Remover ${t}`}
                    onClick={() => setTags((v) => v.filter((x) => x !== t))}
                  >
                    <X size={11} />
                  </button>
                </span>
              ))}
              <input
                className={campo + " mt-1"}
                value={tagAtual}
                onChange={(e) => setTagAtual(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === ",") {
                    e.preventDefault();
                    adicionarTag();
                  }
                }}
                onBlur={adicionarTag}
                placeholder="digite e aperte Enter"
              />
            </div>
          </div>

          <label className="block">
            <Rotulo>Legenda / observação do reel</Rotulo>
            <textarea
              className={campo + " resize-y"}
              rows={4}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Cole aqui a legenda do reel — é o que a IA vai analisar."
            />
          </label>

          <label className="block">
            <Rotulo>Nota interna</Rotulo>
            <input
              className={campo}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="por que vale estudar"
            />
          </label>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              className="btn px-3 py-1.5 text-xs"
              onClick={aoFechar}
              disabled={salvar.isPending}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-primario flex items-center gap-2 px-3 py-1.5 text-xs disabled:opacity-60"
              disabled={salvar.isPending}
            >
              {salvar.isPending ? <Loader2 size={13} className="animate-spin" /> : null}
              Salvar na biblioteca
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useRef, useState } from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";
import { toast } from "sonner";

import { supabase } from "@/integrations/supabase/client";
import { useAssets, useAssetsMutations } from "@/hooks/usePost";

function tipoDoMime(mime: string): "image" | "video" | "pdf" | "other" {
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf") return "pdf";
  return "other";
}

function nomeSeguro(nome: string) {
  return nome
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .toLowerCase();
}

export function MidiaPost({
  postId,
  organizationId,
  somenteLeitura,
}: {
  postId: string;
  organizationId: string;
  somenteLeitura: boolean;
}) {
  const { assets, carregando } = useAssets(postId);
  const { registrar, remover } = useAssetsMutations(postId);
  const [sobre, setSobre] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const input = useRef<HTMLInputElement>(null);

  async function enviar(arquivos: FileList | null) {
    if (!arquivos?.length || somenteLeitura) return;
    setEnviando(true);
    for (const arquivo of Array.from(arquivos)) {
      const caminho = `${organizationId}/${postId}/${nomeSeguro(arquivo.name)}`;
      const { error } = await supabase.storage
        .from("post-assets")
        .upload(caminho, arquivo, { upsert: true, contentType: arquivo.type });

      if (error) {
        toast.error(error.message);
        continue;
      }

      try {
        await registrar.mutateAsync({ storage_path: caminho, kind: tipoDoMime(arquivo.type) });
      } catch (erro) {
        toast.error(erro instanceof Error ? erro.message : "Falha ao registrar o arquivo");
      }
    }
    setEnviando(false);
  }

  async function apagar(id: string, caminho: string) {
    const { error } = await supabase.storage.from("post-assets").remove([caminho]);
    if (error) {
      toast.error(error.message);
      return;
    }
    try {
      await remover.mutateAsync({ id });
      toast.success("Arquivo removido");
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Falha ao remover o registro");
    }
  }

  return (
    <section className="cartao secao-entrada p-4">
      <span className="rotulo mb-3 block">Mídia</span>

      {!somenteLeitura && (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setSobre(true);
          }}
          onDragLeave={() => setSobre(false)}
          onDrop={(e) => {
            e.preventDefault();
            setSobre(false);
            void enviar(e.dataTransfer.files);
          }}
          onClick={() => input.current?.click()}
          className={
            "flex cursor-pointer flex-col items-center gap-2 rounded-[.7rem] border border-dashed p-6 text-center transition-colors " +
            (sobre ? "border-azure bg-azure/6" : "border-lineForte")
          }
        >
          <UploadCloud size={18} className="text-muted" />
          <p className="text-xs text-muted">
            {enviando ? "Enviando…" : "Arraste arquivos aqui ou clique para escolher"}
          </p>
          <input
            ref={input}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              void enviar(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      )}

      {carregando && <p className="mt-3 text-xs text-muted">Carregando mídia…</p>}

      {!carregando && assets.length === 0 && (
        <p className="mt-3 text-xs text-muted">Nenhum arquivo por aqui.</p>
      )}

      {assets.length > 0 && (
        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
          {assets.map((a) => (
            <figure
              key={a.id}
              className="group relative overflow-hidden rounded-[.6rem] border border-line bg-card2"
            >
              {a.kind === "image" && a.url && (
                <img
                  src={a.url}
                  alt={a.storage_path.split("/").pop() ?? "Mídia do post"}
                  loading="lazy"
                  className="h-28 w-full object-cover"
                />
              )}
              {a.kind === "video" && a.url && (
                <video src={a.url} controls className="h-28 w-full object-cover" />
              )}
              {(a.kind === "pdf" || a.kind === "other" || !a.url) && (
                <div className="flex h-28 flex-col items-center justify-center gap-1 p-2 text-center">
                  <FileText size={16} className="text-muted" />
                  <span className="line-clamp-2 text-[.68rem] text-muted">
                    {a.storage_path.split("/").pop()}
                  </span>
                </div>
              )}

              {!somenteLeitura && (
                <button
                  className="btn absolute right-1 top-1 !p-1 opacity-0 transition-opacity group-hover:opacity-100"
                  aria-label="Remover arquivo"
                  onClick={() => void apagar(a.id, a.storage_path)}
                >
                  <Trash2 size={13} />
                </button>
              )}
            </figure>
          ))}
        </div>
      )}
    </section>
  );
}

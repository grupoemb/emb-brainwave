import { BookmarkCheck, Check, Sparkles, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { useStatusIdeia, useVirarPauta, type Ideia } from "@/hooks/useIdeias";

export type GrupoIdeia = "nova" | "variacao" | "adaptacao";

export const CORES: Record<GrupoIdeia, { texto: string; borda: string; fundo: string }> = {
  nova: { texto: "text-azureClaro", borda: "border-l-azure", fundo: "bg-azure/12" },
  variacao: { texto: "text-bom", borda: "border-l-bom", fundo: "bg-bom/12" },
  adaptacao: { texto: "text-violet-300", borda: "border-l-violet-400", fundo: "bg-violet-400/12" },
};

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-line bg-white/5 px-2 py-px text-[.66rem] text-corpo">
      {children}
    </span>
  );
}

export function CartaoIdeia({ ideia, grupo }: { ideia: Ideia; grupo: GrupoIdeia }) {
  const status = useStatusIdeia();
  const pauta = useVirarPauta();
  const cor = CORES[grupo];
  const salva = ideia.status === "saved";

  const chips = [
    ideia.format ? `Formato: ${ideia.format}` : null,
    ideia.hook_type ? `Gancho: ${ideia.hook_type}` : null,
    ideia.pillar ? `Pilar: ${ideia.pillar}` : null,
    ideia.handle ? `@${ideia.handle}` : null,
  ].filter(Boolean) as string[];

  return (
    <article className={"cartao space-y-2.5 border-l-2 p-4 " + cor.borda}>
      <div className="flex items-start justify-between gap-3">
        <h4 className="min-w-0 text-sm font-bold leading-snug text-txt">{ideia.title}</h4>
        {salva ? (
          <span
            className={
              "flex shrink-0 items-center gap-1 rounded-full px-2 py-px text-[.66rem] font-semibold " +
              cor.fundo +
              " " +
              cor.texto
            }
          >
            <BookmarkCheck size={11} /> Salva
          </span>
        ) : null}
      </div>

      {ideia.angle ? <p className="text-xs leading-relaxed text-corpo">{ideia.angle}</p> : null}
      {ideia.rationale ? <p className="text-xs leading-relaxed text-muted">{ideia.rationale}</p> : null}

      {chips.length > 0 ? <div className="flex flex-wrap gap-1.5">{chips.map((c) => <Chip key={c}>{c}</Chip>)}</div> : null}

      {ideia.based_on ? (
        <p className="text-[.68rem] text-muted">
          baseado em: <span className="text-corpo">{ideia.based_on}</span>
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <button
          type="button"
          className={"btn h-7 gap-1.5 px-2 text-[.7rem] " + (salva ? cor.texto : "")}
          disabled={status.isPending || salva}
          onClick={() =>
            status.mutate(
              { id: ideia.id, status: "saved" },
              {
                onSuccess: () => toast.success("Ideia salva"),
                onError: (e) => toast.error(e instanceof Error ? e.message : "Não deu para salvar"),
              },
            )
          }
        >
          <Check size={12} /> {salva ? "Salva" : "Salvar"}
        </button>

        <button
          type="button"
          className="btn h-7 gap-1.5 px-2 text-[.7rem]"
          disabled={pauta.isPending}
          onClick={() =>
            pauta.mutate(ideia, {
              onSuccess: () => toast.success("Virou pauta"),
              onError: (e) => toast.error(e instanceof Error ? e.message : "Não deu para criar a pauta"),
            })
          }
        >
          <Sparkles size={12} /> Virar pauta
        </button>

        <button
          type="button"
          className="btn h-7 gap-1.5 px-2 text-[.7rem] text-muted hover:text-ruim"
          disabled={status.isPending}
          onClick={() =>
            status.mutate(
              { id: ideia.id, status: "dismissed" },
              {
                onSuccess: () => toast.success("Ideia descartada"),
                onError: (e) => toast.error(e instanceof Error ? e.message : "Não deu para descartar"),
              },
            )
          }
        >
          <Trash2 size={12} /> Descartar
        </button>
      </div>
    </article>
  );
}

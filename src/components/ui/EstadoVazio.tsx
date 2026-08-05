import type { ReactNode } from "react";
import { MarcaB7 } from "@/components/ui/MarcaB7";

type Variante = "vazio" | "erro" | "filtro";

export function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
  compacto = false,
  variante = "vazio",
  marca = true,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  compacto?: boolean;
  variante?: Variante;
  /** Mostra a marca-d'água B7 (padrão nos estados grandes). */
  marca?: boolean;
}) {
  const erro = variante === "erro";
  const mostrarMarca = marca && !compacto && variante !== "filtro";

  return (
    <div
      className={
        "flex flex-col items-center justify-center rounded-[.8rem] border border-dashed text-center " +
        (erro ? "border-ruim/40 bg-ruim/[.04] " : "border-line ") +
        (compacto ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12")
      }
    >
      {mostrarMarca ? <MarcaB7 tom={erro ? "ruim" : "azure"} /> : null}
      {icone ? (
        <span
          className={
            "grid h-10 w-10 place-items-center rounded-full " +
            (erro ? "bg-ruim/12 text-ruim" : "bg-azure/12 text-azureClaro")
          }
        >
          {icone}
        </span>
      ) : null}
      <p className={"titulo-secao " + (erro ? "text-ruim" : "")}>{titulo}</p>
      {descricao ? <p className="legenda max-w-sm">{descricao}</p> : null}
      {acao ? <div className="mt-1">{acao}</div> : null}
    </div>
  );
}

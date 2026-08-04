import type { ReactNode } from "react";

export function EstadoVazio({
  icone,
  titulo,
  descricao,
  acao,
  compacto = false,
}: {
  icone?: ReactNode;
  titulo: string;
  descricao?: string;
  acao?: ReactNode;
  compacto?: boolean;
}) {
  return (
    <div
      className={
        "flex flex-col items-center justify-center rounded-[.8rem] border border-dashed border-line text-center " +
        (compacto ? "gap-2 px-4 py-6" : "gap-3 px-6 py-12")
      }
    >
      {icone ? (
        <span className="grid h-10 w-10 place-items-center rounded-full bg-white/5 text-muted">
          {icone}
        </span>
      ) : null}
      <p className="titulo-secao">{titulo}</p>
      {descricao ? <p className="legenda max-w-sm">{descricao}</p> : null}
      {acao ? <div className="mt-1">{acao}</div> : null}
    </div>
  );
}

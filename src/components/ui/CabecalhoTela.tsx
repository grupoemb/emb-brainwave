import type { ReactNode } from "react";

export function CabecalhoTela({
  titulo,
  descricao,
  acoes,
  icone,
}: {
  titulo: string;
  descricao?: ReactNode;
  acoes?: ReactNode;
  icone?: ReactNode;
}) {
  return (
    <div className="secao-entrada grid grid-cols-[minmax(0,1fr)_auto] items-start gap-3 sm:flex sm:flex-wrap sm:items-center sm:justify-between">
      <div className="flex min-w-0 items-start gap-3">
        {icone ? (
          <span className="mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-[.7rem] bg-azure/12 text-azureClaro">
            {icone}
          </span>
        ) : null}
        <div className="min-w-0">
          <h1 className="titulo-pagina truncate">{titulo}</h1>
          {descricao ? <p className="legenda mt-1 max-w-2xl">{descricao}</p> : null}
        </div>
      </div>
      {acoes ? <div className="flex shrink-0 flex-wrap items-center gap-2">{acoes}</div> : null}
    </div>
  );
}

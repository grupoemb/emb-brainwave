import { Search, X } from "lucide-react";

export function BuscaPerfil({
  termo,
  aoMudar,
  handles,
}: {
  termo: string;
  aoMudar: (v: string) => void;
  handles: string[];
}) {
  const atual = termo.trim().toLowerCase().replace(/^@/, "");

  return (
    <div className="space-y-2">
      <div className="relative">
        <Search
          size={14}
          aria-hidden
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
        />
        <input
          type="search"
          value={termo}
          onChange={(e) => aoMudar(e.target.value)}
          placeholder="Buscar perfil por @handle…"
          aria-label="Buscar perfil por handle"
          className="h-9 w-full rounded-[.6rem] border border-line bg-bg2 pl-8 pr-8 text-sm text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none"
        />
        {termo ? (
          <button
            type="button"
            onClick={() => aoMudar("")}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-[.4rem] p-1 text-muted transition-colors hover:text-corpo"
          >
            <X size={14} aria-hidden />
          </button>
        ) : null}
      </div>

      {handles.length > 1 ? (
        <div className="flex flex-wrap gap-1.5">
          {handles.map((h) => {
            const ativo = atual === h.toLowerCase();
            return (
              <button
                key={h}
                type="button"
                onClick={() => aoMudar(ativo ? "" : h)}
                className={
                  "pill border transition-colors " +
                  (ativo
                    ? "border-azure/40 bg-azure/14 text-azureClaro"
                    : "border-line text-muted hover:text-corpo")
                }
              >
                @{h}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

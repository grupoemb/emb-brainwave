import { Filter, X } from "lucide-react";

/**
 * Faixa discreta exibida quando a tela foi aberta a partir de um mini-KPI do painel.
 * Aparece antes dos dados, para o usuário saber exatamente qual recorte está carregando.
 */
export function FaixaDeContexto({
  recorte,
  onLimpar,
}: {
  recorte: string;
  onLimpar: () => void;
}) {
  return (
    <div className="secao-entrada flex flex-wrap items-center gap-2 rounded-[.6rem] border border-azure/25 bg-azure/8 px-3 py-2 text-xs text-corpo">
      <Filter size={13} className="text-azureClaro" />
      <span>
        Filtrado a partir do painel <span className="text-muted">·</span>{" "}
        <span className="text-txt">{recorte}</span>
      </span>
      <button
        type="button"
        onClick={onLimpar}
        className="ml-auto flex items-center gap-1 rounded-[.4rem] px-2 py-1 text-muted transition-colors hover:bg-white/6 hover:text-corpo"
      >
        <X size={12} /> limpar recorte
      </button>
    </div>
  );
}

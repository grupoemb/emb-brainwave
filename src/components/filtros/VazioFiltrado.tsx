import { EstadoVazio } from "@/components/ui/EstadoVazio";

/**
 * Estado vazio padrão para listas com filtros aplicados.
 * Invólucro fino sobre EstadoVazio (variante "filtro").
 */
export function VazioFiltrado({
  mensagem,
  detalhe,
  acao,
  onAcao,
}: {
  mensagem: string;
  detalhe?: string | undefined;
  acao?: string | undefined;
  onAcao?: (() => void) | undefined;
}) {
  return (
    <div className="secao-entrada">
      <EstadoVazio
        variante="filtro"
        compacto
        titulo={mensagem}
        {...(detalhe ? { descricao: detalhe } : {})}
        {...(acao && onAcao
          ? {
              acao: (
                <button
                  type="button"
                  className="btn px-3 py-1.5 text-xs"
                  onClick={onAcao}
                >
                  {acao}
                </button>
              ),
            }
          : {})}
      />
    </div>
  );
}

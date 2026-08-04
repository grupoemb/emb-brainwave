/**
 * Estado vazio padrão para listas com filtros aplicados.
 * Mesmo padrão de saída usado em Métricas: mensagem + atalho pra desfazer o recorte.
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
    <div className="cartao secao-entrada flex flex-col items-center gap-3 p-8 text-center">
      <p className="text-sm text-muted">{mensagem}</p>
      {detalhe ? <p className="text-xs text-muted/80">{detalhe}</p> : null}
      {acao && onAcao ? (
        <button type="button" className="btn px-3 py-1.5 text-xs" onClick={onAcao}>
          {acao}
        </button>
      ) : null}
    </div>
  );
}

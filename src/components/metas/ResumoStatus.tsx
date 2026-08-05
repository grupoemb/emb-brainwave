import { ORDEM_STATUS, STATUS, type Meta, type StatusMeta } from "@/lib/metas";

/** Faixa de contadores por status — clicar filtra os cards. */
export function ResumoStatus({
  metas,
  filtro,
  aoFiltrar,
}: {
  metas: Meta[];
  filtro: StatusMeta | null;
  aoFiltrar: (s: StatusMeta | null) => void;
}) {
  const contagem = ORDEM_STATUS.map((s) => ({
    status: s,
    n: metas.filter((m) => m.status === s).length,
  }));

  return (
    <div className="secao-entrada flex flex-wrap gap-2">
      {contagem.map(({ status, n }) => {
        const info = STATUS[status];
        const ativo = filtro === status;
        return (
          <button
            key={status}
            type="button"
            aria-pressed={ativo}
            disabled={n === 0}
            onClick={() => aoFiltrar(ativo ? null : status)}
            className={
              "flex items-center gap-2 rounded-[.6rem] border px-3 py-2 transition-colors disabled:cursor-not-allowed disabled:opacity-45 " +
              (ativo ? "border-lineForte bg-white/6" : "border-line bg-bg2/60 hover:bg-white/5")
            }
          >
            <span className="numero text-lg" style={{ color: info.cor }}>
              {n}
            </span>
            <span className="rotulo text-[.58rem]">{info.rotulo}</span>
          </button>
        );
      })}
    </div>
  );
}

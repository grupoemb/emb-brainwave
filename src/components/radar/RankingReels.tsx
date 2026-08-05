import { PillVx } from "@/components/radar/PillVx";
import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { compacto, type ReelProprio } from "@/lib/contas";

/** Ranking dos melhores reels de todas as contas próprias. */
export function RankingReels({
  reels,
  carregando = false,
}: {
  reels: ReelProprio[];
  carregando?: boolean;
}) {
  return (
    <div className="cartao p-4">
      <h2 className="rotulo">Melhores reels de todas as contas</h2>

      {carregando ? (
        <div className="mt-3 space-y-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="h-10 animate-pulse rounded-[10px] bg-white/[.04]" />
          ))}
        </div>
      ) : reels.length === 0 ? (
        <div className="mt-3">
          <EstadoVazio titulo="Aguardando a coleta das contas." />
        </div>
      ) : (
        <ol className="mt-3 space-y-1.5">
          {reels.map((r, i) => (
            <li key={r.id}>
              <a
                href={r.url ?? "#"}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 rounded-[10px] border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-white/[.03]"
              >
                <span className="numero w-7 shrink-0 text-sm text-muted">#{i + 1}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-corpo">
                  {r.caption ?? "Sem legenda"}
                </span>
                {r.handle ? (
                  <span className="pill shrink-0 bg-azure/14 text-[.62rem] text-azureClaro">
                    @{r.handle}
                  </span>
                ) : null}
                <span className="numero shrink-0 text-sm text-txt">{compacto(r.views)}</span>
                <PillVx vx={r.vx} />
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

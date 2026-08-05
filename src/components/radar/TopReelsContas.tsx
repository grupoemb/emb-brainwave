import { Film } from "lucide-react";

import { PillVx } from "@/components/radar/PillVx";
import { compacto, type ReelProprio } from "@/lib/contas";

export function TopReelsContas({ reels }: { reels: ReelProprio[] }) {
  if (reels.length === 0) return null;

  return (
    <div className="cartao p-4">
      <span className="rotulo">Melhores reels de todas as contas</span>

      <ol className="mt-3 space-y-1.5">
        {reels.map((r, i) => (
          <li key={r.id}>
            <a
              href={r.url ?? "#"}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-3 rounded-[10px] border border-transparent px-2 py-2 transition-colors hover:border-line hover:bg-white/[.03]"
            >
              <span className="numero w-5 shrink-0 text-sm text-muted">{i + 1}</span>
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-[8px] bg-azure/12 text-azureClaro">
                <Film size={15} aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs text-corpo">
                  {r.caption ?? "Sem legenda"}
                </span>
                {r.handle ? (
                  <span className="mt-1 inline-block rounded-full border border-line px-2 py-[1px] text-[.62rem] text-muted">
                    @{r.handle}
                  </span>
                ) : null}
              </span>
              <span className="numero shrink-0 text-sm text-txt">{compacto(r.views)}</span>
              <PillVx vx={r.vx} />
            </a>
          </li>
        ))}
      </ol>
    </div>
  );
}

import { Users } from "lucide-react";

import { useFollowers } from "@/hooks/useFollowers";
import { compacto, numero } from "@/lib/metricas";

/** KPI de seguidores consolidados — padrão dos demais cartões de KPI. */
export function KpiSeguidores({ compactoVisual = false }: { compactoVisual?: boolean }) {
  const { data, isPending, error } = useFollowers();

  const total = data?.total ?? null;
  const delta = data?.delta7d ?? null;

  return (
    <div className="cartao relative flex min-h-[6.6rem] flex-col justify-between overflow-hidden p-3.5 transition-colors hover:bg-white/4">
      <span className="rotulo flex items-center gap-1.5">
        <Users size={12} className="text-azureClaro" aria-hidden />
        Seguidores
      </span>

      {isPending ? (
        <div className="mt-3 h-7 w-20 animate-pulse rounded-[.4rem] bg-white/6" />
      ) : (
        <div
          className="mt-2 flex items-end justify-between gap-2"
          title={total !== null ? numero(total) : undefined}
        >
          <span
            className={
              "numero " +
              (compactoVisual ? "text-xl " : "text-2xl ") +
              (total === null || error ? "text-muted" : "")
            }
          >
            {total === null || error ? "—" : compacto(total)}
          </span>
        </div>
      )}

      <p className="numero mt-1 text-xs">
        {delta === null ? (
          <span className="text-muted">—</span>
        ) : (
          <span className={delta >= 0 ? "text-bom" : "text-ruim"}>
            {delta >= 0 ? "+" : "−"}
            {compacto(Math.abs(delta))} <span className="text-muted">(7d)</span>
          </span>
        )}
      </p>
    </div>
  );
}

import { Flame } from "lucide-react";

import { compacto, type ContaVisao } from "@/lib/contas";
import { numero } from "@/lib/metricas";

function classeVx(vx: number | null) {
  if (vx === null) return "text-muted";
  if (vx >= 1.3) return "pill pill-bom";
  if (vx < 0.7) return "pill pill-ruim";
  return "pill pill-alerta";
}

function Metrica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="min-w-0">
      <span className="rotulo block text-[.6rem]">{rotulo}</span>
      <span className="numero mt-0.5 block truncate text-base text-txt">{valor}</span>
    </div>
  );
}

export function CartaoConta({ conta, aoAbrir }: { conta: ContaVisao; aoAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={aoAbrir}
      className="cartao w-full p-5 text-left transition-colors hover:border-azure/40 hover:bg-white/[.03] focus-visible:border-azure/50"
      title={`Analisar @${conta.handle}`}
    >
      <div className="flex items-baseline justify-between gap-2">
        <span className="truncate font-bold text-txt">@{conta.handle}</span>
        <span className="numero shrink-0 text-sm text-muted">
          {compacto(conta.followers)} seg.
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 sm:grid-cols-4">
        <Metrica rotulo="média de views" valor={compacto(conta.avgViews)} />
        <Metrica rotulo="alcance médio" valor={compacto(conta.avgReach)} />
        <Metrica rotulo="salvam. médio" valor={numero(conta.avgSaves, 1)} />
        <Metrica
          rotulo="engajamento"
          valor={conta.engPct === null ? "—" : `${numero(conta.engPct, 1)}%`}
        />
      </div>

      <div className="mt-4 border-t border-line pt-3">
        <span className="rotulo text-[.6rem]">melhor reel</span>
        <div className="mt-1 flex items-center justify-between gap-2">
          <span className="min-w-0 flex-1 truncate text-xs text-corpo">
            {conta.bestTitle ?? "—"}
          </span>
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="numero text-xs text-txt">{compacto(conta.bestViews)}</span>
            <span className={"numero text-[.68rem] " + classeVx(conta.bestVx)}>
              {conta.bestVx === null ? "—" : `${numero(conta.bestVx, 2)}×`}
            </span>
            {conta.bestVx !== null && conta.bestVx >= 2 ? (
              <Flame size={12} color="#f6bd24" aria-hidden />
            ) : null}
          </span>
        </div>
      </div>

      <p className="mt-3 text-[.68rem] text-muted">
        <span className="numero">{conta.reels}</span>{" "}
        {conta.reels === 1 ? "reel monitorado" : "reels monitorados"}
      </p>
    </button>
  );
}

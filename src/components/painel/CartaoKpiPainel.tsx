import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react";

import { Dica } from "@/components/painel/Dica";
import { Sparkline } from "@/components/metricas/Sparkline";
import { numero } from "@/lib/metricas";
import type { PontoSerie } from "@/lib/painel.tipos";

export function Delta({ atual, anterior }: { atual: number | null; anterior: number | null }) {
  if (atual === null || anterior === null || anterior === 0) {
    return <span className="text-xs text-muted">—</span>;
  }
  const v = ((atual - anterior) / Math.abs(anterior)) * 100;
  const neutro = Math.abs(v) < 0.5;
  const bom = v > 0;
  const Icone = neutro ? Minus : bom ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={
        "numero inline-flex items-center gap-0.5 text-xs " +
        (neutro ? "text-muted" : bom ? "text-bom" : "text-ruim")
      }
      title="Variação vs. o período anterior de mesmo tamanho"
    >
      <Icone size={12} />
      {numero(Math.abs(v), 1)}%
    </span>
  );
}

export function CartaoKpiPainel({
  rotulo,
  valor,
  anterior,
  sufixo,
  casas = 0,
  dica,
  serie,
  cor,
}: {
  rotulo: string;
  valor: number | null;
  anterior?: number | null;
  sufixo?: string;
  casas?: number;
  dica?: string;
  serie?: PontoSerie[];
  cor?: string;
}) {
  return (
    <div className="cartao relative flex min-h-[6.6rem] flex-col justify-between overflow-hidden p-3.5 transition-colors hover:bg-white/4">
      <span className="rotulo flex items-center gap-1">
        {rotulo}
        {dica ? <Dica texto={dica} /> : null}
      </span>
      <div className="mt-2 flex items-end justify-between gap-2">
        <span className={"numero text-2xl " + (valor === null ? "text-muted" : "")}>
          {valor === null ? "—" : numero(valor, casas)}
          {valor !== null && sufixo ? (
            <span className="text-sm text-muted">{sufixo}</span>
          ) : null}
        </span>
        {anterior !== undefined ? <Delta atual={valor} anterior={anterior ?? null} /> : null}
      </div>
      {serie && serie.length > 1 ? (
        <div className="pointer-events-none -mx-3.5 -mb-3.5 mt-2 opacity-80">
          <Sparkline dados={serie} cor={cor ?? "#00a4ff"} altura={30} />
        </div>
      ) : null}
    </div>
  );
}

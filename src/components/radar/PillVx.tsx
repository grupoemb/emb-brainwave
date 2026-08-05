import { Flame } from "lucide-react";

import { numero } from "@/lib/metricas";

/** Pill de VX no padrão da fundação: verde ≥1.3, chama ≥2. */
export function PillVx({ vx }: { vx: number | null }) {
  const classe =
    vx === null
      ? "text-muted"
      : vx >= 1.3
        ? "pill pill-bom"
        : vx < 0.7
          ? "pill pill-ruim"
          : "pill pill-alerta";

  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className={"numero text-[.68rem] " + classe}>
        {vx === null ? "—" : `${numero(vx, 2)}×`}
      </span>
      {vx !== null && vx >= 2 ? <Flame size={12} color="#f6bd24" aria-hidden /> : null}
    </span>
  );
}

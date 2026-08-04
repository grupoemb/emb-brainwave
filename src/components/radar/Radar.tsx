import { getRouteApi, useNavigate } from "@tanstack/react-router";
import { Radar as IconeRadar } from "lucide-react";

import { Revelar } from "@/components/Revelar";
import { CabecalhoTela } from "@/components/ui/CabecalhoTela";

import { Biblioteca } from "@/components/radar/Biblioteca";
import { RadarColeta } from "@/components/radar/RadarColeta";

const rota = getRouteApi("/_authenticated/radar");

const ABAS = [
  { valor: "radar", rotulo: "Radar" },
  { valor: "biblioteca", rotulo: "Biblioteca" },
] as const;

export function Radar() {
  const { aba } = rota.useSearch();
  const navigate = useNavigate();

  return (
    <Revelar className="space-y-4">
      <h1 className="secao-entrada text-lg font-bold">Reels Radar</h1>

      <div className="secao-entrada flex gap-2">
        {ABAS.map((a) => (
          <button
            key={a.valor}
            type="button"
            onClick={() => void navigate({ to: "/radar", search: { aba: a.valor } })}
            className={
              "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
              (aba === a.valor
                ? "border-azure/40 bg-azure/14 font-semibold text-txt"
                : "border-line text-muted hover:text-corpo")
            }
          >
            {a.rotulo}
          </button>
        ))}
      </div>

      <div className="secao-entrada">{aba === "biblioteca" ? <Biblioteca /> : <RadarColeta />}</div>
    </Revelar>
  );
}

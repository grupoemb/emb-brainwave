import { useState } from "react";
import { ExternalLink } from "lucide-react";

import { PillVx } from "@/components/radar/PillVx";
import { compacto, numero } from "@/lib/metricas";
import { alavancaDe, rotuloGancho, rotuloIntencao, type ReelRanking } from "@/lib/ranking";

function ChipAlavanca({ reel }: { reel: ReelRanking }) {
  const a = alavancaDe(reel.lever);
  if (!a) return <span className="text-xs text-muted">—</span>;
  const Icone = a.icone;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 rounded-[.45rem] px-2 py-1 text-[.7rem]"
      style={{ backgroundColor: `${a.cor}1f`, color: a.cor }}
      title={`Alavanca: ${a.rotulo}`}
    >
      <Icone size={12} aria-hidden />
      <span className="font-semibold">{a.rotulo}</span>
      <span className="numero opacity-80">{a.metrica(reel)}</span>
    </span>
  );
}

function Taxa({ rotulo, valor }: { rotulo: string; valor: number | null }) {
  return (
    <div className="rounded-[.5rem] border border-line px-2.5 py-2">
      <p className="rotulo text-[.62rem]">{rotulo}</p>
      <p className="numero mt-0.5 text-sm">
        {valor === null ? "—" : `${numero(valor, 1)}%`}
      </p>
    </div>
  );
}

export function LinhaRanking({ reel, posicao }: { reel: ReelRanking; posicao: number }) {
  const [aberto, setAberto] = useState(false);
  const a = alavancaDe(reel.lever);

  return (
    <li className="border-b border-line last:border-0">
      <button
        type="button"
        onClick={() => setAberto((v) => !v)}
        aria-expanded={aberto}
        className="flex w-full items-center gap-3 px-3 py-2.5 text-left transition-colors hover:bg-white/4"
      >
        <span className="numero w-6 shrink-0 text-sm text-muted">{posicao}</span>
        <span className="pill shrink-0 bg-azure/14 text-azureClaro">@{reel.handle}</span>
        <span className="min-w-0 flex-1 truncate text-sm text-corpo">
          {reel.caption ?? "Sem legenda"}
        </span>
        <span className="hidden shrink-0 md:block">
          <ChipAlavanca reel={reel} />
        </span>
        <span className="numero shrink-0 text-sm font-semibold text-txt">
          {reel.score === null ? "—" : numero(reel.score, 1)}
        </span>
        <PillVx vx={reel.vx} />
      </button>

      {aberto ? (
        <div className="space-y-3 border-t border-line bg-white/[.02] px-3 py-3">
          <div className="md:hidden">
            <ChipAlavanca reel={reel} />
          </div>

          {a && reel.lever_pct !== null ? (
            <div>
              <div className="mb-1 flex items-center justify-between text-[.7rem] text-muted">
                <span>Peso da alavanca · {a.rotulo}</span>
                <span className="numero">{numero(reel.lever_pct, 0)}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/8">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${Math.max(0, Math.min(100, reel.lever_pct))}%`,
                    backgroundColor: a.cor,
                  }}
                />
              </div>
            </div>
          ) : null}

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Taxa rotulo="Compart / alcance" valor={reel.shares_pr} />
            <Taxa rotulo="Salv / alcance" valor={reel.saves_pr} />
            <Taxa rotulo="Engaj / alcance" valor={reel.eng_pr} />
            <Taxa rotulo="Alcance / seguidores" valor={reel.reach_rate} />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 text-[.72rem]">
            <span className="pill bg-white/6 text-corpo">Gancho: {rotuloGancho(reel.hook)}</span>
            <span className="pill bg-white/6 text-corpo">Tema: {reel.theme ?? "—"}</span>
            <span className="pill bg-white/6 text-corpo">
              Intenção: {rotuloIntencao(reel.intent)}
            </span>
            <span className="numero pill bg-white/6 text-corpo">
              {compacto(reel.plays ?? 0)} views
            </span>
            <span className="numero pill bg-white/6 text-corpo">
              {compacto(reel.reach ?? 0)} alcance
            </span>
          </div>

          {reel.url ? (
            <a
              href={reel.url}
              target="_blank"
              rel="noreferrer"
              className="btn inline-flex items-center gap-1.5 px-2.5 py-1 text-xs"
            >
              <ExternalLink size={12} aria-hidden />
              Abrir reel
            </a>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

export function LinhaCompacta({ reel, posicao }: { reel: ReelRanking; posicao: number }) {
  const a = alavancaDe(reel.lever);
  const Icone = a?.icone;

  return (
    <li className="flex items-center gap-3 border-b border-line px-3 py-2 last:border-0">
      <span className="numero w-4 shrink-0 text-xs text-muted">{posicao}</span>
      <span className="min-w-0 flex-1 truncate text-[.82rem] text-corpo">
        {reel.caption ?? "Sem legenda"}
      </span>
      {a && Icone ? (
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-[.4rem] px-1.5 py-0.5 text-[.66rem]"
          style={{ backgroundColor: `${a.cor}1f`, color: a.cor }}
        >
          <Icone size={11} aria-hidden />
          {a.rotulo}
        </span>
      ) : null}
      <span className="numero shrink-0 text-xs font-semibold text-txt">
        {reel.score === null ? "—" : numero(reel.score, 1)}
      </span>
    </li>
  );
}

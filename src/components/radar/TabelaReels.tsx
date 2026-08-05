import { Flame, Image as IconeImagem } from "lucide-react";

import { numero } from "@/lib/metricas";
import { classeVx, ehVxFlame, formatarDuracao, type ReelColetado } from "@/lib/radar";

export function TabelaReels({
  reels,
  handle,
  total,
  mediana,
  selecionados,
  aoAlternar,
  aoAlternarTodos,
}: {
  reels: ReelColetado[];
  handle: string;
  total: number;
  mediana: number | null;
  selecionados: Set<string>;
  aoAlternar: (id: string) => void;
  aoAlternarTodos: (marcar: boolean) => void;
}) {
  const todos = reels.length > 0 && reels.every((r) => selecionados.has(r.id));

  return (
    <div className="cartao overflow-hidden">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-line px-4 py-3">
        <h2 className="rotulo">Reels encontrados</h2>
        <span className="text-xs text-corpo">
          @{handle} · <span className="numero">{total}</span> reels · mediana{" "}
          <span className="numero">{numero(mediana)}</span> views
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left">
              <th className="px-4 py-2">
                <input
                  type="checkbox"
                  aria-label="Selecionar todos os reels"
                  checked={todos}
                  onChange={(e) => aoAlternarTodos(e.target.checked)}
                  className="h-3.5 w-3.5 accent-[#00a4ff]"
                />
              </th>
              <th className="rotulo px-2 py-2 font-normal">capa</th>
              <th className="rotulo px-2 py-2 font-normal">legenda</th>
              <th className="rotulo px-2 py-2 text-right font-normal">views</th>
              <th className="rotulo px-2 py-2 text-right font-normal">vx</th>
              <th className="rotulo px-4 py-2 text-right font-normal">duração</th>
            </tr>
          </thead>
          <tbody>
            {reels.map((r) => {
              const marcado = selecionados.has(r.id);
              return (
                <tr
                  key={r.id}
                  className={
                    "border-b border-line/60 last:border-b-0 transition-colors " +
                    (marcado ? "bg-azure/[.07]" : "hover:bg-white/[.03]")
                  }
                >
                  <td className="px-4 py-2 align-middle">
                    <input
                      type="checkbox"
                      aria-label={`Selecionar reel ${r.caption ?? r.id}`}
                      checked={marcado}
                      onChange={() => aoAlternar(r.id)}
                      className="h-3.5 w-3.5 accent-[#00a4ff]"
                    />
                  </td>
                  <td className="px-2 py-2">
                    {r.cover ? (
                      <img
                        src={r.cover}
                        alt=""
                        loading="lazy"
                        className="h-[42px] w-[32px] rounded-[.3rem] border border-line object-cover"
                      />
                    ) : (
                      <div className="flex h-[42px] w-[32px] items-center justify-center rounded-[.3rem] border border-line bg-white/[.04]">
                        <IconeImagem size={12} className="text-muted" aria-hidden />
                      </div>
                    )}
                  </td>
                  <td className="max-w-[22rem] px-2 py-2">
                    {r.url ? (
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noreferrer"
                        className="line-clamp-1 text-corpo hover:text-azureClaro"
                      >
                        {r.caption ?? r.url}
                      </a>
                    ) : (
                      <span className="line-clamp-1 text-corpo">{r.caption ?? "—"}</span>
                    )}
                  </td>
                  <td className="numero px-2 py-2 text-right text-txt">{numero(r.views)}</td>
                  <td className="px-2 py-2 text-right">
                    <span className="inline-flex items-center gap-1">
                      <span className={"pill numero text-[.68rem] " + classeVx(r.vx)}>
                        {r.vx === null ? "—" : `${numero(r.vx, 2)}×`}
                      </span>
                      {ehVxFlame(r.vx) ? (
                        <Flame size={12} color="#f6bd24" aria-hidden className="shrink-0" />
                      ) : null}
                    </span>
                  </td>
                  <td className="numero px-4 py-2 text-right text-corpo">
                    {formatarDuracao(r.duration_s)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

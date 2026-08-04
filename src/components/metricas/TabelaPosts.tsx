import { useNavigate } from "@tanstack/react-router";

import { classeRx, numero, rotuloFormato, type LinhaMetrica } from "@/lib/metricas";

function data(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

export function TabelaPosts({
  linhas,
  modo,
  setModo,
}: {
  linhas: LinhaMetrica[];
  modo: "top" | "piores";
  setModo: (m: "top" | "piores") => void;
}) {
  const navigate = useNavigate();

  const ordenadas = [...linhas]
    .filter((l) => l.rx !== null)
    .sort((a, b) =>
      modo === "top" ? (b.rx as number) - (a.rx as number) : (a.rx as number) - (b.rx as number),
    )
    .slice(0, 10);

  const semRx = ordenadas.length === 0;

  return (
    <div className="cartao p-4">
      <div className="mb-3 flex items-center gap-1.5">
        {(["top", "piores"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setModo(m)}
            className={
              "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
              (modo === m
                ? "border-azure/40 bg-azure/14 font-semibold text-txt"
                : "border-line text-muted hover:text-corpo")
            }
          >
            {m === "top" ? "Top posts" : "Piores posts"}
          </button>
        ))}
      </div>

      {semRx ? (
        <p className="py-6 text-center text-sm text-muted">
          Sem performance relativa disponível para os posts do período.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="rotulo py-2 pr-3 text-left font-normal">Título</th>
                <th className="rotulo py-2 pr-3 text-left font-normal">Conta</th>
                <th className="rotulo py-2 pr-3 text-left font-normal">Formato</th>
                <th className="rotulo py-2 pr-3 text-right font-normal">Data</th>
                <th className="rotulo py-2 pr-3 text-right font-normal">Alcance</th>
                <th className="rotulo py-2 pr-3 text-right font-normal">Salvos</th>
                <th className="rotulo py-2 pr-3 text-right font-normal">Shares</th>
                <th className="rotulo py-2 text-right font-normal">rx</th>
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((l) => (
                <tr
                  key={l.id}
                  onClick={() => navigate({ to: "/post/$id", params: { id: l.id } })}
                  className="cursor-pointer border-b border-line/60 transition-colors hover:bg-white/5"
                >
                  <td className="max-w-[300px] truncate py-2.5 pr-3 text-txt">{l.title}</td>
                  <td className="py-2.5 pr-3 text-corpo">{l.conta ? `@${l.conta}` : "—"}</td>
                  <td className="py-2.5 pr-3 text-corpo">{rotuloFormato(l.format)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-corpo">{data(l.published_at)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.reach)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.saves)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.shares)}</td>
                  <td className="py-2.5 text-right">
                    <span className={"pill numero " + (classeRx(l.rx) || "text-corpo")}>
                      {l.rx === null ? "—" : `${numero(l.rx, 2)}×`}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

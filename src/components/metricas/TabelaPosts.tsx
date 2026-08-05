import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowDown, ArrowUp, Filter, Flame, Search } from "lucide-react";

import { classeRx, ehOutlier, numero, rotuloFormato, type LinhaMetrica } from "@/lib/metricas";

function data(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

type Coluna =
  | "published_at"
  | "reach"
  | "impressions"
  | "saves"
  | "shares"
  | "comments"
  | "likes"
  | "rx";

const COLUNAS: { chave: Coluna; rotulo: string }[] = [
  { chave: "published_at", rotulo: "Data" },
  { chave: "reach", rotulo: "Alcance" },
  { chave: "impressions", rotulo: "Impressões" },
  { chave: "saves", rotulo: "Salvos" },
  { chave: "shares", rotulo: "Shares" },
  { chave: "comments", rotulo: "Coment." },
  { chave: "likes", rotulo: "Curtidas" },
  { chave: "rx", rotulo: "rx" },
];

export function TabelaPosts({
  linhas,
  modo,
  setModo,
  soOutliers,
  aoLimparOutliers,
  recorte,
  aoLimparRecorte,
}: {
  linhas: LinhaMetrica[];
  modo: "top" | "piores";
  setModo: (m: "top" | "piores") => void;
  soOutliers?: boolean;
  aoLimparOutliers?: () => void;
  recorte?: string | null;
  aoLimparRecorte?: () => void;
}) {
  const navigate = useNavigate();
  const [busca, setBusca] = useState("");
  const [coluna, setColuna] = useState<Coluna>("rx");
  const [desc, setDesc] = useState(true);

  const ordenadas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    let base = linhas.filter(
      (l) =>
        !termo ||
        l.title.toLowerCase().includes(termo) ||
        (l.conta ?? "").toLowerCase().includes(termo),
    );
    if (soOutliers) base = base.filter((l) => ehOutlier(l.rx));

    const valor = (l: LinhaMetrica) =>
      coluna === "published_at"
        ? l.published_at
          ? new Date(l.published_at).getTime()
          : -Infinity
        : ((l[coluna] as number | null) ?? -Infinity);

    // O par de botões top/piores força a direção do rx.
    const dir = coluna === "rx" ? (modo === "top" ? -1 : 1) : desc ? -1 : 1;
    return [...base].sort((a, b) => (valor(a) - valor(b)) * dir).slice(0, 20);
  }, [linhas, busca, soOutliers, coluna, desc, modo]);

  const maxRx = ordenadas.reduce((m, l) => Math.max(m, l.rx ?? 0), 0) || 1;
  const vazio = ordenadas.length === 0;

  const alternar = (c: Coluna) => {
    if (c === coluna) {
      if (c === "rx") setModo(modo === "top" ? "piores" : "top");
      else setDesc((v) => !v);
      return;
    }
    setColuna(c);
    setDesc(true);
  };

  const seta = (c: Coluna) => {
    if (c !== coluna) return null;
    const paraBaixo = c === "rx" ? modo === "top" : desc;
    return paraBaixo ? (
      <ArrowDown size={11} className="inline" />
    ) : (
      <ArrowUp size={11} className="inline" />
    );
  };

  return (
    <div className="cartao p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rotulo">Posts do período</span>

        <label className="ml-auto flex h-[30px] items-center gap-1.5 rounded-[8px] border border-line px-2.5">
          <Search size={13} className="shrink-0 text-muted" aria-hidden />
          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="buscar por título ou conta"
            className="w-40 bg-transparent text-xs text-txt outline-none placeholder:text-muted sm:w-56"
          />
        </label>

        {(["top", "piores"] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => {
              setColuna("rx");
              setModo(m);
            }}
            className={
              "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
              (coluna === "rx" && modo === m
                ? "border-azure/40 bg-azure/14 font-semibold text-txt"
                : "border-line text-muted hover:text-corpo")
            }
          >
            {m === "top" ? "Top" : "Piores"}
          </button>
        ))}

        <button
          type="button"
          onClick={aoLimparOutliers}
          className={
            "flex h-[30px] shrink-0 items-center gap-1.5 rounded-[8px] border px-3 text-xs transition-colors " +
            (soOutliers
              ? "border-alerta/40 bg-alerta/12 font-semibold text-txt"
              : "border-line text-muted hover:text-corpo")
          }
          aria-pressed={!!soOutliers}
          title="Mostrar só posts com rx ≥ 2,00×"
        >
          <Flame size={12} color="#f6bd24" />
          fora da curva
        </button>
      </div>

      {recorte ? (
        <div className="mb-3 flex flex-wrap items-center gap-2 rounded-[.6rem] border border-azure/30 bg-azure/10 px-3 py-2 text-xs text-corpo">
          <Filter size={12} className="shrink-0 text-azureClaro" aria-hidden />
          <span>
            Recorte aplicado: <span className="font-semibold text-txt">{recorte}</span>
          </span>
          <button
            type="button"
            onClick={aoLimparRecorte}
            className="ml-auto rounded-[.4rem] px-2 py-0.5 text-[.7rem] text-muted transition-colors hover:text-txt"
          >
            limpar recorte
          </button>
        </div>
      ) : null}

      {vazio ? (
        <div className="mt-3">
          <EstadoVazio
            titulo={
              soOutliers
                ? "Nenhum post fora da curva neste período."
                : busca
                  ? "Nenhum post corresponde à busca."
                  : "Sem leituras disponíveis para os posts do período."
            }
            {...(soOutliers
              ? {
                  acao: (
                    <button
                      type="button"
                      onClick={aoLimparOutliers}
                      className="btn px-3 py-1.5 text-xs"
                    >
                      mostrar todos
                    </button>
                  ),
                }
              : {})}
          />
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[940px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-line">
                <th className="rotulo py-2 pr-3 text-left font-normal">Título</th>
                <th className="rotulo py-2 pr-3 text-left font-normal">Conta</th>
                <th className="rotulo py-2 pr-3 text-left font-normal">Formato</th>
                {COLUNAS.map((c) => (
                  <th key={c.chave} className="py-2 pr-3 text-right font-normal">
                    <button
                      type="button"
                      onClick={() => alternar(c.chave)}
                      className={
                        "rotulo inline-flex items-center gap-1 transition-colors hover:text-corpo " +
                        (coluna === c.chave ? "text-azureClaro" : "")
                      }
                    >
                      {c.rotulo} {seta(c.chave)}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordenadas.map((l) => (
                <tr
                  key={l.id}
                  onClick={() =>
                    navigate({
                      to: "/post/$id",
                      params: { id: l.id },
                      search: { origem: "metricas" },
                    })
                  }
                  className="cursor-pointer border-b border-line/60 transition-colors hover:bg-white/5"
                >
                  <td className="max-w-[280px] truncate py-2.5 pr-3 text-txt">{l.title}</td>
                  <td className="py-2.5 pr-3 text-corpo">{l.conta ? `@${l.conta}` : "—"}</td>
                  <td className="py-2.5 pr-3 text-corpo">{rotuloFormato(l.format)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-corpo">
                    {data(l.published_at)}
                  </td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.reach)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-corpo">
                    {numero(l.impressions)}
                  </td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.saves)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-txt">{numero(l.shares)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-corpo">{numero(l.comments)}</td>
                  <td className="numero py-2.5 pr-3 text-right text-corpo">{numero(l.likes)}</td>
                  <td className="py-2.5 text-right">
                    <span className="inline-flex items-center justify-end gap-1">
                      <span className="hidden h-1.5 w-14 overflow-hidden rounded-full bg-white/6 sm:block">
                        <span
                          className="block h-full rounded-full bg-gradient-to-r from-royal to-azure"
                          style={{ width: `${Math.max(2, ((l.rx ?? 0) / maxRx) * 100)}%` }}
                        />
                      </span>
                      <span className={"pill numero " + (classeRx(l.rx) || "text-corpo")}>
                        {l.rx === null ? "—" : `${numero(l.rx, 2)}×`}
                      </span>
                      {ehOutlier(l.rx) ? (
                        <span
                          className="inline-flex shrink-0"
                          title={`Fora da curva: ${numero(l.rx, 1)}x a mediana do formato`}
                        >
                          <Flame size={12} color="#f6bd24" aria-label="fora da curva" />
                        </span>
                      ) : null}
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

import { useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Filter } from "lucide-react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { usePilares } from "@/hooks/useConteudo";
import type { Formato } from "@/lib/conteudo";
import {
  classeRx,
  defMetrica,
  ehOutlier,
  naFaixaRx,
  numero,
  rotuloFormato,
  type ChaveMetrica,
  type LinhaMetrica,
} from "@/lib/metricas";
import {
  BarraProporcao,
  IconeFormato,
  SeloOutlier,
} from "@/components/metricas/PecasTabelaPosts";
import {
  FiltrosTabelaPosts,
  type EstadoFiltros,
} from "@/components/metricas/FiltrosTabelaPosts";

const COLUNAS_PADRAO: ChaveMetrica[] = ["published_at", "reach", "rx"];

const PADRAO: EstadoFiltros = {
  busca: "",
  formato: "todos",
  faixa: "todas",
  minimo: "",
  quantidade: 20,
  ranquear: "rx",
  desc: true,
};

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
  const { pilarPorId } = usePilares();
  const [estado, setLocal] = useState<EstadoFiltros>(PADRAO);
  const [colunas, setColunas] = useState<ChaveMetrica[]>(COLUNAS_PADRAO);

  const faixa = soOutliers ? "outlier" : estado.faixa;
  const desc = estado.ranquear === "rx" ? modo === "top" : estado.desc;

  const setEstado = (p: Partial<EstadoFiltros>) => {
    if (p.faixa && p.faixa !== "outlier" && soOutliers) aoLimparOutliers?.();
    if (p.faixa === "outlier" && !soOutliers) aoLimparOutliers?.();
    if (p.desc !== undefined && estado.ranquear === "rx") {
      setModo(p.desc ? "top" : "piores");
    }
    setLocal((v) => ({ ...v, ...p }));
  };

  const alternarColuna = (c: ChaveMetrica) =>
    setColunas((v) => (v.includes(c) ? v.filter((x) => x !== c) : [...v, c]));

  const def = defMetrica(estado.ranquear);

  const formatos = useMemo(() => {
    const mapa = new Map<Formato, number>();
    for (const l of linhas) if (l.format) mapa.set(l.format, (mapa.get(l.format) ?? 0) + 1);
    return [...mapa.entries()].map(([valor, contagem]) => ({ valor, contagem }));
  }, [linhas]);

  const filtradas = useMemo(() => {
    const termo = estado.busca.trim().toLowerCase();
    const minimo = Number(estado.minimo.replace(",", "."));
    const temMin = estado.minimo.trim() !== "" && Number.isFinite(minimo);

    return linhas.filter((l) => {
      if (
        termo &&
        !l.title.toLowerCase().includes(termo) &&
        !(l.conta ?? "").toLowerCase().includes(termo)
      )
        return false;
      if (estado.formato !== "todos" && l.format !== estado.formato) return false;
      if (!naFaixaRx(l.rx, faixa)) return false;
      if (temMin) {
        const v = def.valor(l);
        if (v === null || v <= minimo) return false;
      }
      return true;
    });
  }, [linhas, estado.busca, estado.formato, estado.minimo, faixa, def]);

  const ordenadas = useMemo(() => {
    const dir = desc ? -1 : 1;
    return [...filtradas]
      .sort((a, b) => ((def.valor(a) ?? -Infinity) - (def.valor(b) ?? -Infinity)) * dir)
      .slice(0, estado.quantidade);
  }, [filtradas, def, desc, estado.quantidade]);

  const maxRank = ordenadas.reduce((m, l) => Math.max(m, def.valor(l) ?? 0), 0) || 1;
  const temFiltro =
    !!estado.busca ||
    estado.formato !== "todos" ||
    faixa !== "todas" ||
    !!estado.minimo ||
    estado.quantidade !== PADRAO.quantidade;

  const limpar = () => {
    if (soOutliers) aoLimparOutliers?.();
    setLocal((v) => ({ ...PADRAO, ranquear: v.ranquear, desc: v.desc }));
  };

  const abrir = (id: string) =>
    navigate({ to: "/post/$id", params: { id }, search: { origem: "metricas" } });

  const colunasVisiveis = colunas.filter((c) => c !== estado.ranquear);

  const pilarDe = (l: LinhaMetrica) => (l.pillar_id ? pilarPorId.get(l.pillar_id) : null);

  return (
    <div className="cartao p-4">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <span className="rotulo">Ranking de posts do período</span>
      </div>

      <FiltrosTabelaPosts
        estado={{ ...estado, faixa, desc }}
        setEstado={setEstado}
        formatos={formatos}
        colunas={colunas}
        alternarColuna={alternarColuna}
        total={linhas.length}
        visiveis={filtradas.length}
        aoLimpar={limpar}
        temFiltro={temFiltro}
      />

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

      {def.indisponivel ? (
        <p className="mb-3 rounded-[.6rem] border border-alerta/30 bg-alerta/10 px-3 py-2 text-xs text-corpo">
          {def.rotulo}: a coleta atual ainda não traz esse dado — os valores aparecem como “—”.
        </p>
      ) : null}

      {ordenadas.length === 0 ? (
        <EstadoVazio
          variante="filtro"
          titulo={
            temFiltro
              ? "Nenhum post corresponde aos filtros."
              : "Sem leituras disponíveis para os posts do período."
          }
          {...(temFiltro
            ? {
                acao: (
                  <button type="button" onClick={limpar} className="btn px-3 py-1.5 text-xs">
                    limpar filtros
                  </button>
                ),
              }
            : {})}
        />
      ) : (
        <>
          {/* Mobile: cartões */}
          <ul className="space-y-2 sm:hidden">
            {ordenadas.map((l, i) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => abrir(l.id)}
                  className="w-full rounded-[.7rem] border border-line bg-card2 p-3 text-left transition-colors hover:border-lineForte"
                >
                  <div className="flex items-start gap-2">
                    <span className="numero shrink-0 text-xs text-muted">#{i + 1}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <IconeFormato formato={l.format} />
                        <span className="line-clamp-2 text-sm text-txt">{l.title}</span>
                      </span>
                      <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[.68rem] text-muted">
                        {l.conta ? (
                          <span className="pill bg-azure/14 text-azureClaro">@{l.conta}</span>
                        ) : null}
                        <span>{rotuloFormato(l.format)}</span>
                      </span>
                    </span>
                    <span className={"pill numero shrink-0 " + (classeRx(l.rx) || "text-corpo")}>
                      {l.rx === null ? "—" : `${numero(l.rx, 2)}×`}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center gap-3 text-xs">
                    <span className="rotulo">{def.rotulo}</span>
                    <span className="numero text-txt">{def.formata(def.valor(l))}</span>
                    <BarraProporcao pct={((def.valor(l) ?? 0) / maxRank) * 100} />
                  </div>
                </button>
              </li>
            ))}
          </ul>

          {/* Desktop: tabela */}
          <div className="hidden overflow-x-auto sm:block">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-line">
                  <th className="rotulo w-10 py-2 pr-2 text-left font-normal">#</th>
                  <th className="rotulo py-2 pr-3 text-left font-normal">Post</th>
                  <th className="rotulo py-2 pr-3 text-right font-normal text-azureClaro">
                    {def.rotulo}
                  </th>
                  {colunasVisiveis.map((c) => (
                    <th key={c} className="rotulo py-2 pr-3 text-right font-normal">
                      <button
                        type="button"
                        onClick={() => setEstado({ ranquear: c })}
                        className="rotulo transition-colors hover:text-corpo"
                      >
                        {defMetrica(c).rotulo}
                      </button>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ordenadas.map((l, i) => {
                  const pilar = pilarDe(l);
                  return (
                    <tr
                      key={l.id}
                      onClick={() => abrir(l.id)}
                      className="cursor-pointer border-b border-line/50 border-l-2 border-l-transparent transition-colors hover:border-l-azure hover:bg-white/5"
                    >
                      <td className="numero py-3 pr-2 text-xs text-muted">
                        <span className={i < 3 ? "text-azureClaro" : ""}>#{i + 1}</span>
                      </td>
                      <td className="max-w-[360px] py-3 pr-3">
                        <span className="flex items-center gap-1.5">
                          <IconeFormato formato={l.format} />
                          <span className="truncate text-txt">{l.title}</span>
                        </span>
                        <span className="mt-1 flex flex-wrap items-center gap-1.5 text-[.68rem] text-muted">
                          {l.conta ? (
                            <span className="pill bg-azure/14 text-azureClaro">@{l.conta}</span>
                          ) : null}
                          <span>{rotuloFormato(l.format)}</span>
                          {pilar ? (
                            <span className="inline-flex items-center gap-1">
                              <span
                                className="h-1.5 w-1.5 rounded-full"
                                style={{ background: pilar.color ?? "#8294ab" }}
                              />
                              {pilar.name}
                            </span>
                          ) : null}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right">
                        <span className="inline-flex items-center justify-end gap-2">
                          <BarraProporcao pct={((def.valor(l) ?? 0) / maxRank) * 100} />
                          <span className="numero text-txt">{def.formata(def.valor(l))}</span>
                          {estado.ranquear === "rx" && ehOutlier(l.rx) ? (
                            <SeloOutlier rx={l.rx ?? 0} />
                          ) : null}
                        </span>
                      </td>
                      {colunasVisiveis.map((c) => {
                        const d = defMetrica(c);
                        const v = d.valor(l);
                        return (
                          <td
                            key={c}
                            className={
                              "numero py-3 pr-3 text-right " +
                              (c === "rx" ? (classeRx(l.rx) || "text-corpo") : "text-corpo")
                            }
                          >
                            {d.formata(v)}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

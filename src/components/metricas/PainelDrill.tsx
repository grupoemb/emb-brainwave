import { useMemo } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Table2 } from "lucide-react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  calcularTaxas,
  classeRx,
  ehOutlier,
  filtrarPorRecorte,
  numero,
  rotuloFormato,
  rotuloRecorte,
  type LinhaMetrica,
  type Recorte,
} from "@/lib/metricas";

function data(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-[.6rem] border border-line bg-white/[.03] px-3 py-2">
      <span className="rotulo text-[.6rem]">{rotulo}</span>
      <p className="numero mt-0.5 text-base text-txt">{valor}</p>
    </div>
  );
}

export function PainelDrill({
  recorte,
  linhas,
  aoFechar,
  aoVerNaTabela,
}: {
  recorte: Recorte | null;
  linhas: LinhaMetrica[];
  aoFechar: () => void;
  aoVerNaTabela: (r: Recorte) => void;
}) {
  const navigate = useNavigate();

  const { lista, taxas, rxMedio } = useMemo(() => {
    if (!recorte) return { lista: [] as LinhaMetrica[], taxas: null, rxMedio: null };
    const base = filtrarPorRecorte(linhas, recorte).sort(
      (a, b) => (b.reach ?? -1) - (a.reach ?? -1),
    );
    const rxs = base.filter((l) => l.rx !== null).map((l) => l.rx as number);
    return {
      lista: base,
      taxas: calcularTaxas(base),
      rxMedio: rxs.length ? rxs.reduce((s, v) => s + v, 0) / rxs.length : null,
    };
  }, [linhas, recorte]);

  return (
    <Sheet open={!!recorte} onOpenChange={(v) => (v ? null : aoFechar())}>
      <SheetContent
        side="right"
        className="w-full border-line bg-bg2 text-txt sm:max-w-[460px]"
      >
        <SheetHeader className="text-left">
          <span className="rotulo text-[.6rem]">detalhe do recorte</span>
          <SheetTitle className="text-base font-bold text-txt">
            {recorte ? rotuloRecorte(recorte) : ""}
          </SheetTitle>
        </SheetHeader>

        {lista.length === 0 ? (
          <div className="mt-5">
            <EstadoVazio
              titulo="Nenhum post neste recorte"
              descricao="Os filtros atuais do período não deixaram posts com leitura neste ponto do gráfico."
            />
          </div>
        ) : (
          <div className="mt-4 flex h-[calc(100%-5.5rem)] flex-col">
            <div className="grid grid-cols-2 gap-2">
              <Resumo rotulo="posts" valor={String(lista.length)} />
              <Resumo rotulo="alcance total" valor={numero(taxas?.alcance ?? null)} />
              <Resumo rotulo="alcance médio" valor={numero(taxas?.alcanceMedio ?? null)} />
              <Resumo
                rotulo="rx médio"
                valor={rxMedio === null ? "—" : `${numero(rxMedio, 2)}×`}
              />
            </div>

            <ul className="mt-4 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {lista.map((l) => (
                <li key={l.id}>
                  <button
                    type="button"
                    onClick={() => {
                      aoFechar();
                      navigate({
                        to: "/post/$id",
                        params: { id: l.id },
                        search: { origem: "metricas" },
                      });
                    }}
                    className="group w-full rounded-[.6rem] border border-line/70 bg-white/[.02] px-3 py-2 text-left transition-colors hover:border-azure/40 hover:bg-white/[.06]"
                  >
                    <div className="flex items-start gap-2">
                      <span className="line-clamp-2 flex-1 text-sm text-txt">{l.title}</span>
                      <ArrowUpRight
                        size={13}
                        className="mt-0.5 shrink-0 text-muted transition-colors group-hover:text-azureClaro"
                        aria-hidden
                      />
                    </div>
                    <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[.68rem] text-muted">
                      <span>{l.conta ? `@${l.conta}` : "—"}</span>
                      <span aria-hidden>·</span>
                      <span>{rotuloFormato(l.format)}</span>
                      <span aria-hidden>·</span>
                      <span className="numero">{data(l.published_at)}</span>
                      <span aria-hidden>·</span>
                      <span className="numero text-corpo">{numero(l.reach)} alc.</span>
                      <span className={"pill numero ml-auto text-[.66rem] " + classeRx(l.rx)}>
                        {l.rx === null ? "—" : `${numero(l.rx, 2)}×`}
                      </span>
                      {ehOutlier(l.rx) ? (
                        <Flame
                          size={12}
                          color="#f6bd24"
                          aria-hidden
                          className="shrink-0"
                        />
                      ) : null}
                    </div>
                  </button>
                </li>
              ))}
            </ul>

            <button
              type="button"
              onClick={() => recorte && aoVerNaTabela(recorte)}
              className="btn mt-3 flex w-full items-center justify-center gap-1.5 py-2 text-xs"
            >
              <Table2 size={13} aria-hidden />
              Ver na tabela de posts
            </button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

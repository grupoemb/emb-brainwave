import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ArrowUpRight, Flame, Table2 } from "lucide-react";

import { EstadoVazio } from "@/components/ui/EstadoVazio";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  classeRx,
  classeVariacao,
  ehOutlier,
  filtrarPorRecorte,
  numero,
  resumoRecorte,
  rotuloFormato,
  rotuloRecorte,
  textoVariacao,
  variacao,
  type LinhaMetrica,
  type Recorte,
  type ResumoRecorte,
} from "@/lib/metricas";

type Modo = "off" | "periodo" | "conta";

function data(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

const LINHAS_RESUMO: {
  chave: keyof ResumoRecorte;
  rotulo: string;
  fmt: (v: number | null) => string;
}[] = [
  { chave: "posts", rotulo: "posts", fmt: (v) => (v === null ? "—" : String(v)) },
  { chave: "alcance", rotulo: "alcance", fmt: (v) => numero(v) },
  { chave: "alcanceMedio", rotulo: "alcance médio", fmt: (v) => numero(v) },
  { chave: "rxMedio", rotulo: "rx médio", fmt: (v) => (v === null ? "—" : `${numero(v, 2)}×`) },
  {
    chave: "engajamento",
    rotulo: "engajamento",
    fmt: (v) => (v === null ? "—" : `${numero(v, 1)}%`),
  },
  { chave: "interacoes", rotulo: "interações", fmt: (v) => numero(v) },
];

function Resumo({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="rounded-[.6rem] border border-line bg-white/[.03] px-3 py-2">
      <span className="rotulo text-[.6rem]">{rotulo}</span>
      <p className="numero mt-0.5 text-base text-txt">{valor}</p>
    </div>
  );
}

function Chip({
  ativo,
  desativado,
  title,
  onClick,
  children,
}: {
  ativo: boolean;
  desativado?: boolean | undefined;
  title?: string | undefined;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      title={title}
      disabled={desativado}
      onClick={onClick}
      className={
        "rounded-full border px-2.5 py-1 text-[.68rem] transition-colors " +
        (desativado
          ? "cursor-not-allowed border-line/60 text-muted/60"
          : ativo
            ? "border-azure/45 bg-azure/[.14] font-semibold text-txt"
            : "border-line text-muted hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

function ListaPosts({
  lista,
  aoAbrir,
  vazio,
}: {
  lista: LinhaMetrica[];
  aoAbrir: (id: string) => void;
  vazio: string;
}) {
  if (!lista.length) {
    return (
      <p className="rounded-[.6rem] border border-dashed border-line px-3 py-6 text-center text-xs text-muted">
        {vazio}
      </p>
    );
  }
  return (
    <ul className="space-y-1.5">
      {lista.map((l) => (
        <li key={l.id}>
          <button
            type="button"
            onClick={() => aoAbrir(l.id)}
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
                <Flame size={12} color="#f6bd24" aria-hidden className="shrink-0" />
              ) : null}
            </div>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function PainelDrill({
  recorte,
  linhas,
  linhasComparadas,
  rotuloPeriodo,
  rotuloComparacao,
  contas = [],
  contaAtual = "todas",
  aoFechar,
  aoVerNaTabela,
}: {
  recorte: Recorte | null;
  linhas: LinhaMetrica[];
  linhasComparadas?: LinhaMetrica[] | null;
  rotuloPeriodo?: string;
  rotuloComparacao?: string;
  contas?: string[];
  contaAtual?: string;
  aoFechar: () => void;
  aoVerNaTabela: (r: Recorte) => void;
}) {
  const navigate = useNavigate();
  const [modo, setModo] = useState<Modo>("off");
  const [contaB, setContaB] = useState<string>("");
  const [ladoLista, setLadoLista] = useState<"a" | "b">("a");

  // Recortes de conta comparam contas por natureza; período por dia não tem par.
  const recorteDeConta = recorte?.tipo === "dimensao" && recorte.dimensao === "conta";
  const periodoIndisponivel = !linhasComparadas?.length || recorte?.tipo === "dia";
  const contasOutras = useMemo(
    () => contas.filter((c) => c !== (recorteDeConta ? (recorte as { chave: string }).chave : "")),
    [contas, recorteDeConta, recorte],
  );

  useEffect(() => {
    setModo("off");
    setLadoLista("a");
  }, [recorte]);

  useEffect(() => {
    if (modo === "conta" && !contaB) setContaB(contasOutras[0] ?? "");
  }, [modo, contaB, contasOutras]);

  const contaBase = recorteDeConta
    ? (recorte as { chave: string }).chave
    : contaAtual !== "todas"
      ? contaAtual
      : null;

  const { listaA, listaB, resA, resB, rotuloA, rotuloB } = useMemo(() => {
    const vazio = {
      listaA: [] as LinhaMetrica[],
      listaB: [] as LinhaMetrica[],
      resA: null as ResumoRecorte | null,
      resB: null as ResumoRecorte | null,
      rotuloA: "",
      rotuloB: "",
    };
    if (!recorte) return vazio;

    const ordenar = (ls: LinhaMetrica[]) =>
      [...ls].sort((a, b) => (b.reach ?? -1) - (a.reach ?? -1));

    const a = ordenar(filtrarPorRecorte(linhas, recorte));

    let b: LinhaMetrica[] = [];
    let rB = "";
    if (modo === "periodo") {
      b = ordenar(filtrarPorRecorte(linhasComparadas ?? [], recorte));
      rB = rotuloComparacao ?? "período anterior";
    } else if (modo === "conta" && contaB) {
      const semConta: Recorte =
        recorteDeConta && recorte.tipo === "dimensao"
          ? { ...recorte, chave: contaB, rotulo: `@${contaB}` }
          : recorte;
      b = ordenar(filtrarPorRecorte(linhas, semConta).filter((l) => l.conta === contaB));
      rB = `@${contaB}`;
    }

    return {
      listaA: a,
      listaB: b,
      resA: resumoRecorte(a),
      resB: modo === "off" ? null : resumoRecorte(b),
      rotuloA:
        modo === "conta"
          ? contaBase
            ? `@${contaBase}`
            : "todas as contas"
          : (rotuloPeriodo ?? "período atual"),
      rotuloB: rB,
    };
  }, [
    linhas,
    linhasComparadas,
    recorte,
    modo,
    contaB,
    recorteDeConta,
    rotuloComparacao,
    rotuloPeriodo,
    contaBase,
  ]);

  const abrirPost = (id: string) => {
    aoFechar();
    void navigate({ to: "/post/$id", params: { id }, search: { origem: "metricas" } });
  };

  const comparando = modo !== "off" && !!resB;

  return (
    <Sheet open={!!recorte} onOpenChange={(v) => (v ? null : aoFechar())}>
      <SheetContent
        side="right"
        className="w-full border-line bg-bg2 text-txt sm:max-w-[560px]"
      >
        <SheetHeader className="text-left">
          <span className="rotulo text-[.6rem]">detalhe do recorte</span>
          <SheetTitle className="text-base font-bold text-txt">
            {recorte ? rotuloRecorte(recorte) : ""}
          </SheetTitle>
        </SheetHeader>

        {listaA.length === 0 && !comparando ? (
          <div className="mt-5">
            <EstadoVazio
              titulo="Nenhum post neste recorte"
              descricao="Os filtros atuais do período não deixaram posts com leitura neste ponto do gráfico."
            />
          </div>
        ) : (
          <div className="mt-4 flex h-[calc(100%-5.5rem)] flex-col">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rotulo text-[.6rem]">comparar</span>
              <Chip ativo={modo === "off"} onClick={() => setModo("off")}>
                Desligado
              </Chip>
              <Chip
                ativo={modo === "periodo"}
                desativado={periodoIndisponivel}
                title={
                  periodoIndisponivel
                    ? recorte?.tipo === "dia"
                      ? "Um dia específico não tem par no período comparado"
                      : "Ative a comparação no filtro de período"
                    : undefined
                }
                onClick={() => setModo("periodo")}
              >
                Período anterior
              </Chip>
              <Chip
                ativo={modo === "conta"}
                desativado={contasOutras.length === 0}
                title={contasOutras.length === 0 ? "Só há uma conta no período" : undefined}
                onClick={() => setModo("conta")}
              >
                Outro canal
              </Chip>
              {modo === "conta" && contasOutras.length > 0 ? (
                <select
                  value={contaB}
                  onChange={(e) => setContaB(e.target.value)}
                  aria-label="Canal comparado"
                  className="rounded-full border border-line bg-white/[.04] px-2.5 py-1 text-[.68rem] text-corpo outline-none focus-visible:border-azure/50"
                >
                  {contasOutras.map((c) => (
                    <option key={c} value={c} className="bg-bg2">
                      @{c}
                    </option>
                  ))}
                </select>
              ) : null}
            </div>

            {comparando ? (
              <div className="mt-3 rounded-[.7rem] border border-line bg-white/[.03]">
                <div className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-line px-3 py-2 text-[.66rem]">
                  <span className="rotulo text-[.6rem]">métrica</span>
                  <span className="rotulo text-right text-[.6rem] text-azureClaro">
                    {rotuloA}
                  </span>
                  <span className="rotulo min-w-[7.5rem] text-right text-[.6rem]">
                    {rotuloB}
                  </span>
                </div>
                {LINHAS_RESUMO.map(({ chave, rotulo, fmt }) => {
                  const va = (resA?.[chave] ?? null) as number | null;
                  const vb = (resB?.[chave] ?? null) as number | null;
                  const v = variacao(va, vb);
                  return (
                    <div
                      key={chave}
                      className="grid grid-cols-[1fr_auto_auto] items-center gap-x-3 border-b border-line/50 px-3 py-1.5 last:border-b-0"
                    >
                      <span className="text-[.72rem] text-muted">{rotulo}</span>
                      <span className="numero text-right text-sm text-txt">{fmt(va)}</span>
                      <span className="flex min-w-[7.5rem] items-center justify-end gap-1.5">
                        <span className="numero text-sm text-corpo">{fmt(vb)}</span>
                        <span
                          className={
                            "pill numero text-[.62rem] " +
                            (v === null ? "text-muted" : classeVariacao(v))
                          }
                        >
                          {textoVariacao(v)}
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="mt-3 grid grid-cols-2 gap-2">
                <Resumo rotulo="posts" valor={String(listaA.length)} />
                <Resumo rotulo="alcance total" valor={numero(resA?.alcance ?? null)} />
                <Resumo rotulo="alcance médio" valor={numero(resA?.alcanceMedio ?? null)} />
                <Resumo
                  rotulo="rx médio"
                  valor={
                    resA?.rxMedio == null ? "—" : `${numero(resA.rxMedio, 2)}×`
                  }
                />
              </div>
            )}

            {comparando ? (
              <div className="mt-3 flex items-center gap-1.5">
                <Chip ativo={ladoLista === "a"} onClick={() => setLadoLista("a")}>
                  {rotuloA} · {listaA.length}
                </Chip>
                <Chip ativo={ladoLista === "b"} onClick={() => setLadoLista("b")}>
                  {rotuloB} · {listaB.length}
                </Chip>
              </div>
            ) : null}

            <div className="mt-3 flex-1 overflow-y-auto pr-1">
              <ListaPosts
                lista={comparando && ladoLista === "b" ? listaB : listaA}
                aoAbrir={abrirPost}
                vazio={
                  comparando && ladoLista === "b"
                    ? "Sem posts neste recorte no lado comparado."
                    : "Sem posts neste recorte."
                }
              />
            </div>

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

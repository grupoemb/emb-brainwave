import { useEffect, useRef, useState, type ReactNode } from "react";
import { HelpCircle, Minus, TrendingDown, TrendingUp } from "lucide-react";

import { Esqueleto } from "@/components/conteudo/Esqueleto";
import { ACENTO, type Familia } from "@/components/metricas/GrupoKpis";
import { Sparkline } from "@/components/metricas/Sparkline";
import { classeVariacao, numero, textoVariacao, variacao } from "@/lib/metricas";

function reduzido() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Contagem animada de 0,9s. */
function useContagem(alvo: number | null) {
  const [valor, setValor] = useState(alvo ?? 0);
  const anterior = useRef(0);

  useEffect(() => {
    if (alvo === null) return;
    if (reduzido()) {
      setValor(alvo);
      anterior.current = alvo;
      return;
    }
    const de = anterior.current;
    const inicio = performance.now();
    let raf = 0;
    const passo = (t: number) => {
      const p = Math.min(1, (t - inicio) / 900);
      const e = 1 - Math.pow(1 - p, 3);
      setValor(de + (alvo - de) * e);
      if (p < 1) raf = requestAnimationFrame(passo);
      else anterior.current = alvo;
    };
    raf = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(raf);
  }, [alvo]);

  return valor;
}

function Seta({ delta }: { delta: number | null }) {
  if (delta === null || delta === 0) return <Minus size={11} aria-hidden />;
  return delta > 0 ? <TrendingUp size={11} aria-hidden /> : <TrendingDown size={11} aria-hidden />;
}

export function CartaoKpi({
  rotulo,
  valor,
  texto,
  sufixo,
  casas = 0,
  formula,
  carregando,
  valorAnterior,
  textoAnterior,
  comparando,
  rotuloComparacao,
  aoClicar,
  ativo,
  dicaAcao,
  familia = "alcance",
  icone,
  destaque,
  serie,
  participacao,
}: {
  rotulo: string;
  /** valor numérico animado; null = sem base */
  valor?: number | null;
  /** valor textual (não anima) */
  texto?: string | null;
  sufixo?: string;
  casas?: number;
  formula: string;
  carregando?: boolean;
  /** valor do período comparado (undefined = comparação desligada) */
  valorAnterior?: number | null | undefined;
  textoAnterior?: string | null | undefined;
  comparando?: boolean | undefined;
  rotuloComparacao?: string | undefined;
  /** torna o cartão clicável (alterna um modo de leitura) */
  aoClicar?: (() => void) | undefined;
  ativo?: boolean | undefined;
  dicaAcao?: string | undefined;
  /** cor de acento */
  familia?: Familia;
  icone?: ReactNode;
  /** cartão principal do grupo: ocupa 2 colunas e número maior */
  destaque?: boolean;
  /** série curta para sparkline de tendência */
  serie?: { valor: number }[] | undefined;
  /** participação percentual dentro do grupo (mini barra) */
  participacao?: number | null | undefined;
}) {
  const numerico = typeof valor === "number" ? valor : null;
  const animado = useContagem(numerico);
  const comparaNumero = valorAnterior !== undefined;
  const comparaTexto = textoAnterior !== undefined;
  const delta = comparaNumero ? variacao(numerico, valorAnterior ?? null) : null;
  const acento = ACENTO[familia];

  const conteudo = carregando ? null : texto !== undefined ? (
    texto === null ? (
      <span className="text-muted">—</span>
    ) : (
      texto
    )
  ) : numerico === null ? (
    <span className="text-muted">—</span>
  ) : (
    <>
      {animado.toLocaleString("pt-BR", {
        minimumFractionDigits: casas,
        maximumFractionDigits: casas,
      })}
      {sufixo ? <span className="text-corpo">{sufixo}</span> : null}
    </>
  );

  const clicavel = typeof aoClicar === "function";
  const Elemento = (clicavel ? "button" : "div") as "button" | "div";

  return (
    <Elemento
      {...(clicavel
        ? { type: "button" as const, onClick: aoClicar, "aria-pressed": !!ativo }
        : {})}
      style={{ "--acento": acento } as React.CSSProperties}
      className={
        "cartao-acento group relative flex flex-col justify-between p-3.5 text-left " +
        (destaque ? "min-h-[7.6rem] sm:col-span-2 " : "min-h-[6.4rem] ") +
        (clicavel ? "cursor-pointer transition-shadow hover:shadow-[var(--sombra-2)] " : "") +
        (ativo ? "ring-1 ring-inset ring-[var(--acento)]" : "")
      }
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          {icone ? <span className="pastilha">{icone}</span> : null}
          <span className="rotulo truncate">{rotulo}</span>
        </div>
        <HelpCircle
          size={13}
          className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      {carregando ? (
        <Esqueleto className="h-7 w-24 rounded" />
      ) : (
        <div className={"numero mt-2 text-txt " + (destaque ? "text-3xl sm:text-4xl" : "text-2xl")}>
          {conteudo}
        </div>
      )}

      {serie && serie.length > 1 ? (
        <div className="-mx-1 mt-1 opacity-80">
          <Sparkline dados={serie} cor={acento === "var(--dourado)" ? "#f2c14e" : acento === "var(--cyan)" ? "#00e7ff" : "#00a4ff"} altura={destaque ? 40 : 26} />
        </div>
      ) : null}

      {typeof participacao === "number" ? (
        <div className="mt-2">
          <div className="barra-trilho">
            <div
              className="h-full rounded-full transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(2, Math.min(100, participacao))}%`,
                background: acento,
              }}
            />
          </div>
          <p className="mt-1 text-[.65rem] text-muted">
            {participacao.toFixed(1)}% das interações
          </p>
        </div>
      ) : null}

      {comparaNumero || comparaTexto ? (
        <div className="mt-1.5 flex items-center gap-1.5 text-[.7rem]">
          {comparando ? (
            <Esqueleto className="h-3.5 w-24 rounded" />
          ) : comparaNumero ? (
            <>
              <span className={"pill inline-flex items-center gap-1 " + classeVariacao(delta)}>
                <Seta delta={delta} />
                {textoVariacao(delta)}
              </span>
              <span className="text-muted">
                antes {numero(valorAnterior ?? null, casas)}
                {valorAnterior !== null && sufixo ? sufixo : ""}
              </span>
            </>
          ) : textoAnterior && textoAnterior !== texto ? (
            <span className="text-muted">antes {textoAnterior}</span>
          ) : (
            <span className="text-muted">sem mudança</span>
          )}
        </div>
      ) : null}

      <span
        role="tooltip"
        className="pointer-events-none absolute inset-x-2 bottom-2 z-10 rounded-[.5rem] border border-line-forte bg-card2 px-2.5 py-1.5 text-[.7rem] leading-snug text-corpo opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        {formula}
        {rotuloComparacao ? ` Comparado com ${rotuloComparacao}.` : ""}
        {dicaAcao ? ` ${dicaAcao}` : ""}
      </span>
    </Elemento>
  );
}

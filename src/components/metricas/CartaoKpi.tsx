import { useEffect, useRef, useState } from "react";
import { HelpCircle } from "lucide-react";

import { Esqueleto } from "@/components/conteudo/Esqueleto";

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
  valorAnterior?: number | null;
  textoAnterior?: string | null;
  comparando?: boolean;
  rotuloComparacao?: string;
}) {
  const numerico = typeof valor === "number" ? valor : null;
  const animado = useContagem(numerico);
  const comparaNumero = valorAnterior !== undefined;
  const comparaTexto = textoAnterior !== undefined;
  const delta = comparaNumero ? variacao(numerico, valorAnterior ?? null) : null;



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

  return (
    <div className="cartao group relative flex min-h-[5.9rem] flex-col justify-between p-3.5">
      <div className="flex items-start justify-between gap-2">
        <span className="rotulo">{rotulo}</span>
        <HelpCircle
          size={13}
          className="shrink-0 text-muted opacity-0 transition-opacity group-hover:opacity-100"
          aria-hidden
        />
      </div>

      {carregando ? (
        <Esqueleto className="h-7 w-24 rounded" />
      ) : (
        <div className="numero text-2xl text-txt">{conteudo}</div>
      )}

      <span
        role="tooltip"
        className="pointer-events-none absolute inset-x-2 bottom-2 z-10 rounded-[.5rem] border border-line-forte bg-card2 px-2.5 py-1.5 text-[.7rem] leading-snug text-corpo opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
      >
        {formula}
      </span>
    </div>
  );
}

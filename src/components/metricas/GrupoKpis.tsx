import type { ReactNode } from "react";

export type Familia = "alcance" | "interacao" | "eficiencia";

export const ACENTO: Record<Familia, string> = {
  alcance: "var(--azure)",
  interacao: "var(--cyan)",
  eficiencia: "var(--dourado)",
};

/** Bloco de KPIs com título, cor de acento própria e grade interna. */
export function GrupoKpis({
  familia,
  titulo,
  descricao,
  children,
  colunas = "grid-cols-2 lg:grid-cols-4",
}: {
  familia: Familia;
  titulo: string;
  descricao?: string;
  children: ReactNode;
  colunas?: string;
}) {
  return (
    <section style={{ "--acento": ACENTO[familia] } as React.CSSProperties}>
      <div className="mb-2 flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span
          className="h-[3px] w-7 rounded-full"
          style={{ background: ACENTO[familia] }}
          aria-hidden
        />
        <h3 className="titulo-grupo">{titulo}</h3>
        {descricao ? <p className="text-[.72rem] text-muted">{descricao}</p> : null}
      </div>
      <div className={"grid gap-3 " + colunas}>{children}</div>
    </section>
  );
}

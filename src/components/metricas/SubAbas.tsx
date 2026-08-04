export type Aba = "geral" | "conteudo" | "ritmo" | "contas" | "benchmark";

export const ABAS: { valor: Aba; rotulo: string }[] = [
  { valor: "geral", rotulo: "Visão geral" },
  { valor: "conteudo", rotulo: "Conteúdo" },
  { valor: "ritmo", rotulo: "Ritmo & horários" },
  { valor: "contas", rotulo: "Contas" },
  { valor: "benchmark", rotulo: "Benchmark" },
];

export function SubAbas({ aba, setAba }: { aba: Aba; setAba: (a: Aba) => void }) {
  return (
    <div
      role="tablist"
      aria-label="Seções de métricas"
      className="flex flex-wrap items-center gap-1.5"
    >
      {ABAS.map((a) => (
        <button
          key={a.valor}
          role="tab"
          type="button"
          aria-selected={aba === a.valor}
          onClick={() => setAba(a.valor)}
          className={
            "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
            (aba === a.valor
              ? "border-azure/40 bg-azure/14 font-semibold text-txt"
              : "border-line text-muted hover:text-corpo")
          }
        >
          {a.rotulo}
        </button>
      ))}
    </div>
  );
}

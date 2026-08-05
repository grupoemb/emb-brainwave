import { numero } from "@/lib/metricas";

export type Faixas = {
  /** valor a partir do qual é "alerta" (ou até o qual, se invertido) */
  alerta: number;
  /** valor a partir do qual é "bom" (ou até o qual, se invertido) */
  bom: number;
  /** teto do arco */
  max: number;
  /** quando true, menor é melhor */
  invertido?: boolean;
};

const CORES = {
  ruim: "var(--ruim)",
  alerta: "var(--alerta)",
  bom: "var(--bom)",
} as const;

export function faixaDe(valor: number | null, f: Faixas): keyof typeof CORES | null {
  if (valor === null || !Number.isFinite(valor)) return null;
  if (f.invertido) {
    if (valor <= f.bom) return "bom";
    if (valor <= f.alerta) return "alerta";
    return "ruim";
  }
  if (valor >= f.bom) return "bom";
  if (valor >= f.alerta) return "alerta";
  return "ruim";
}

const R = 42;
const CIRC = Math.PI * R; // meia volta

/** Medidor em arco (semicírculo) com cor de faixa. */
export function Medidor({
  rotulo,
  valor,
  faixas,
  sufixo,
  casas = 0,
  dica,
}: {
  rotulo: string;
  valor: number | null;
  faixas: Faixas;
  sufixo?: string;
  casas?: number;
  dica?: string;
}) {
  const faixa = faixaDe(valor, faixas);
  const cor = faixa ? CORES[faixa] : "var(--muted)";
  const pct = valor === null ? 0 : Math.max(0, Math.min(1, valor / faixas.max));

  return (
    <div className="flex min-w-0 flex-col items-center gap-1" title={dica}>
      <svg viewBox="0 0 100 56" className="h-[52px] w-[92px]" aria-hidden>
        <path
          d={`M 8 50 A ${R} ${R} 0 0 1 92 50`}
          fill="none"
          stroke="rgba(255,255,255,.08)"
          strokeWidth={8}
          strokeLinecap="round"
        />
        <path
          d={`M 8 50 A ${R} ${R} 0 0 1 92 50`}
          fill="none"
          stroke={cor}
          strokeWidth={8}
          strokeLinecap="round"
          strokeDasharray={`${(pct * CIRC).toFixed(2)} ${CIRC.toFixed(2)}`}
          className="transition-[stroke-dasharray] duration-700 ease-out"
        />
      </svg>
      <p className="numero -mt-4 text-base" style={{ color: cor }}>
        {valor === null ? <span className="text-muted">—</span> : numero(valor, casas)}
        {valor !== null && sufixo ? <span className="text-corpo">{sufixo}</span> : null}
      </p>
      <p className="rotulo text-center text-[.62rem] leading-tight">{rotulo}</p>
    </div>
  );
}

export function AnelProgresso({
  pct,
  cor,
  tamanho = 96,
}: {
  pct: number;
  cor: string;
  tamanho?: number;
}) {
  const raio = (tamanho - 10) / 2;
  const volta = 2 * Math.PI * raio;
  const preenchido = Math.max(0, Math.min(1, pct));

  return (
    <svg width={tamanho} height={tamanho} viewBox={`0 0 ${tamanho} ${tamanho}`} aria-hidden="true">
      <circle
        cx={tamanho / 2}
        cy={tamanho / 2}
        r={raio}
        fill="none"
        stroke="rgba(148,163,184,.18)"
        strokeWidth={8}
      />
      <circle
        cx={tamanho / 2}
        cy={tamanho / 2}
        r={raio}
        fill="none"
        stroke={cor}
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={`${volta * preenchido} ${volta}`}
        transform={`rotate(-90 ${tamanho / 2} ${tamanho / 2})`}
      />
      <text
        x="50%"
        y="50%"
        dominantBaseline="central"
        textAnchor="middle"
        className="numero"
        fontSize={tamanho / 4.4}
        fill="#e9eef7"
      >
        {Math.round(pct * 100)}%
      </text>
    </svg>
  );
}

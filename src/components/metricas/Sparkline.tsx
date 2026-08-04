/** Mini gráfico de tendência, sem eixos nem interação. */
export function Sparkline({
  dados,
  cor = "#00a4ff",
  altura = 34,
}: {
  dados: { valor: number }[];
  cor?: string;
  altura?: number;
}) {
  const valores = dados.map((d) => d.valor);
  if (valores.length < 2) return <div style={{ height: altura }} aria-hidden />;

  const max = Math.max(...valores, 1);
  const passo = 100 / (valores.length - 1);
  const pontos = valores.map((v, i) => `${(i * passo).toFixed(2)},${(100 - (v / max) * 100).toFixed(2)}`);
  const linha = `M ${pontos.join(" L ")}`;
  const area = `${linha} L 100,100 L 0,100 Z`;
  const id = `spark-${cor.replace("#", "")}`;

  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ height: altura }}
      className="w-full"
      aria-hidden
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={cor} stopOpacity={0.3} />
          <stop offset="100%" stopColor={cor} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#${id})`} />
      <path d={linha} fill="none" stroke={cor} strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

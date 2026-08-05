import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const eixo = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fill: "#8294ab", fontSize: 11 },
};

export function GraficoAlcance({
  dados,
  acumulado,
  onToggle,
  aoSelecionar,
}: {
  dados: { dia: string; alcance: number; acumulado: number }[];
  acumulado: boolean;
  onToggle: () => void;
  aoSelecionar?: (dia: string) => void;
}) {
  return (
    <div className="cartao p-4 lg:col-span-2">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="rotulo">Alcance por dia</span>

        <button
          type="button"
          onClick={onToggle}
          className={
            "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
            (acumulado
              ? "border-azure/40 bg-azure/14 font-semibold text-txt"
              : "border-line text-muted hover:text-corpo")
          }
        >
          Acumulado
        </button>
      </div>

      <div className="h-[260px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={dados}
            margin={{ top: 6, right: 6, bottom: 0, left: -12 }}
            className={aoSelecionar ? "cursor-pointer" : ""}
            onClick={(e: unknown) => {
              const rotulo = (e as { activeLabel?: string } | null)?.activeLabel;
              if (aoSelecionar && rotulo) aoSelecionar(rotulo);
            }}
          >

            <defs>
              <linearGradient id="gradAlcance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a4ff" stopOpacity={0.34} />
                <stop offset="100%" stopColor="#00a4ff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,.12)" />
            <XAxis dataKey="dia" {...eixo} minTickGap={24} />
            <YAxis {...eixo} width={56} />
            <Tooltip
              cursor={{ stroke: "rgba(148,163,184,.3)" }}
              contentStyle={{
                background: "#16223a",
                border: "1px solid rgba(148,163,184,.3)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#8294ab" }}
              itemStyle={{ color: "#e9eef7" }}
              formatter={(v: number) => [v.toLocaleString("pt-BR"), "Alcance"]}
            />
            <Area
              type="monotone"
              dataKey={acumulado ? "acumulado" : "alcance"}
              stroke="#00a4ff"
              strokeWidth={2}
              fill="url(#gradAlcance)"
              dot={false}
              activeDot={{ r: 3.5 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

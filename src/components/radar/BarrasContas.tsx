import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { compacto } from "@/lib/contas";

const eixo = {
  axisLine: false as const,
  tickLine: false as const,
  tick: { fill: "#8294ab", fontSize: 11 },
};

export function BarrasContas({
  titulo,
  dados,
  cor,
  id,
  sufixo = "",
  casas = 0,
}: {
  titulo: string;
  dados: { rotulo: string; valor: number }[];
  cor: string;
  id: string;
  sufixo?: string;
  casas?: number;
}) {
  const lista = [...dados].sort((a, b) => b.valor - a.valor);

  return (
    <div className="cartao p-4">
      <span className="rotulo">{titulo}</span>

      <div className="mt-3 h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={lista} margin={{ top: 6, right: 6, bottom: 0, left: -12 }}>
            <defs>
              <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity={0.95} />
                <stop offset="100%" stopColor={cor} stopOpacity={0.25} />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke="rgba(148,163,184,.12)" />
            <XAxis dataKey="rotulo" {...eixo} interval={0} />
            <YAxis
              {...eixo}
              width={56}
              tickFormatter={(v: number) => (casas ? String(v) : compacto(v))}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,.08)" }}
              contentStyle={{
                background: "#16223a",
                border: "1px solid rgba(148,163,184,.30)",
                borderRadius: ".6rem",
                fontSize: 12,
              }}
              labelStyle={{ color: "#e9eef7" }}
              itemStyle={{ color: "#b9c6d8" }}
              formatter={(v: number | string) => [
                `${Number(v).toLocaleString("pt-BR", {
                  minimumFractionDigits: casas,
                  maximumFractionDigits: casas,
                })}${sufixo}`,
                titulo,
              ]}
            />
            <Bar dataKey="valor" radius={[6, 6, 0, 0]} maxBarSize={54}>
              {lista.map((d) => (
                <Cell key={d.rotulo} fill={`url(#${id})`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

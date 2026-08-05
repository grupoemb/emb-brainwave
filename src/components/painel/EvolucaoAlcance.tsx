import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { compacto, numero } from "@/lib/metricas";
import type { PontoSerie } from "@/lib/painel.tipos";

function rotuloDia(dia: string) {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

export function EvolucaoAlcance({ serie }: { serie: PontoSerie[] }) {
  const dados = serie.map((p) => ({ ...p, rotulo: rotuloDia(p.dia) }));

  return (
    <div className="cartao p-4 lg:col-span-2">
      <h2 className="rotulo mb-3">Alcance por dia</h2>
      <div className="h-[240px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="grad-alcance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a4ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00a4ff" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="rotulo"
              tick={{ fill: "#8294ab", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              minTickGap={24}
            />
            <YAxis
              tick={{ fill: "#8294ab", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(v: number) => compacto(v)}
            />
            <Tooltip
              contentStyle={{
                background: "#121b2d",
                border: "1px solid rgba(148,163,184,.3)",
                borderRadius: ".6rem",
                fontSize: 12,
              }}
              labelStyle={{ color: "#8294ab" }}
              formatter={(v: number) => [compacto(v), "alcance"]}
            />
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#00e7ff"
              strokeWidth={2}
              fill="url(#grad-alcance)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compacto } from "@/lib/metricas";
import { dataCurta, infoMetrica, type Meta } from "@/lib/metas";

/** Quanto cada semana entregou, contra o ritmo semanal necessário. */
export function RitmoSemanal({ meta }: { meta: Meta }) {
  const cor = infoMetrica(meta.metric).cor;
  const necessario = meta.required_run_rate * 7;
  const dados = meta.buckets.map((b) => ({ rotulo: dataCurta(b.semana), valor: b.valor }));

  if (dados.length === 0) return null;

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="rotulo">Ritmo por semana</h3>
        {necessario > 0 ? (
          <span className="text-[.66rem] text-muted">
            precisa de <span className="numero text-corpo">{compacto(necessario)}</span> por semana
          </span>
        ) : null}
      </div>
      <div style={{ height: 130 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={dados} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
            <XAxis
              dataKey="rotulo"
              tick={{ fill: "#8294ab", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#8294ab", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={54}
              tickFormatter={(v: number) => compacto(v)}
            />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,.08)" }}
              contentStyle={{
                background: "#121b2d",
                border: "1px solid rgba(148,163,184,.3)",
                borderRadius: ".6rem",
                fontSize: 12,
              }}
              labelStyle={{ color: "#8294ab" }}
              formatter={(v: number) => [compacto(v), "semana"]}
            />
            {necessario > 0 ? (
              <ReferenceLine y={necessario} stroke="rgba(148,163,184,.45)" strokeDasharray="2 4" />
            ) : null}
            <Bar dataKey="valor" radius={[4, 4, 0, 0]}>
              {dados.map((d, i) => (
                <Cell
                  key={i}
                  fill={cor}
                  fillOpacity={necessario > 0 && d.valor < necessario ? 0.35 : 0.95}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

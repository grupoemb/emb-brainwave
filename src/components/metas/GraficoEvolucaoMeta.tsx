import {
  Area,
  ComposedChart,
  CartesianGrid,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compacto } from "@/lib/metricas";
import { dataCurta, infoMetrica, type Meta } from "@/lib/metas";

type Ponto = {
  d: string;
  rotulo: string;
  real: number | null;
  meta: number;
  projecao: number | null;
};

/** Real (área) × Meta (linha tracejada) × Projeção (tracejado até o fim do prazo). */
export function GraficoEvolucaoMeta({ meta }: { meta: Meta }) {
  const cor = infoMetrica(meta.metric).cor;
  const ultimo = meta.serie[meta.serie.length - 1];

  const dados: Ponto[] = meta.serie.map((p, i) => ({
    d: p.d,
    rotulo: dataCurta(p.d),
    real: p.prog,
    meta: p.pace,
    projecao: i === meta.serie.length - 1 ? p.prog : null,
  }));

  if (ultimo && meta.end_date > ultimo.d) {
    dados.push({
      d: meta.end_date,
      rotulo: dataCurta(meta.end_date),
      real: null,
      meta: meta.effective_target,
      projecao: meta.projected,
    });
  }

  if (dados.length < 2) {
    return (
      <div className="grid h-[180px] place-items-center rounded-[.6rem] border border-dashed border-line text-xs text-muted">
        Ainda sem histórico suficiente para desenhar a evolução.
      </div>
    );
  }

  return (
    <div>
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <h3 className="rotulo">Evolução vs. meta</h3>
        <div className="flex items-center gap-3 text-[.66rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded-full" style={{ background: cor }} /> real
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded-full bg-white/30" /> meta
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded-full bg-alerta/70" /> projeção
          </span>
        </div>
      </div>

      <div style={{ height: 200 }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dados} margin={{ top: 6, right: 8, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id={`grad-meta-${meta.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={cor} stopOpacity={0.4} />
                <stop offset="100%" stopColor={cor} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(148,163,184,.12)" vertical={false} />
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
              formatter={(v: number, nome: string) => [compacto(v), nome]}
            />
            <ReferenceLine
              y={meta.effective_target}
              stroke="rgba(148,163,184,.45)"
              strokeDasharray="2 4"
              label={{
                value: `alvo ${compacto(meta.effective_target)}`,
                fill: "#8294ab",
                fontSize: 10,
                position: "insideTopRight",
              }}
            />
            <Area
              type="monotone"
              dataKey="real"
              name="real"
              stroke={cor}
              strokeWidth={2}
              fill={`url(#grad-meta-${meta.id})`}
              connectNulls
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="meta"
              name="meta"
              stroke="rgba(233,238,247,.35)"
              strokeWidth={1.6}
              strokeDasharray="4 4"
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="projecao"
              name="projeção"
              stroke="#f6bd24"
              strokeWidth={1.8}
              strokeDasharray="5 5"
              connectNulls
              dot={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

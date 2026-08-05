import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { compacto } from "@/lib/metricas";
import { diasForaDaCurva } from "@/lib/painel.leitura";
import type { PontoSerie } from "@/lib/painel.tipos";

function rotuloDia(dia: string) {
  const [, m, d] = dia.split("-");
  return `${d}/${m}`;
}

type PontoGrafico = {
  dia: string;
  rotulo: string;
  valor: number;
  anterior: number | null;
};

function PontoDestaque(props: {
  cx?: number;
  cy?: number;
  payload?: PontoGrafico;
  destaques: Set<string>;
}) {
  const { cx, cy, payload, destaques } = props;
  if (cx == null || cy == null || !payload || !destaques.has(payload.dia)) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill="#f6bd24" fillOpacity={0.18} />
      <circle cx={cx} cy={cy} r={3} fill="#f6bd24" stroke="#0a1020" strokeWidth={1.5} />
    </g>
  );
}

/** Gráfico âncora: alcance por dia com linha fantasma do período anterior. */
export function EvolucaoAlcance({
  serie,
  serieAnterior = [],
  altura = 260,
}: {
  serie: PontoSerie[];
  serieAnterior?: PontoSerie[];
  altura?: number;
}) {
  const dados: PontoGrafico[] = serie.map((p, i) => ({
    dia: p.dia,
    rotulo: rotuloDia(p.dia),
    valor: p.valor,
    anterior: serieAnterior[i]?.valor ?? null,
  }));
  const destaques = diasForaDaCurva(serie);
  const temAnterior = dados.some((d) => d.anterior !== null);

  return (
    <div className="cartao p-4">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="rotulo">Alcance por dia</h2>
        <div className="flex items-center gap-3 text-[.68rem] text-muted">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-[2px] w-4 rounded-full bg-cyan" /> período atual
          </span>
          {temAnterior ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-[2px] w-4 rounded-full bg-white/30" /> anterior
            </span>
          ) : null}
          {destaques.size > 0 ? (
            <span className="inline-flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-alerta" /> dia fora da curva
            </span>
          ) : null}
        </div>
      </div>

      <div style={{ height: altura }} className="w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={dados} margin={{ top: 6, right: 6, bottom: 0, left: -18 }}>
            <defs>
              <linearGradient id="grad-alcance" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00a4ff" stopOpacity={0.45} />
                <stop offset="100%" stopColor="#00a4ff" stopOpacity={0} />
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
              formatter={(v: number, nome: string) => [
                compacto(v),
                nome === "anterior" ? "período anterior" : "alcance",
              ]}
            />
            {temAnterior ? (
              <Area
                type="monotone"
                dataKey="anterior"
                stroke="rgba(233,238,247,.32)"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                fill="none"
                dot={false}
                activeDot={false}
                isAnimationActive={false}
              />
            ) : null}
            <Area
              type="monotone"
              dataKey="valor"
              stroke="#00e7ff"
              strokeWidth={2}
              fill="url(#grad-alcance)"
              dot={<PontoDestaque destaques={destaques} />}
              activeDot={{ r: 4, fill: "#00e7ff", stroke: "#0a1020", strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

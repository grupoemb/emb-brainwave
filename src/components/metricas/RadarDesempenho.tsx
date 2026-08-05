import {
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import type { Taxas } from "@/lib/metricas";

/** Referências de mercado (Instagram 2025) usadas como 100 no radar. */
const REFERENCIA = {
  engajamento: 3.5, // %
  salvamento: 0.8, // %
  compartilhamento: 0.9, // %
  acerto: 60, // %
  rx: 1.3, // ×
};

function normaliza(v: number | null, ref: number) {
  if (v === null || !Number.isFinite(v)) return 0;
  return Math.max(0, Math.min(140, (v / ref) * 100));
}

function eixos(taxas: Taxas | null, rxMedio: number | null) {
  return [
    { eixo: "Engajamento", v: normaliza(taxas?.engajamento ?? null, REFERENCIA.engajamento) },
    { eixo: "Salvamento", v: normaliza(taxas?.taxaSalvamento ?? null, REFERENCIA.salvamento) },
    {
      eixo: "Compartilh.",
      v: normaliza(taxas?.taxaCompartilhamento ?? null, REFERENCIA.compartilhamento),
    },
    { eixo: "Acerto", v: normaliza(taxas?.taxaAcerto ?? null, REFERENCIA.acerto) },
    { eixo: "rx médio", v: normaliza(rxMedio, REFERENCIA.rx) },
  ];
}

export function RadarDesempenho({
  taxas,
  rxMedio,
  taxasAnterior,
  rxMedioAnterior,
  rotuloComparacao,
}: {
  taxas: Taxas;
  rxMedio: number | null;
  taxasAnterior: Taxas | null;
  rxMedioAnterior: number | null;
  rotuloComparacao?: string | undefined;
}) {
  const atual = eixos(taxas, rxMedio);
  const antes = taxasAnterior ? eixos(taxasAnterior, rxMedioAnterior) : null;

  const dados = atual.map((a, i) => ({
    eixo: a.eixo,
    atual: Number(a.v.toFixed(1)),
    antes: antes ? Number((antes[i]?.v ?? 0).toFixed(1)) : undefined,
  }));

  return (
    <div className="cartao p-4">
      <span className="rotulo">Radar de desempenho</span>
      <p className="mt-1 text-xs text-muted">
        100 = referência de mercado do Instagram. Acima da linha, você está à frente.
      </p>

      <div className="mt-2 h-[248px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={dados} outerRadius="72%">
            <PolarGrid stroke="rgba(148,163,184,.16)" />
            <PolarAngleAxis dataKey="eixo" tick={{ fill: "#8294ab", fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 140]} tick={false} axisLine={false} />
            {antes ? (
              <Radar
                name={rotuloComparacao ?? "Período anterior"}
                dataKey="antes"
                stroke="#8294ab"
                strokeDasharray="3 3"
                fill="#8294ab"
                fillOpacity={0.08}
                isAnimationActive={false}
              />
            ) : null}
            <Radar
              name="Período atual"
              dataKey="atual"
              stroke="#00e7ff"
              strokeWidth={2}
              fill="#00a4ff"
              fillOpacity={0.22}
              isAnimationActive={false}
            />
            <Tooltip
              contentStyle={{
                background: "#16223a",
                border: "1px solid rgba(148,163,184,.3)",
                borderRadius: 8,
                fontSize: 12,
              }}
              labelStyle={{ color: "#8294ab" }}
              itemStyle={{ color: "#e9eef7" }}
              formatter={(v: number) => [`${v} / 100`, ""]}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-1 flex flex-wrap items-center gap-3 text-[.68rem] text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-2 rounded-full bg-cyan" aria-hidden /> período atual
        </span>
        {antes ? (
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted" aria-hidden />{" "}
            {rotuloComparacao ?? "anterior"}
          </span>
        ) : null}
      </div>
    </div>
  );
}

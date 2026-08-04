import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PALETA } from "@/lib/metricas";

export function DonutFormatos({ dados }: { dados: { nome: string; valor: number }[] }) {
  return (
    <div className="cartao p-4">
      <span className="rotulo">Posts por formato</span>

      <div className="mt-2 h-[200px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              innerRadius={50}
              outerRadius={80}
              stroke="none"
              isAnimationActive={false}
            >
              {dados.map((_, i) => (
                <Cell key={i} fill={PALETA[i % PALETA.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "#16223a",
                border: "1px solid rgba(148,163,184,.3)",
                borderRadius: 8,
                fontSize: 12,
              }}
              itemStyle={{ color: "#e9eef7" }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="mt-3 space-y-1.5">
        {dados.map((d, i) => (
          <li key={d.nome} className="flex items-center gap-2 text-xs text-corpo">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ background: PALETA[i % PALETA.length] }}
            />
            <span className="flex-1 truncate">{d.nome}</span>
            <span className="numero text-txt">{d.valor}</span>
          </li>
        ))}
        {!dados.length ? <li className="text-xs text-muted">Sem posts no período.</li> : null}
      </ul>
    </div>
  );
}

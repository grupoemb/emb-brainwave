import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { PALETA } from "@/lib/metricas";

export function DonutFormatos({ dados }: { dados: { nome: string; valor: number }[] }) {
  const total = dados.reduce((s, d) => s + d.valor, 0);

  return (
    <div className="cartao p-4">
      <span className="rotulo">Posts por formato</span>
      <p className="mt-1 text-xs text-muted">Como o volume do período se divide entre formatos.</p>

      <div className="relative mt-2 h-[210px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dados}
              dataKey="valor"
              nameKey="nome"
              innerRadius={58}
              outerRadius={86}
              paddingAngle={2}
              cornerRadius={4}
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

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="numero text-2xl text-txt">{total}</span>
          <span className="rotulo text-[.6rem]">posts</span>
        </div>
      </div>

      <ul className="mt-3 space-y-1.5">
        {dados.map((d, i) => (
          <li key={d.nome} className="flex items-center gap-2 text-xs text-corpo">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ background: PALETA[i % PALETA.length] }}
            />
            <span className="flex-1 truncate">{d.nome}</span>
            <span className="text-[.68rem] text-muted">
              {total ? Math.round((d.valor / total) * 100) : 0}%
            </span>
            <span className="numero w-6 text-right text-txt">{d.valor}</span>
          </li>
        ))}
        {!dados.length ? <li className="text-xs text-muted">Sem posts no período.</li> : null}
      </ul>
    </div>
  );
}

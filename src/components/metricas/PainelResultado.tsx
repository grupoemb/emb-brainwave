import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { Eye, TrendingDown, TrendingUp, Minus } from "lucide-react";

import { Medidor } from "@/components/metricas/Medidor";
import { compacto, classeVariacao, numero, textoVariacao, variacao, type Taxas } from "@/lib/metricas";

function Seta({ delta }: { delta: number | null }) {
  if (delta === null) return <Minus size={12} aria-hidden />;
  if (delta > 0) return <TrendingUp size={12} aria-hidden />;
  if (delta < 0) return <TrendingDown size={12} aria-hidden />;
  return <Minus size={12} aria-hidden />;
}

function Mini({
  rotulo,
  valor,
  sufixo,
  casas = 0,
  dica,
}: {
  rotulo: string;
  valor: number | null;
  sufixo?: string;
  casas?: number;
  dica: string;
}) {
  return (
    <div className="min-w-0" title={dica}>
      <p className="rotulo text-[.62rem]">{rotulo}</p>
      <p className="numero mt-0.5 text-base text-txt">
        {valor === null ? <span className="text-muted">—</span> : numero(valor, casas)}
        {valor !== null && sufixo ? <span className="text-corpo">{sufixo}</span> : null}
      </p>
    </div>
  );
}

/**
 * Nível 1 da hierarquia: resultado do período em bloco único —
 * número gigante, curva de alcance ao fundo e medidores de faixa.
 */
export function PainelResultado({
  taxas,
  taxasAnterior,
  rxMedio,
  serie,
  intervalo,
  rotuloComparacao,
  publicados,
}: {
  taxas: Taxas;
  taxasAnterior: Taxas | null;
  rxMedio: number | null;
  serie: { dia: string; alcance: number }[];
  intervalo: string;
  rotuloComparacao?: string | undefined;
  publicados: number;
}) {
  const delta = variacao(taxas.alcance, taxasAnterior?.alcance ?? null);

  return (
    <div className="cartao-alto relative overflow-hidden">
      {/* brilho de fundo, sem animação */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 -top-32 h-72 w-72 rounded-full opacity-[.16] blur-3xl"
        style={{ background: "radial-gradient(circle, var(--azure), transparent 68%)" }}
      />

      <div className="relative grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="pastilha" style={{ "--acento": "var(--azure)" } as React.CSSProperties}>
              <Eye size={13} />
            </span>
            <span className="rotulo">Alcance no período · {intervalo}</span>
          </div>

          <p className="numero grad mt-2 text-[2.75rem] leading-none sm:text-6xl">
            {taxas.alcance === null ? "—" : compacto(taxas.alcance)}
          </p>

          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            {taxasAnterior ? (
              <>
                <span className={"pill inline-flex items-center gap-1 " + classeVariacao(delta)}>
                  <Seta delta={delta} />
                  {textoVariacao(delta)}
                </span>
                <span className="text-muted">
                  vs {rotuloComparacao ?? "período anterior"} ({compacto(taxasAnterior.alcance)})
                </span>
              </>
            ) : (
              <span className="text-muted">ative a comparação para ver a variação</span>
            )}
            <span className="text-muted">
              · {publicados} {publicados === 1 ? "post" : "posts"}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Mini
              rotulo="Impressões"
              valor={taxas.impressoes}
              dica="Soma das impressões da leitura mais recente de cada post."
            />
            <Mini
              rotulo="Frequência"
              valor={taxas.frequencia}
              casas={2}
              sufixo="×"
              dica="Impressões ÷ alcance: quantas vezes, em média, cada pessoa viu."
            />
            <Mini
              rotulo="Alcance médio"
              valor={taxas.alcanceMedio}
              dica="Alcance total ÷ número de posts do período."
            />
            <Mini
              rotulo="Interações"
              valor={taxas.interacoes}
              dica="Curtidas + comentários + salvamentos + compartilhamentos."
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 rounded-[.8rem] border border-line bg-bg2/60 p-3 lg:w-[300px]">
          <Medidor
            rotulo="Engajamento"
            valor={taxas.engajamento}
            casas={2}
            sufixo="%"
            faixas={{ alerta: 1.5, bom: 3.5, max: 7 }}
            dica="Faixa de mercado: abaixo de 1,5% é fraco, acima de 3,5% é bom."
          />
          <Medidor
            rotulo="rx médio"
            valor={rxMedio}
            casas={2}
            sufixo="×"
            faixas={{ alerta: 1, bom: 1.3, max: 2.6 }}
            dica="Alcance do post ÷ mediana do formato. 1,00× é a mediana."
          />
          <Medidor
            rotulo="Taxa de acerto"
            valor={taxas.taxaAcerto}
            sufixo="%"
            faixas={{ alerta: 40, bom: 60, max: 100 }}
            dica="Percentual de posts com rx ≥ 1,00×."
          />
        </div>
      </div>

      {/* curva do período, colada na base do bloco */}
      <div className="relative h-[92px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={serie} margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="gradHero" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00e7ff" stopOpacity={0.38} />
                <stop offset="100%" stopColor="#00a4ff" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <XAxis dataKey="dia" hide />
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
              dataKey="alcance"
              stroke="#00e7ff"
              strokeWidth={2}
              fill="url(#gradHero)"
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

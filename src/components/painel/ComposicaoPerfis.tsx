import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import { compacto, numero } from "@/lib/metricas";
import type { ContaPainel, MixFormato } from "@/lib/painel.tipos";

const CORES = ["#00a4ff", "#3ecf8e", "#b06cff", "#f6bd24", "#00e7ff", "#ff7a6b"];

const ROTULO_FORMATO: Record<string, string> = {
  reel: "Reels",
  carousel: "Carrossel",
  image: "Imagem",
  story: "Story",
  video_long: "Vídeo longo",
  short: "Short",
  text: "Texto",
  article: "Artigo",
  other: "Outro",
  outro: "Outro",
};

const estiloTooltip = {
  background: "#121b2d",
  border: "1px solid rgba(148,163,184,.3)",
  borderRadius: ".6rem",
  fontSize: 12,
};

function Legenda({
  itens,
}: {
  itens: { rotulo: string; valor: number; pct: number; cor: string }[];
}) {
  return (
    <ul className="space-y-1.5">
      {itens.map((i) => (
        <li key={i.rotulo} className="flex items-center gap-2 text-xs">
          <span
            aria-hidden
            className="h-2.5 w-2.5 shrink-0 rounded-[.2rem]"
            style={{ backgroundColor: i.cor }}
          />
          <span className="min-w-0 flex-1 truncate text-corpo">{i.rotulo}</span>
          <span className="numero shrink-0 text-muted">{compacto(i.valor)}</span>
          <span className="numero w-11 shrink-0 text-right text-txt">{numero(i.pct, 1)}%</span>
        </li>
      ))}
    </ul>
  );
}

/** Todos: fatia de alcance por perfil. Perfil selecionado: mix de formatos. */
export function ComposicaoPerfis({
  contas,
  mix,
  perfil,
}: {
  contas: ContaPainel[];
  mix: MixFormato[];
  perfil: string | null;
}) {
  const base = perfil
    ? mix.map((m) => ({
        rotulo: ROTULO_FORMATO[m.formato] ?? m.formato,
        valor: m.alcance,
      }))
    : contas.map((c) => ({ rotulo: `@${c.conta}`, valor: c.alcance ?? 0 }));

  const itens = base
    .filter((i) => i.valor > 0)
    .sort((a, b) => b.valor - a.valor)
    .slice(0, 6);
  const total = itens.reduce((t, i) => t + i.valor, 0);
  const comCor = itens.map((i, idx) => ({
    ...i,
    cor: CORES[idx % CORES.length] as string,
    pct: total > 0 ? (i.valor / total) * 100 : 0,
  }));

  const titulo = perfil ? `Mix de formatos · @${perfil}` : "Quem puxa o alcance";

  return (
    <section className="cartao p-4">
      <h2 className="rotulo mb-3">{titulo}</h2>

      {comCor.length === 0 ? (
        <p className="text-xs text-muted">
          Sem alcance registrado nesta janela para montar a composição.
        </p>
      ) : (
        <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)]">
          <div className="h-[150px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={comCor}
                  dataKey="valor"
                  nameKey="rotulo"
                  innerRadius={44}
                  outerRadius={70}
                  paddingAngle={2}
                  stroke="none"
                >
                  {comCor.map((i) => (
                    <Cell key={i.rotulo} fill={i.cor} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={estiloTooltip}
                  formatter={(v: number, nome: string) => [compacto(v), nome]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3">
            <Legenda itens={comCor} />
            <div className="flex h-2 w-full overflow-hidden rounded-full">
              {comCor.map((i) => (
                <span
                  key={i.rotulo}
                  title={`${i.rotulo} · ${numero(i.pct, 1)}%`}
                  style={{ width: `${i.pct}%`, backgroundColor: i.cor }}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

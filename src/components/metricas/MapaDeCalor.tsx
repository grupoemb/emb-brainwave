import { Flame } from "lucide-react";

import { DIAS_SEMANA, FAIXAS_HORA, numero, type CelulaCalor } from "@/lib/metricas";

/** Escala azul → cyan → dourado conforme a intensidade (0–1). */
function corDaEscala(t: number) {
  const paradas: [number, [number, number, number]][] = [
    [0, [10, 30, 62]],
    [0.45, [0, 132, 208]],
    [0.78, [0, 231, 255]],
    [1, [242, 193, 78]],
  ];
  for (let i = 1; i < paradas.length; i++) {
    const [p1, c1] = paradas[i - 1]!;
    const [p2, c2] = paradas[i]!;
    if (t <= p2) {
      const k = p2 === p1 ? 0 : (t - p1) / (p2 - p1);
      const m = c1.map((v, j) => Math.round(v + (c2[j]! - v) * k));
      return `rgb(${m[0]},${m[1]},${m[2]})`;
    }
  }
  return "rgb(242,193,78)";
}

export function MapaDeCalor({
  grade,
  max,
  melhor,
}: {
  grade: CelulaCalor[];
  max: number;
  melhor: CelulaCalor | null;
}) {
  return (
    <div className="cartao p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <span className="rotulo">Quando publicar</span>
        {melhor ? (
          <span className="pill pill-alerta inline-flex items-center gap-1.5">
            <Flame size={11} aria-hidden />
            melhor janela: {DIAS_SEMANA[melhor.dia]} {FAIXAS_HORA[melhor.faixa]}h ·{" "}
            {numero(melhor.alcanceMedio)}
          </span>
        ) : (
          <span className="text-xs text-muted">sem publicações com alcance no período</span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted">
        Alcance médio por dia da semana e faixa de 3 horas (fuso de São Paulo). Quanto mais quente a
        cor, maior o alcance.
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[560px]">
          <div className="grid grid-cols-[42px_repeat(8,1fr)] gap-1">
            <span />
            {FAIXAS_HORA.map((f) => (
              <span key={f} className="text-center text-[.62rem] text-muted">
                {f}h
              </span>
            ))}

            {DIAS_SEMANA.map((dia, d) => (
              <Linha
                key={dia}
                dia={dia}
                d={d}
                grade={grade}
                max={max}
                melhor={melhor}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[.65rem] text-muted">
        <span>menor</span>
        <div
          className="h-2.5 w-32 rounded-full"
          style={{
            background: `linear-gradient(90deg, ${corDaEscala(0)}, ${corDaEscala(0.45)}, ${corDaEscala(0.78)}, ${corDaEscala(1)})`,
          }}
        />
        <span>maior alcance</span>
      </div>
    </div>
  );
}

function Linha({
  dia,
  d,
  grade,
  max,
  melhor,
}: {
  dia: string;
  d: number;
  grade: CelulaCalor[];
  max: number;
  melhor: CelulaCalor | null;
}) {
  return (
    <>
      <span className="flex items-center text-[.68rem] font-medium text-corpo">{dia}</span>
      {FAIXAS_HORA.map((_, f) => {
        const c = grade.find((x) => x.dia === d && x.faixa === f);
        const v = c?.alcanceMedio ?? null;
        const t = v && max > 0 ? Math.max(0.06, v / max) : 0;
        const eMelhor = !!melhor && melhor.dia === d && melhor.faixa === f;
        return (
          <div
            key={f}
            title={
              c && c.n
                ? `${dia} ${FAIXAS_HORA[f]}h · ${c.n} ${c.n === 1 ? "post" : "posts"} · ${numero(v)} de alcance médio`
                : `${dia} ${FAIXAS_HORA[f]}h · sem publicações`
            }
            className={
              "relative h-8 rounded-[.4rem] border transition-transform hover:scale-[1.06] " +
              (eMelhor ? "border-dourado" : "border-line/50")
            }
            style={{ background: t ? corDaEscala(t) : "rgba(255,255,255,.02)" }}
          >
            {eMelhor ? (
              <Flame
                size={11}
                className="absolute right-1 top-1 text-bg"
                aria-hidden
              />
            ) : null}
          </div>
        );
      })}
    </>
  );
}

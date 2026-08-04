import { DIAS_SEMANA, FAIXAS_HORA, numero, type CelulaCalor } from "@/lib/metricas";

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
        <span className="text-xs text-muted">
          {melhor
            ? `melhor janela: ${DIAS_SEMANA[melhor.dia]} ${FAIXAS_HORA[melhor.faixa]}h · ${numero(melhor.alcanceMedio)} de alcance médio`
            : "sem publicações com alcance no período"}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        Alcance médio por dia da semana e faixa de 3 horas (fuso de São Paulo).
      </p>

      <div className="mt-4 overflow-x-auto">
        <div className="min-w-[520px]">
          <div className="grid grid-cols-[38px_repeat(8,1fr)] gap-1">
            <span />
            {FAIXAS_HORA.map((f) => (
              <span key={f} className="text-center text-[.62rem] text-muted">
                {f}h
              </span>
            ))}

            {DIAS_SEMANA.map((dia, d) => (
              <ContentRow key={dia} dia={dia} d={d} grade={grade} max={max} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[.65rem] text-muted">
        <span>menor</span>
        <div className="h-2 w-24 rounded-full bg-gradient-to-r from-azure/8 to-azure" />
        <span>maior</span>
      </div>
    </div>
  );
}

function ContentRow({
  dia,
  d,
  grade,
  max,
}: {
  dia: string;
  d: number;
  grade: CelulaCalor[];
  max: number;
}) {
  return (
    <>
      <span className="flex items-center text-[.65rem] text-muted">{dia}</span>
      {FAIXAS_HORA.map((_, f) => {
        const c = grade.find((x) => x.dia === d && x.faixa === f);
        const v = c?.alcanceMedio ?? null;
        const intensidade = v && max > 0 ? Math.max(0.08, v / max) : 0;
        return (
          <div
            key={f}
            title={
              c && c.n
                ? `${dia} ${FAIXAS_HORA[f]}h · ${c.n} ${c.n === 1 ? "post" : "posts"} · ${numero(v)} de alcance médio`
                : `${dia} ${FAIXAS_HORA[f]}h · sem publicações`
            }
            className="h-7 rounded-[.35rem] border border-line/60"
            style={{
              background: intensidade ? `rgba(0,164,255,${intensidade.toFixed(3)})` : "transparent",
            }}
          />
        );
      })}
    </>
  );
}

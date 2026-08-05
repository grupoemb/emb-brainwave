import { compacto } from "@/lib/metricas";
import { dataCurta, percentual, ritmo, type Meta } from "@/lib/metas";

function Linha({
  rotulo,
  valor,
  cor,
  nota,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
  nota?: string;
}) {
  return (
    <div className="rounded-[.6rem] border border-line bg-bg2/60 px-3 py-2">
      <p className="rotulo text-[.58rem]">{rotulo}</p>
      <p className="numero mt-1 text-base" style={cor ? { color: cor } : undefined}>
        {valor}
      </p>
      {nota ? <p className="mt-0.5 text-[.68rem] text-muted">{nota}</p> : null}
    </div>
  );
}

export function BlocoPace({ meta }: { meta: Meta }) {
  const precisaMais = meta.required_run_rate > meta.run_rate && meta.days_left > 0;
  const noPrazo = meta.eta ? meta.eta <= meta.end_date : false;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 xl:grid-cols-4">
        <Linha rotulo="Ritmo atual" valor={ritmo(meta.run_rate)} />
        <Linha
          rotulo="Projeção"
          valor={compacto(meta.projected)}
          cor={meta.projected_pct >= 1 ? "#3ecf8e" : "#f6bd24"}
          nota={`${percentual(meta.projected_pct)} do alvo até ${dataCurta(meta.end_date)}`}
        />
        <Linha
          rotulo="Ritmo necessário"
          valor={meta.days_left > 0 ? ritmo(meta.required_run_rate) : "—"}
          cor={precisaMais ? "#ff7a6b" : "#3ecf8e"}
          nota={
            meta.days_left > 0
              ? precisaMais
                ? "acima do ritmo de agora"
                : "o ritmo de agora já basta"
              : "prazo encerrado"
          }
        />
        <Linha
          rotulo="vs. esperado hoje"
          valor={`${meta.ahead >= 0 ? "+" : "−"}${compacto(Math.abs(meta.ahead))}`}
          cor={meta.ahead >= 0 ? "#3ecf8e" : "#ff7a6b"}
          nota={`esperado ${compacto(meta.pace_expected)}`}
        />
      </div>
      <p className="text-xs text-muted">
        Faltam <span className="numero text-corpo">{meta.days_left}</span> dias ·{" "}
        {meta.eta ? (
          <>
            ETA{" "}
            <span className="numero" style={{ color: noPrazo ? "#3ecf8e" : "#f6bd24" }}>
              {dataCurta(meta.eta)}
            </span>
          </>
        ) : (
          <span className="text-muted">sem ETA no ritmo atual</span>
        )}
      </p>
    </div>
  );
}

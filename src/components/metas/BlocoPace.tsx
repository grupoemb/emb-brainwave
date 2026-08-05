import { compacto } from "@/lib/metricas";
import { dataCurta, percentual, ritmo, type Meta } from "@/lib/metas";

function Item({
  rotulo,
  valor,
  cor,
  dica,
}: {
  rotulo: string;
  valor: string;
  cor?: string;
  dica?: string;
}) {
  return (
    <div
      className="min-w-0 rounded-[.55rem] border border-line bg-bg2/50 px-2.5 py-1.5"
      title={dica ?? undefined}
    >
      <p className="rotulo truncate text-[.53rem]">{rotulo}</p>
      <p className="numero truncate text-sm" style={cor ? { color: cor } : undefined}>
        {valor}
      </p>
    </div>
  );
}

/** Faixa compacta de PACE: quatro números lado a lado, detalhe no tooltip. */
export function BlocoPace({ meta }: { meta: Meta }) {
  const precisaMais = meta.required_run_rate > meta.run_rate && meta.days_left > 0;

  return (
    <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
      <Item rotulo="Ritmo atual" valor={ritmo(meta.run_rate)} dica="Média entregue por dia até agora." />
      <Item
        rotulo="Projeção"
        valor={compacto(meta.projected)}
        cor={meta.projected_pct >= 1 ? "#3ecf8e" : "#f6bd24"}
        dica={`${percentual(meta.projected_pct)} do alvo até ${dataCurta(meta.end_date)} mantendo o ritmo atual.`}
      />
      <Item
        rotulo="Precisa/dia"
        valor={meta.days_left > 0 ? ritmo(meta.required_run_rate) : "—"}
        cor={precisaMais ? "#ff7a6b" : "#3ecf8e"}
        dica={
          meta.days_left > 0
            ? precisaMais
              ? "Acima do ritmo de agora."
              : "O ritmo de agora já basta."
            : "Prazo encerrado."
        }
      />
      <Item
        rotulo="vs. hoje"
        valor={`${meta.ahead >= 0 ? "+" : "−"}${compacto(Math.abs(meta.ahead))}`}
        cor={meta.ahead >= 0 ? "#3ecf8e" : "#ff7a6b"}
        dica={`Esperado até hoje: ${compacto(meta.pace_expected)}.`}
      />
    </div>
  );
}

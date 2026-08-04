import type { Meta } from "@/lib/benchmark";
import { numero } from "@/lib/metricas";

function progresso(atual: number | null, alvo: number | null) {
  if (atual === null || alvo === null || alvo <= 0) return null;
  return Math.max(0, Math.min(100, (atual / alvo) * 100));
}

export function MetasSugeridas({ metas }: { metas: Meta[] }) {
  return (
    <div className="cartao p-4">
      <span className="rotulo">Metas sugeridas para o próximo ciclo</span>
      <p className="mt-1 text-xs text-muted">
        Calculadas a partir do seu próprio histórico e das referências de mercado.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {metas.map((m) => {
          const p = progresso(m.atual, m.alvo);
          const falta =
            m.atual === null || m.alvo === null ? null : Math.max(0, m.alvo - m.atual);
          const batido = p !== null && p >= 100;
          return (
            <div key={m.chave} className="rounded-[.7rem] border border-line p-3">
              <span className="block text-xs text-corpo">{m.rotulo}</span>
              <div className="mt-1.5 flex items-baseline gap-1.5">
                <span className="numero text-lg text-txt">
                  {numero(m.atual, m.casas)}
                  {m.atual === null ? "" : m.sufixo}
                </span>
                <span className="text-xs text-muted">→</span>
                <span className="numero text-sm text-azureClaro">
                  {numero(m.alvo, m.casas)}
                  {m.alvo === null ? "" : m.sufixo}
                </span>
              </div>

              <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/6">
                <div
                  className={
                    "h-full rounded-full " +
                    (batido ? "bg-bom" : "bg-gradient-to-r from-royal to-azure")
                  }
                  style={{ width: `${p ?? 0}%` }}
                />
              </div>

              <p className="mt-2 text-[.68rem] text-muted">
                {p === null
                  ? "Sem base para medir ainda."
                  : batido
                    ? "Meta batida — hora de subir a régua."
                    : `Faltam ${numero(falta, m.casas)}${m.sufixo} para o alvo.`}
              </p>
              <p className="mt-1 text-[.68rem] text-muted">{m.logica}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

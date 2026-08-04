import { Sparkles } from "lucide-react";

import { classeRx, numero, rotuloFormato } from "@/lib/metricas";
import { comAlfa } from "@/lib/conteudo";
import type { Sugestao, TipoSugestao } from "@/lib/inteligencia.functions";

const TIPOS: Record<TipoSugestao, { rotulo: string; cor: string }> = {
  theme: { rotulo: "Pauta", cor: "#00a4ff" },
  format: { rotulo: "Formato", cor: "#a78bfa" },
  timing: { rotulo: "Horário", cor: "#f6bd24" },
  improvement: { rotulo: "Melhoria", cor: "#00e7ff" },
  pillar_alert: { rotulo: "Alerta", cor: "#ff7a6b" },
};

/** Texto relativo simples: "há 3d". */
export function haQuanto(ts: number | null) {
  if (!ts) return "sem rodada ainda";
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return `há ${s}s`;
  if (s < 3600) return `há ${Math.round(s / 60)}min`;
  if (s < 86_400) return `há ${Math.round(s / 3600)}h`;
  return `há ${Math.round(s / 86_400)}d`;
}

function PillTrilha({
  ativa,
  classe = "",
  children,
}: {
  ativa: boolean;
  classe?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={
        "pill " +
        (classe || (ativa ? "bg-white/8 text-corpo" : "bg-white/4 text-muted opacity-60"))
      }
    >
      {children}
    </span>
  );
}

export function TrilhaLoop({ s }: { s: Sugestao }) {
  const virouPost = !!s.converted_post_id;
  const temRx = s.rx !== null;

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <PillTrilha ativa>nova</PillTrilha>
      <span className="text-[.65rem] text-muted">→</span>
      <PillTrilha ativa={virouPost}>virou post</PillTrilha>
      <span className="text-[.65rem] text-muted">→</span>
      <PillTrilha ativa={s.publicada}>publicada</PillTrilha>
      <span className="text-[.65rem] text-muted">→</span>
      {temRx ? (
        <span className={"pill " + (classeRx(s.rx) || "bg-white/8 text-corpo")}>
          <span className="numero">{numero(s.rx, 2)}×</span>
        </span>
      ) : (
        <PillTrilha ativa={false}>aguardando métricas</PillTrilha>
      )}
    </div>
  );
}

export function CartaoPauta({
  s,
  onAceitar,
  onDescartar,
  ocupado,
}: {
  s: Sugestao;
  onAceitar: () => void;
  onDescartar: () => void;
  ocupado: boolean;
}) {
  const tipo = TIPOS[s.kind] ?? { rotulo: s.kind, cor: "#8294ab" };

  return (
    <article
      className="cartao interativo space-y-2.5 p-4"
      style={{ borderLeft: "2px solid rgba(0, 164, 255, .6)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-center gap-1.5">
          <Sparkles size={12} className="text-azureClaro" />
          <span
            className="pill"
            style={{ color: tipo.cor, background: comAlfa(tipo.cor, 0.13) }}
          >
            {tipo.rotulo}
          </span>
        </span>
        <span className="numero text-sm text-corpo">{numero(s.priority, 1)}</span>
      </div>

      <h2 className="text-sm font-bold text-txt">{s.title}</h2>

      {s.rationale && <p className="text-xs text-muted">{s.rationale}</p>}

      <div className="flex flex-wrap items-center gap-2 pt-1">
        <span className="text-xs text-muted">{rotuloFormato(s.suggested_format)}</span>
        {s.pilar_nome && (
          <span
            className="pill"
            style={{
              color: s.pilar_cor ?? "#b9c6d8",
              background: comAlfa(s.pilar_cor ?? "#8294ab", 0.13),
            }}
          >
            {s.pilar_nome}
          </span>
        )}
        <TrilhaLoop s={s} />
      </div>

      {s.status === "new" && (
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            className="btn-primario disabled:opacity-60"
            disabled={ocupado}
            onClick={onAceitar}
          >
            Aceitar
          </button>
          <button type="button" className="btn disabled:opacity-60" disabled={ocupado} onClick={onDescartar}>
            Descartar
          </button>
        </div>
      )}
    </article>
  );
}

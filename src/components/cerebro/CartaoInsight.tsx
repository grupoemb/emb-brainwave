import { Sparkles } from "lucide-react";

import type { Insight } from "@/lib/inteligencia.functions";

const STATUS: Record<Insight["status"], { rotulo: string; classe: string }> = {
  active: { rotulo: "Ativo", classe: "pill-bom" },
  weakening: { rotulo: "Enfraquecendo", classe: "pill-alerta" },
  refuted: { rotulo: "Refutado", classe: "pill-ruim" },
};

export function CartaoInsight({ i }: { i: Insight }) {
  const st = STATUS[i.status] ?? STATUS.active;
  const largura = Math.max(0, Math.min(1, i.strength)) * 100;

  return (
    <article
      className="cartao space-y-2.5 p-4"
      style={{ borderLeft: "2px solid rgba(0, 164, 255, .6)" }}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="flex items-start gap-1.5">
          <Sparkles size={12} className="mt-0.5 shrink-0 text-azureClaro" />
          <p className="text-sm text-txt">{i.statement}</p>
        </span>
        <span className={"pill shrink-0 " + st.classe}>{st.rotulo}</span>
      </div>

      <div className="h-1 w-full overflow-hidden rounded-full bg-white/6">
        <div
          className="h-full rounded-full"
          style={{
            width: `${largura}%`,
            backgroundImage: "linear-gradient(100deg, var(--royal), var(--azure))",
          }}
        />
      </div>

      {i.evidencia && <p className="line-clamp-2 text-xs text-muted">{i.evidencia}</p>}
    </article>
  );
}

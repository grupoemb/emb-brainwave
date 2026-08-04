import { Search, X } from "lucide-react";

import { comAlfa } from "@/lib/conteudo";
import type { TipoSugestao } from "@/lib/inteligencia.functions";

export const TIPOS_FILTRO: { valor: TipoSugestao | "todos"; rotulo: string }[] = [
  { valor: "todos", rotulo: "Todos" },
  { valor: "theme", rotulo: "Pauta" },
  { valor: "improvement", rotulo: "Melhoria" },
  { valor: "format", rotulo: "Formato" },
  { valor: "timing", rotulo: "Horário" },
  { valor: "pillar_alert", rotulo: "Alerta" },
];

export function Chip({
  ativo,
  onClick,
  cor,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  cor?: string | null;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={
        ativo && cor ? { backgroundColor: comAlfa(cor, 0.14), borderColor: comAlfa(cor, 0.4) } : {}
      }
      className={
        "h-[30px] shrink-0 rounded-[8px] border px-3 text-xs transition-colors " +
        (ativo
          ? "border-azure/40 bg-azure/14 font-semibold text-txt"
          : "border-line text-muted hover:text-corpo")
      }
    >
      {children}
    </button>
  );
}

export type EstadoFiltros = {
  q: string;
  status: string;
  tipo: string;
  pilar: string;
};

export function FiltrosPautas({
  filtros,
  definir,
  limpar,
  contagemStatus,
  contagemTipo,
  pilares,
  total,
  temFiltroExtra,
}: {
  filtros: EstadoFiltros;
  definir: (p: Partial<EstadoFiltros>) => void;
  limpar: () => void;
  contagemStatus: Record<string, number>;
  contagemTipo: Record<string, number>;
  pilares: { id: string; nome: string; cor: string | null }[];
  total: number;
  temFiltroExtra: boolean;
}) {
  return (
    <div className="secao-entrada space-y-2">
      <div className="relative max-w-md">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
        <input
          value={filtros.q}
          onChange={(e) => definir({ q: e.target.value })}
          placeholder="Buscar por título ou pelo porquê…"
          aria-label="Buscar pautas"
          className="h-[34px] w-full rounded-[8px] border border-line bg-bg2 pl-9 pr-8 text-xs text-txt outline-none placeholder:text-muted focus:border-azure/40 focus:ring-2 focus:ring-azure/30"
        />
        {filtros.q ? (
          <button
            type="button"
            onClick={() => definir({ q: "" })}
            aria-label="Limpar busca"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted hover:text-corpo"
          >
            <X size={13} />
          </button>
        ) : null}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {[
          { valor: "new", rotulo: "Novas" },
          { valor: "accepted", rotulo: "Aceitas" },
          { valor: "dismissed", rotulo: "Descartadas" },
        ].map((f) => (
          <Chip
            key={f.valor}
            ativo={filtros.status === f.valor}
            onClick={() => definir({ status: f.valor })}
          >
            {f.rotulo} ({contagemStatus[f.valor] ?? 0})
          </Chip>
        ))}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {TIPOS_FILTRO.map((t) => (
          <Chip
            key={t.valor}
            ativo={filtros.tipo === t.valor}
            onClick={() => definir({ tipo: t.valor })}
          >
            {t.rotulo} ({contagemTipo[t.valor] ?? 0})
          </Chip>
        ))}
      </div>

      {pilares.length > 0 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          <Chip ativo={filtros.pilar === "todos"} onClick={() => definir({ pilar: "todos" })}>
            Todos os pilares
          </Chip>
          {pilares.map((p) => (
            <Chip
              key={p.id}
              ativo={filtros.pilar === p.id}
              cor={p.cor}
              onClick={() => definir({ pilar: p.id })}
            >
              {p.nome}
            </Chip>
          ))}
        </div>
      ) : null}

      {temFiltroExtra ? (
        <div className="flex items-center gap-3 text-xs text-muted">
          <span>
            <span className="numero">{total}</span> {total === 1 ? "pauta" : "pautas"}
          </span>
          <button type="button" onClick={limpar} className="text-corpo hover:text-txt">
            Limpar filtros
          </button>
        </div>
      ) : null}
    </div>
  );
}

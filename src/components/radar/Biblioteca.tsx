import { useMemo, useState } from "react";
import { Plus, Search, Sparkles } from "lucide-react";

import { CartaoItem } from "@/components/radar/CartaoItem";
import { DialogoItemManual } from "@/components/radar/DialogoItemManual";
import { useBiblioteca } from "@/hooks/useBiblioteca";
import { useOrg } from "@/hooks/useOrg";
import {
  LIMITE_VX_BOM,
  ROTULO_GANCHO,
  type InsightsBiblioteca,
  type LinhaInsight,
} from "@/lib/biblioteca";
import { numero } from "@/lib/metricas";

type Ordem = "vx" | "views" | "recentes";

const ORDENS: { valor: Ordem; rotulo: string }[] = [
  { valor: "vx", rotulo: "vx" },
  { valor: "views", rotulo: "views" },
  { valor: "recentes", rotulo: "mais recentes" },
];

function Chip({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
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

function BlocoInsight({ titulo, linhas }: { titulo: string; linhas: LinhaInsight[] }) {
  return (
    <div>
      <p className="rotulo mb-2">{titulo}</p>
      {linhas.length === 0 ? (
        <p className="text-xs text-muted">sem dados ainda</p>
      ) : (
        <ul className="space-y-1.5">
          {linhas.slice(0, 6).map((l) => (
            <li key={l.rotulo} className="flex items-center gap-2 text-sm text-corpo">
              <span className="flex-1 truncate">{l.rotulo}</span>
              <span className="numero text-xs text-muted">{numero(l.n)}</span>
              <span
                className={
                  "numero text-xs " +
                  (l.vx_medio !== null && l.vx_medio >= LIMITE_VX_BOM ? "text-bom" : "text-corpo")
                }
              >
                {l.vx_medio === null ? "—" : `${numero(l.vx_medio, 2)}×`}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function PainelInsights({ insights }: { insights: InsightsBiblioteca }) {
  return (
    <div className="cartao border-l-2 border-l-azure p-4">
      <h2 className="rotulo mb-3 flex items-center gap-1.5">
        <Sparkles size={12} className="text-azureClaro" />O que a sua biblioteca ensina
      </h2>
      <div className="grid gap-5 sm:grid-cols-3">
        <BlocoInsight titulo="Por gancho" linhas={insights.porGancho} />
        <BlocoInsight titulo="Por duração" linhas={insights.porDuracao} />
        <BlocoInsight titulo="Por nicho" linhas={insights.porNicho} />
      </div>
    </div>
  );
}

export function Biblioteca() {
  const { itens, carregando, insights } = useBiblioteca();
  const { podeEditarMarca } = useOrg();

  const [nicho, setNicho] = useState("todos");
  const [perfil, setPerfil] = useState("todos");
  const [gancho, setGancho] = useState("todos");
  const [busca, setBusca] = useState("");
  const [ordem, setOrdem] = useState<Ordem>("vx");
  const [dialogo, setDialogo] = useState(false);

  const nichos = useMemo(
    () => [...new Set(itens.map((i) => i.niche).filter(Boolean))] as string[],
    [itens],
  );
  const perfis = useMemo(
    () => [...new Set(itens.map((i) => i.creator_handle).filter(Boolean))] as string[],
    [itens],
  );
  const ganchos = useMemo(
    () => [...new Set(itens.map((i) => i.hook_type).filter(Boolean))] as string[],
    [itens],
  );

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    const lista = itens.filter((i) => {
      if (nicho !== "todos" && i.niche !== nicho) return false;
      if (perfil !== "todos" && i.creator_handle !== perfil) return false;
      if (gancho !== "todos" && i.hook_type !== gancho) return false;
      if (!q) return true;
      const alvo = [i.headline, i.hook_text, i.note, i.theme, (i.tags ?? []).join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return alvo.includes(q);
    });

    return lista.sort((a, b) => {
      if (ordem === "views") return Number(b.views ?? 0) - Number(a.views ?? 0);
      if (ordem === "recentes") return b.created_at.localeCompare(a.created_at);
      return Number(b.vx ?? 0) - Number(a.vx ?? 0);
    });
  }, [itens, nicho, perfil, gancho, busca, ordem]);

  const temFiltro = nicho !== "todos" || perfil !== "todos" || gancho !== "todos" || !!busca.trim();

  return (
    <div className="space-y-4">
      {insights && insights.total > 0 ? <PainelInsights insights={insights} /> : null}

      <div className="cartao space-y-3 p-4">
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative min-w-[12rem] flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por headline, gancho ou tag…"
              className="h-[30px] w-full rounded-[8px] border border-line bg-bg2 pl-8 pr-3 text-xs text-txt placeholder:text-muted focus:border-azure/50 focus:outline-none"
            />
          </div>
          <button
            type="button"
            className="btn-primario flex items-center gap-1.5 px-3 py-1.5 text-xs"
            onClick={() => setDialogo(true)}
          >
            <Plus size={13} />
            Adicionar item
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rotulo">Nicho</span>
          <Chip ativo={nicho === "todos"} onClick={() => setNicho("todos")}>
            todos
          </Chip>
          {nichos.map((n) => (
            <Chip key={n} ativo={nicho === n} onClick={() => setNicho(n)}>
              {n}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rotulo">Perfil</span>
          <Chip ativo={perfil === "todos"} onClick={() => setPerfil("todos")}>
            todos
          </Chip>
          {perfis.map((p) => (
            <Chip key={p} ativo={perfil === p} onClick={() => setPerfil(p)}>
              @{p}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rotulo">Gancho</span>
          <Chip ativo={gancho === "todos"} onClick={() => setGancho("todos")}>
            todos
          </Chip>
          {ganchos.map((g) => (
            <Chip key={g} ativo={gancho === g} onClick={() => setGancho(g)}>
              {ROTULO_GANCHO[g] ?? g}
            </Chip>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="rotulo">Ordenar</span>
          {ORDENS.map((o) => (
            <Chip key={o.valor} ativo={ordem === o.valor} onClick={() => setOrdem(o.valor)}>
              {o.rotulo}
            </Chip>
          ))}
        </div>
      </div>

      {carregando ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cartao animate-pulse space-y-3 p-4">
              <div className="aspect-video w-full rounded-[.6rem] bg-white/6" />
              <div className="h-3 w-2/3 rounded bg-white/6" />
              <div className="h-3 w-1/2 rounded bg-white/6" />
            </div>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="cartao p-8 text-center text-sm text-muted">
          {temFiltro ? (
            <>
              Nenhum item com esse recorte.{" "}
              <button
                type="button"
                className="text-azureClaro hover:underline"
                onClick={() => {
                  setNicho("todos");
                  setPerfil("todos");
                  setGancho("todos");
                  setBusca("");
                }}
              >
                limpar filtros
              </button>
            </>
          ) : (
            "Sua biblioteca está vazia. No Radar, adicione os reels que valem estudar."
          )}
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((i) => (
            <CartaoItem key={i.id} item={i} podeRemover={podeEditarMarca} />
          ))}
        </div>
      )}

      <DialogoItemManual aberto={dialogo} aoFechar={() => setDialogo(false)} />
    </div>
  );
}

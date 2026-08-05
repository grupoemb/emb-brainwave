import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { ChevronDown, Flame, Trash2 } from "lucide-react";

import { useRemoverItem } from "@/hooks/useBiblioteca";
import {
  faixaDuracao,
  lerAnalise,
  LIMITE_VX_BOM,
  LIMITE_VX_FLAME,
  ROTULO_GANCHO,
  type ItemBiblioteca,
} from "@/lib/biblioteca";
import { compacto, numero } from "@/lib/metricas";

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-[8px] border border-line px-2 py-0.5 text-[.68rem] text-muted">
      {children}
    </span>
  );
}

export function CartaoItem({ item, podeRemover }: { item: ItemBiblioteca; podeRemover: boolean }) {
  const [aberto, setAberto] = useState(false);
  const navigate = useNavigate();
  const remover = useRemoverItem();
  const analise = lerAnalise(item.analysis);
  const vx = item.vx === null ? null : Number(item.vx);
  const bom = vx !== null && vx >= LIMITE_VX_BOM;

  function usarPadrao() {
    const receita = analise.reproduction_recipe || item.headline || item.hook_text || "";
    void navigate({
      to: "/criar",
      search: {
        tipo: "carousel",
        brief: "Reproduza a mecânica deste padrão em um novo tema: " + receita,
      },
    });
  }

  return (
    <div className="cartao flex flex-col gap-3 p-4">
      <div className="relative aspect-video w-full overflow-hidden rounded-[.6rem] bg-bg2">
        {item.cover_url ? (
          <img
            src={item.cover_url}
            alt={item.headline ?? "Capa do reel"}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted">sem capa</div>
        )}
        <span
          className={
            "pill numero absolute right-2 top-2 flex items-center gap-1 " +
            (bom ? "pill-bom" : "bg-black/60 text-corpo")
          }
        >
          {vx === null ? "—" : `${numero(vx, 2)}×`}
          {vx !== null && vx >= LIMITE_VX_FLAME ? <Flame size={11} color="#f6bd24" /> : null}
        </span>
      </div>

      <div className="space-y-2">
        {item.url ? (
          <a
            href={item.url}
            target="_blank"
            rel="noreferrer"
            className="block text-sm font-bold hover:underline"
          >
            {item.headline || "Sem headline"}
          </a>
        ) : (
          <p className="text-sm font-bold">{item.headline || "Sem headline"}</p>
        )}

        <div className="flex flex-wrap gap-1.5">
          {item.niche ? <Chip>{item.niche}</Chip> : null}
          {item.creator_handle ? <Chip>@{item.creator_handle}</Chip> : null}
          <Chip>{faixaDuracao(item.duration_s)}</Chip>
          {item.hook_type ? <Chip>{ROTULO_GANCHO[item.hook_type] ?? item.hook_type}</Chip> : null}
        </div>

        {item.hook_text ? <p className="text-xs text-muted">{item.hook_text}</p> : null}

        <div className="flex items-center gap-4">
          <span className="numero text-xs text-corpo">
            {compacto(item.views)} <span className="text-muted">views</span>
          </span>
          <span className="numero text-xs text-corpo">
            {numero(item.comments)} <span className="text-muted">coment.</span>
          </span>
        </div>

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1">
            {item.tags.map((t) => (
              <span key={t} className="pill bg-white/6 text-[.68rem] text-corpo">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      <div className="mt-auto space-y-2">
        <button
          type="button"
          onClick={() => setAberto((v) => !v)}
          className="flex w-full items-center justify-between text-xs text-azureClaro hover:underline"
        >
          Ver análise
          <ChevronDown
            size={13}
            className={"transition-transform " + (aberto ? "rotate-180" : "")}
          />
        </button>

        {aberto ? (
          analise.pendente ? (
            <p className="text-xs text-muted">Análise em processamento</p>
          ) : (
            <div className="prosa border-l-2 border-azure/60 pl-3 text-xs">
              {analise.mechanics ? (
                <p>
                  <strong>Mecânica:</strong> {analise.mechanics}
                </p>
              ) : null}
              {analise.why_it_works ? (
                <p>
                  <strong>Por que funciona:</strong> {analise.why_it_works}
                </p>
              ) : null}
              {analise.reproduction_recipe ? (
                <p>
                  <strong>Receita:</strong> {analise.reproduction_recipe}
                </p>
              ) : null}
              {!analise.mechanics && !analise.why_it_works && !analise.reproduction_recipe ? (
                <p className="text-muted">Sem análise para este item ainda.</p>
              ) : null}
            </div>
          )
        ) : null}

        <div className="flex items-center gap-2">
          <button type="button" className="btn-primario flex-1 px-3 py-1.5 text-xs" onClick={usarPadrao}>
            Usar este padrão
          </button>
          {podeRemover ? (
            <button
              type="button"
              className="btn !p-1.5 disabled:opacity-60"
              aria-label="Remover da biblioteca"
              title="Remover da biblioteca"
              disabled={remover.isPending}
              onClick={() => remover.mutate(item.id)}
            >
              <Trash2 size={14} />
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
